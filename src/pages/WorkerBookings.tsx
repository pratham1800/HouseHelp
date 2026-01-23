import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Briefcase,
  Phone,
  MapPin,
  Loader2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkerNavbar } from '@/components/WorkerNavbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface BookingData {
  id: string;
  full_name: string;
  service_title: string;
  start_date: string;
  status: string;
  address: string;
  phone: string;
  call_scheduled_at: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700' },
  call_scheduled: { label: 'Call Scheduled', color: 'bg-blue-100 text-blue-700' },
  trial_active: { label: 'Trial Ongoing', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

export default function WorkerBookings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [workerId, setWorkerId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/for-workers/auth');
      return;
    }
    
    if (user) {
      fetchWorkerBookings();
    }
  }, [user, authLoading, navigate]);

  const fetchWorkerBookings = async () => {
    try {
      // Get worker ID first
      const { data: workerAuth } = await supabase
        .from('worker_auth')
        .select('worker_id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!workerAuth?.worker_id) {
        setLoading(false);
        return;
      }

      setWorkerId(workerAuth.worker_id);

      // Fetch bookings assigned to this worker
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('id, full_name, service_title, start_date, status, address, phone, call_scheduled_at, created_at')
        .eq('assigned_worker_id', workerAuth.worker_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
      } else {
        setBookings(bookingsData || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
      <WorkerNavbar />
      
      <main className="pt-20 pb-16">
        <div className="container-main px-4 md:px-8 max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/for-workers/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                My Bookings
              </h1>
              <p className="text-muted-foreground">
                View your work history and current assignments
              </p>
            </div>

            {bookings.length === 0 ? (
              <div className="card-elevated p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Bookings Yet
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You haven't been assigned any work yet. Complete your verification and you'll be matched with households soon!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking, index) => {
                  const status = statusConfig[booking.status] || statusConfig.pending;
                  
                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="card-elevated p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Owner Info */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {booking.full_name}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {booking.service_title}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Start Date:</span>
                          <span className="text-foreground">
                            {new Date(booking.start_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        {booking.call_scheduled_at && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Call:</span>
                            <span className="text-foreground">
                              {new Date(booking.call_scheduled_at).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Booking ID:</span>
                          <span className="text-foreground font-mono text-xs">
                            {booking.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>

                      {/* Location - only show partial for privacy */}
                      <div className="flex items-start gap-2 mt-3 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">
                          {booking.address.split(',').slice(0, 2).join(', ')}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
