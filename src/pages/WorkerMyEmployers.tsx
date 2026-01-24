import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  ArrowLeft,
  Phone,
  MapPin,
  CalendarDays,
  Timer,
  TrendingUp,
  IndianRupee,
  User as UserIcon
} from 'lucide-react';
import { WorkerNavbar } from '@/components/WorkerNavbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';

interface Owner {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
}

interface HiredRecord {
  id: string;
  owner_id: string;
  worker_id: string;
  hired_date: string;
  agreed_salary: number;
  salary_frequency: string;
  status: string;
  notes: string | null;
  owner?: Owner;
}

interface AttendanceRecord {
  id: string;
  hired_worker_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: string;
  leave_type: string | null;
  notes: string | null;
}

interface EmployerStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateDays: number;
  attendancePercentage: number;
}

const WorkerMyEmployers = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [hiredRecords, setHiredRecords] = useState<HiredRecord[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceRecord[]>>({});
  const [employerStats, setEmployerStats] = useState<Record<string, EmployerStats>>({});
  const [loading, setLoading] = useState(true);
  const [selectedEmployer, setSelectedEmployer] = useState<string | null>(null);
  const [workerId, setWorkerId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/for-workers/auth');
      return;
    }
    
    if (user) {
      fetchWorkerAndEmployers();
    }
  }, [user, authLoading, navigate]);

  const fetchWorkerAndEmployers = async () => {
    try {
      setLoading(true);
      
      // First get worker_id from worker_auth
      const { data: workerAuth, error: authError } = await supabase
        .from('worker_auth')
        .select('worker_id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (authError) throw authError;
      if (!workerAuth?.worker_id) {
        setLoading(false);
        return;
      }

      setWorkerId(workerAuth.worker_id);

      // Fetch hired records for this worker
      const { data: hiredData, error: hiredError } = await supabase
        .from('hired_workers')
        .select('*')
        .eq('worker_id', workerAuth.worker_id)
        .eq('status', 'active')
        .order('hired_date', { ascending: false });

      if (hiredError) throw hiredError;

      // Fetch owner profiles for the hired records
      const ownerIds = (hiredData || []).map(hw => hw.owner_id);
      let ownersMap: Record<string, Owner> = {};

      if (ownerIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, phone, address')
          .in('id', ownerIds);

        if (!profilesError && profiles) {
          profiles.forEach(p => {
            ownersMap[p.id] = p;
          });
        }
      }

      // Attach owner data to hired records
      const recordsWithOwners = (hiredData || []).map(hr => ({
        ...hr,
        owner: ownersMap[hr.owner_id]
      })) as HiredRecord[];

      setHiredRecords(recordsWithOwners);

      // Fetch attendance for all hired records
      const hiredIds = recordsWithOwners.map(hr => hr.id);
      
      if (hiredIds.length > 0) {
        const { data: attendanceRecords, error: attendanceError } = await supabase
          .from('worker_attendance')
          .select('*')
          .in('hired_worker_id', hiredIds)
          .order('date', { ascending: false });

        if (attendanceError) throw attendanceError;

        // Group attendance by hired_worker_id
        const attendanceMap: Record<string, AttendanceRecord[]> = {};
        (attendanceRecords || []).forEach(record => {
          if (!attendanceMap[record.hired_worker_id]) {
            attendanceMap[record.hired_worker_id] = [];
          }
          attendanceMap[record.hired_worker_id].push(record);
        });

        setAttendanceData(attendanceMap);

        // Calculate stats for each employer
        const statsMap: Record<string, EmployerStats> = {};
        
        recordsWithOwners.forEach(hr => {
          const records = attendanceMap[hr.id] || [];
          const now = new Date();
          const hiredDate = new Date(hr.hired_date);
          const daysSinceHired = Math.ceil((now.getTime() - hiredDate.getTime()) / (1000 * 60 * 60 * 24));
          
          const presentDays = records.filter(r => r.status === 'present').length;
          const absentDays = records.filter(r => r.status === 'absent').length;
          const leaveDays = records.filter(r => r.status === 'leave' || r.leave_type).length;
          const lateDays = records.filter(r => r.status === 'late').length;
          
          const totalDays = Math.max(daysSinceHired, records.length);
          const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

          statsMap[hr.id] = {
            totalDays,
            presentDays,
            absentDays,
            leaveDays,
            lateDays,
            attendancePercentage
          };
        });

        setEmployerStats(statsMap);
      }
    } catch (error) {
      console.error('Error fetching employers:', error);
      toast({
        title: "Error",
        description: "Failed to load employer data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'inactive':
        return 'bg-muted text-muted-foreground border-border';
      case 'terminated':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-success/10 text-success';
      case 'absent':
        return 'bg-destructive/10 text-destructive';
      case 'late':
        return 'bg-amber-100 text-amber-800';
      case 'leave':
        return 'bg-blue-100 text-blue-800';
      case 'half_day':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <WorkerNavbar />
      <main className="px-4 sm:px-8 lg:px-16 py-6 sm:py-12 lg:py-16 pt-20 sm:pt-24 pb-24 sm:pb-32">
        <div className="container-main">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/for-workers/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('backToDashboard') || 'Back to Dashboard'}
              </Button>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                {t('myEmployers') || 'My Employers'}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {t('myEmployersDesc') || 'View your employment records, attendance, and earnings with each employer'}
              </p>
            </div>
          </motion.div>

          {hiredRecords.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl p-12 text-center shadow-soft"
            >
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('noEmployersYet') || 'No Employers Yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('noEmployersDesc') || 'Once you get hired by an owner, they will appear here.'}
              </p>
              <Button onClick={() => navigate('/for-workers/dashboard')} className="gap-2">
                {t('goToDashboard') || 'Go to Dashboard'}
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {hiredRecords.map((record, index) => {
                const stats = employerStats[record.id] || {
                  totalDays: 0,
                  presentDays: 0,
                  absentDays: 0,
                  leaveDays: 0,
                  lateDays: 0,
                  attendancePercentage: 0
                };
                const attendance = attendanceData[record.id] || [];
                const recentAttendance = attendance.slice(0, 10);

                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-2xl p-6 shadow-soft"
                  >
                    {/* Employer Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-foreground">
                              {record.owner?.full_name || 'Employer'}
                            </h3>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            {record.owner?.phone && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                <span>{record.owner.phone}</span>
                              </div>
                            )}
                            {record.owner?.address && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate max-w-xs">{record.owner.address}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>Since {new Date(record.hired_date).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{t('salary') || 'Salary'}</p>
                        <p className="text-lg font-bold text-foreground flex items-center gap-1 justify-end">
                          <IndianRupee className="w-4 h-4" />
                          {record.agreed_salary.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {record.salary_frequency}
                        </p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-muted/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm text-muted-foreground">{t('present') || 'Present'}</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stats.presentDays}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-destructive" />
                          <span className="text-sm text-muted-foreground">{t('absent') || 'Absent'}</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stats.absentDays}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarDays className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-muted-foreground">{t('leaves') || 'Leaves'}</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stats.leaveDays}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Timer className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-muted-foreground">{t('late') || 'Late'}</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stats.lateDays}</p>
                      </div>
                    </div>

                    {/* Attendance Percentage */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          {t('attendanceRate') || 'Attendance Rate'}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {stats.attendancePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all ${
                            stats.attendancePercentage >= 90 ? 'bg-success' :
                            stats.attendancePercentage >= 75 ? 'bg-blue-500' :
                            stats.attendancePercentage >= 60 ? 'bg-amber-500' :
                            'bg-destructive'
                          }`}
                          style={{ width: `${Math.min(stats.attendancePercentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Recent Attendance */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-foreground">{t('recentAttendance') || 'Recent Attendance'}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEmployer(
                            selectedEmployer === record.id ? null : record.id
                          )}
                        >
                          {selectedEmployer === record.id ? (t('showLess') || 'Show Less') : (t('viewAll') || 'View All')}
                        </Button>
                      </div>
                      
                      {attendance.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No attendance records yet
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {(selectedEmployer === record.id ? attendance : recentAttendance).map((att) => (
                            <div
                              key={att.id}
                              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">
                                  {new Date(att.date).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    weekday: 'short'
                                  })}
                                </span>
                                {att.clock_in && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>{att.clock_in}</span>
                                    {att.clock_out && <span> - {att.clock_out}</span>}
                                  </div>
                                )}
                              </div>
                              <Badge className={getAttendanceStatusColor(att.status)}>
                                {att.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WorkerMyEmployers;
