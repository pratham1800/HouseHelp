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
  TrendingUp,
  TrendingDown,
  User as UserIcon,
  CalendarDays,
  Timer
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Worker {
  id: string;
  name: string;
  phone: string;
  work_type: string;
  years_experience: number | null;
  preferred_areas: string[] | null;
  residential_address: string | null;
}

interface HiredWorker {
  id: string;
  owner_id: string;
  worker_id: string;
  hired_date: string;
  agreed_salary: number;
  salary_frequency: string;
  status: string;
  notes: string | null;
  worker: Worker;
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

interface EmployeeStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateDays: number;
  halfDays: number;
  attendancePercentage: number;
}

const MyEmployees = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [hiredWorkers, setHiredWorkers] = useState<HiredWorker[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceRecord[]>>({});
  const [employeeStats, setEmployeeStats] = useState<Record<string, EmployeeStats>>({});
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/dashboard');
      return;
    }
    
    if (user) {
      fetchEmployees();
    }
  }, [user, authLoading, navigate]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Fetch hired workers with worker details
      const { data: hiredData, error: hiredError } = await supabase
        .from('hired_workers')
        .select(`
          *,
          worker:workers!hired_workers_worker_id_fkey (
            id,
            name,
            phone,
            work_type,
            years_experience,
            preferred_areas,
            residential_address
          )
        `)
        .eq('owner_id', user!.id)
        .eq('status', 'active')
        .order('hired_date', { ascending: false });

      if (hiredError) throw hiredError;

      const workers = (hiredData || []).map(hw => ({
        ...hw,
        worker: Array.isArray(hw.worker) ? hw.worker[0] : hw.worker
      })) as HiredWorker[];

      setHiredWorkers(workers);

      // Fetch attendance for all hired workers
      const hiredWorkerIds = workers.map(hw => hw.id);
      
      if (hiredWorkerIds.length > 0) {
        const { data: attendanceRecords, error: attendanceError } = await supabase
          .from('worker_attendance')
          .select('*')
          .in('hired_worker_id', hiredWorkerIds)
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

        // Calculate stats for each employee
        const statsMap: Record<string, EmployeeStats> = {};
        
        workers.forEach(hw => {
          const records = attendanceMap[hw.id] || [];
          const now = new Date();
          const hiredDate = new Date(hw.hired_date);
          const daysSinceHired = Math.ceil((now.getTime() - hiredDate.getTime()) / (1000 * 60 * 60 * 24));
          
          const presentDays = records.filter(r => r.status === 'present').length;
          const absentDays = records.filter(r => r.status === 'absent').length;
          const leaveDays = records.filter(r => r.status === 'leave' || r.leave_type).length;
          const lateDays = records.filter(r => r.status === 'late').length;
          const halfDays = records.filter(r => r.status === 'half_day').length;
          
          const totalDays = Math.max(daysSinceHired, records.length);
          const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

          statsMap[hw.id] = {
            totalDays,
            presentDays,
            absentDays,
            leaveDays,
            lateDays,
            halfDays,
            attendancePercentage
          };
        });

        setEmployeeStats(statsMap);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employee data.",
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
      <Navbar />
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
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                My Employees
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Manage and track your hired workers' attendance, leaves, and performance
              </p>
            </div>
          </motion.div>

          {hiredWorkers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl p-12 text-center shadow-soft"
            >
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Employees Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't hired any workers yet. Start by booking a service and selecting a worker.
              </p>
              <Button onClick={() => navigate('/services')} className="gap-2">
                Book a Service
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {hiredWorkers.map((hiredWorker, index) => {
                const stats = employeeStats[hiredWorker.id] || {
                  totalDays: 0,
                  presentDays: 0,
                  absentDays: 0,
                  leaveDays: 0,
                  lateDays: 0,
                  halfDays: 0,
                  attendancePercentage: 0
                };
                const attendance = attendanceData[hiredWorker.id] || [];
                const recentAttendance = attendance.slice(0, 10);

                return (
                  <motion.div
                    key={hiredWorker.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-2xl p-6 shadow-soft"
                  >
                    {/* Employee Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-foreground">{hiredWorker.worker.name}</h3>
                            <Badge className={getStatusColor(hiredWorker.status)}>
                              {hiredWorker.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground capitalize mb-2">
                            {hiredWorker.worker.work_type?.replace('_', ' ')} • {hiredWorker.worker.years_experience || 0} years experience
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{hiredWorker.worker.phone}</span>
                            </div>
                            {hiredWorker.worker.residential_address && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>{hiredWorker.worker.residential_address}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>Hired on {new Date(hiredWorker.hired_date).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Salary</p>
                        <p className="text-lg font-bold text-foreground">
                          ₹{hiredWorker.agreed_salary.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {hiredWorker.salary_frequency}
                        </p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-muted/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm text-muted-foreground">Present</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stats.presentDays}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-destructive" />
                          <span className="text-sm text-muted-foreground">Absent</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stats.absentDays}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarDays className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-muted-foreground">Leaves</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stats.leaveDays}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Timer className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-muted-foreground">Late</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stats.lateDays}</p>
                      </div>
                    </div>

                    {/* Attendance Percentage */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Attendance Rate</span>
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
                        <h4 className="font-semibold text-foreground">Recent Attendance</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEmployee(
                            selectedEmployee === hiredWorker.id ? null : hiredWorker.id
                          )}
                        >
                          {selectedEmployee === hiredWorker.id ? 'Show Less' : 'View All'}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(selectedEmployee === hiredWorker.id ? attendance : recentAttendance).map((record) => (
                          <div
                            key={record.id}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">
                                {new Date(record.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  weekday: 'short'
                                })}
                              </span>
                              {record.clock_in && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>{record.clock_in}</span>
                                  {record.clock_out && <span> - {record.clock_out}</span>}
                                </div>
                              )}
                            </div>
                            <Badge className={getAttendanceStatusColor(record.status)}>
                              {record.status === 'leave' && record.leave_type 
                                ? `${record.leave_type} leave`
                                : record.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        ))}
                        {attendance.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No attendance records yet
                          </p>
                        )}
                      </div>
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

export default MyEmployees;
