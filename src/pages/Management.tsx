import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  Trophy,
  Plus,
  Phone,
  MapPin,
  IndianRupee,
  ChevronRight,
  Loader2,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HiredWorker {
  id: string;
  worker_id: string;
  hired_date: string;
  agreed_salary: number;
  salary_frequency: string;
  status: string;
  notes: string | null;
  worker: {
    id: string;
    name: string;
    phone: string;
    work_type: string;
    gender: string | null;
    years_experience: number | null;
    residential_address: string | null;
  };
}

interface Attendance {
  id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: string;
  leave_type: string | null;
  notes: string | null;
}

interface Rating {
  id: string;
  rating: number;
  review: string | null;
  created_at: string;
}

interface Award {
  id: string;
  award_type: string;
  title: string;
  description: string | null;
  month: string | null;
}

const Management = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [hiredWorkers, setHiredWorkers] = useState<HiredWorker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<HiredWorker | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      toast({
        title: "Please log in",
        description: "You need to be logged in to manage your workers.",
        variant: "destructive",
      });
    }
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    if (user) {
      fetchHiredWorkers();
    }
  }, [user]);

  useEffect(() => {
    if (selectedWorker) {
      fetchWorkerDetails(selectedWorker.id, selectedWorker.worker_id);
    }
  }, [selectedWorker]);

  const fetchHiredWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('hired_workers')
        .select(`
          *,
          worker:workers(id, name, phone, work_type, gender, years_experience, residential_address)
        `)
        .eq('status', 'active')
        .order('hired_date', { ascending: false });

      if (error) throw error;
      setHiredWorkers(data || []);
    } catch (error) {
      console.error('Error fetching hired workers:', error);
      toast({
        title: "Error",
        description: "Failed to load your hired workers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkerDetails = async (hiredWorkerId: string, workerId: string) => {
    try {
      // Fetch attendance
      const { data: attendanceData } = await supabase
        .from('worker_attendance')
        .select('*')
        .eq('hired_worker_id', hiredWorkerId)
        .order('date', { ascending: false })
        .limit(30);

      setAttendance(attendanceData || []);

      // Fetch ratings
      const { data: ratingsData } = await supabase
        .from('worker_ratings')
        .select('*')
        .eq('worker_id', workerId)
        .order('created_at', { ascending: false });

      setRatings(ratingsData || []);

      // Fetch awards
      const { data: awardsData } = await supabase
        .from('worker_awards')
        .select('*')
        .eq('worker_id', workerId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      setAwards(awardsData || []);
    } catch (error) {
      console.error('Error fetching worker details:', error);
    }
  };

  const getAverageRating = (): number => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  };

  const getAttendanceStats = () => {
    const present = attendance.filter(a => a.status === 'present').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const leaves = attendance.filter(a => a.status === 'leave' || a.status === 'absent').length;
    return { present, late, leaves, total: attendance.length };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
              Worker Management 👥
            </h1>
            <p className="text-muted-foreground">
              Track attendance, performance, and manage your hired workers
            </p>
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
              <h3 className="text-lg font-semibold text-foreground mb-2">No hired workers yet</h3>
              <p className="text-muted-foreground mb-6">
                Complete a trial and hire a worker to see them here
              </p>
              <Button onClick={() => navigate('/services')} className="gap-2">
                <Plus className="w-4 h-4" />
                Book a Service
              </Button>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Worker List */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1 space-y-4"
              >
                <h2 className="text-lg font-semibold text-foreground">Your Workers</h2>
                {hiredWorkers.map((hw) => (
                  <div
                    key={hw.id}
                    onClick={() => setSelectedWorker(hw)}
                    className={`bg-card rounded-2xl p-4 shadow-soft cursor-pointer transition-all hover:shadow-elevated ${
                      selectedWorker?.id === hw.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{hw.worker.name}</h3>
                        <p className="text-sm text-muted-foreground">{hw.worker.work_type}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        ₹{hw.agreed_salary}/{hw.salary_frequency}
                      </span>
                      <Badge variant="outline" className="text-success border-success/20">
                        Active
                      </Badge>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Worker Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2"
              >
                {selectedWorker ? (
                  <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
                    {/* Worker Header */}
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                          <UserCheck className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-foreground">{selectedWorker.worker.name}</h2>
                          <p className="text-muted-foreground">{selectedWorker.worker.work_type}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {selectedWorker.worker.phone}
                            </span>
                            {selectedWorker.worker.years_experience && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {selectedWorker.worker.years_experience} yrs exp
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="text-lg font-bold">{getAverageRating() || 'N/A'}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{ratings.length} reviews</p>
                        </div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="overview" className="p-6">
                      <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="attendance">Attendance</TabsTrigger>
                        <TabsTrigger value="ratings">Ratings</TabsTrigger>
                        <TabsTrigger value="awards">Awards</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                          <div className="bg-muted/50 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-foreground">{getAttendanceStats().present}</div>
                            <div className="text-sm text-muted-foreground">Days Present</div>
                          </div>
                          <div className="bg-muted/50 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-amber-600">{getAttendanceStats().late}</div>
                            <div className="text-sm text-muted-foreground">Days Late</div>
                          </div>
                          <div className="bg-muted/50 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">{getAttendanceStats().leaves}</div>
                            <div className="text-sm text-muted-foreground">Leaves Taken</div>
                          </div>
                          <div className="bg-muted/50 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-primary">{awards.length}</div>
                            <div className="text-sm text-muted-foreground">Awards Won</div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-semibold text-foreground">Worker Details</h3>
                          <div className="grid gap-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-border">
                              <span className="text-muted-foreground">Hired Date</span>
                              <span className="font-medium">{new Date(selectedWorker.hired_date).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                              <span className="text-muted-foreground">Salary</span>
                              <span className="font-medium">₹{selectedWorker.agreed_salary}/{selectedWorker.salary_frequency}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                              <span className="text-muted-foreground">Gender</span>
                              <span className="font-medium">{selectedWorker.worker.gender || 'Not specified'}</span>
                            </div>
                            {selectedWorker.worker.residential_address && (
                              <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-muted-foreground">Address</span>
                                <span className="font-medium text-right max-w-[200px]">{selectedWorker.worker.residential_address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="attendance">
                        {attendance.length === 0 ? (
                          <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No attendance records yet</p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {attendance.map((record) => (
                              <div key={record.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                                <div>
                                  <div className="font-medium">{new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                                  {record.clock_in && (
                                    <div className="text-sm text-muted-foreground">
                                      {record.clock_in} - {record.clock_out || 'Active'}
                                    </div>
                                  )}
                                </div>
                                <Badge
                                  variant="outline"
                                  className={
                                    record.status === 'present' ? 'text-success border-success/20' :
                                    record.status === 'late' ? 'text-amber-600 border-amber-200' :
                                    'text-red-600 border-red-200'
                                  }
                                >
                                  {record.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="ratings">
                        {ratings.length === 0 ? (
                          <div className="text-center py-8">
                            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No ratings yet</p>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            {ratings.map((rating) => (
                              <div key={rating.id} className="p-4 bg-muted/30 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                                    />
                                  ))}
                                  <span className="text-sm text-muted-foreground ml-2">
                                    {new Date(rating.created_at).toLocaleDateString('en-IN')}
                                  </span>
                                </div>
                                {rating.review && (
                                  <p className="text-sm text-foreground">{rating.review}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="awards">
                        {awards.length === 0 ? (
                          <div className="text-center py-8">
                            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No awards yet</p>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            {awards.map((award) => (
                              <div key={award.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center">
                                  <Trophy className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-foreground">{award.title}</h4>
                                  {award.description && (
                                    <p className="text-sm text-muted-foreground">{award.description}</p>
                                  )}
                                  {award.month && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(award.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="bg-card rounded-2xl p-12 text-center shadow-soft">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Select a worker</h3>
                    <p className="text-muted-foreground">
                      Click on a worker from the list to view their details
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Management;
