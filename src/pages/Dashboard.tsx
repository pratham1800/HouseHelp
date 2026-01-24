import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Home,
  User,
  LogOut,
  Settings,
  Plus,
  Crown,
  Sparkles,
  ArrowUpRight,
  XCircle,
  Users,
  UserCheck
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { servicesData } from '@/data/servicesData';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { PaymentModal } from '@/components/PaymentModal';
import { HireSalaryModal } from '@/components/HireSalaryModal';

interface Worker {
  id: string;
  name: string;
  phone: string;
  work_type: string;
  years_experience: number | null;
  preferred_areas: string[] | null;
}

interface Booking {
  id: string;
  service_id: string;
  service_title: string;
  sub_services: { id: string; name: string }[];
  house_size: string;
  preferred_time: string;
  start_date: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  special_requirements: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  assigned_worker_id: string | null;
  call_scheduled_at: string | null;
  call_status: string | null;
  worker?: Worker;
  avg_rating?: number;
}

import { computeTrialStatus } from '@/utils/trialStatus';
import { Play, Square } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { 
    label: 'Pending', 
    color: 'bg-amber-100 text-amber-800 border-amber-200', 
    icon: <Clock className="w-3 h-3" /> 
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: <CheckCircle className="w-3 h-3" /> 
  },
  trial_started: { 
    label: 'Trial Started', 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: <Play className="w-3 h-3" /> 
  },
  trial_ended: { 
    label: 'Trial Ended', 
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    icon: <Square className="w-3 h-3" /> 
  },
  work_assigned: { 
    label: 'Work Assigned', 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: <UserCheck className="w-3 h-3" /> 
  },
  in_progress: { 
    label: 'In Progress', 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: <Loader2 className="w-3 h-3" /> 
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    icon: <CheckCircle className="w-3 h-3" /> 
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: <AlertCircle className="w-3 h-3" /> 
  },
};

const houseSizeLabels: Record<string, string> = {
  '1bhk': '1 BHK',
  '2bhk': '2 BHK',
  '3bhk': '3 BHK',
  '4bhk': '4+ BHK',
  'villa': 'Villa/Bungalow',
};

const timeSlotLabels: Record<string, string> = {
  'morning': 'Morning (6 AM - 10 AM)',
  'midday': 'Mid-Day (10 AM - 2 PM)',
  'afternoon': 'Afternoon (2 PM - 6 PM)',
  'evening': 'Evening (6 PM - 10 PM)',
  'flexible': 'Flexible',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const { subscription, loading: subLoading, subscribing, subscribe, cancelSubscription } = useSubscription();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHireSalaryModal, setShowHireSalaryModal] = useState(false);
  const [pendingHireBooking, setPendingHireBooking] = useState<Booking | null>(null);
  const [pendingPlan, setPendingPlan] = useState<{ name: string; price: number } | null>(null);
  const [hiring, setHiring] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      toast({
        title: "Please log in",
        description: "You need to be logged in to view your dashboard.",
        variant: "destructive",
      });
    }
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      // Fetch bookings with assigned worker data
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          workers:assigned_worker_id (
            id,
            name,
            phone,
            work_type,
            years_experience,
            preferred_areas
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get worker ratings for assigned workers
      const workerIds = (data || [])
        .filter(b => b.assigned_worker_id)
        .map(b => b.assigned_worker_id);
      
      let ratingsMap: Record<string, number> = {};
      if (workerIds.length > 0) {
        const { data: ratings } = await supabase
          .from('worker_ratings')
          .select('worker_id, rating')
          .in('worker_id', workerIds);
        
        if (ratings) {
          // Calculate average rating per worker
          const ratingCounts: Record<string, { sum: number; count: number }> = {};
          ratings.forEach(r => {
            if (!ratingCounts[r.worker_id]) {
              ratingCounts[r.worker_id] = { sum: 0, count: 0 };
            }
            ratingCounts[r.worker_id].sum += r.rating;
            ratingCounts[r.worker_id].count += 1;
          });
          Object.entries(ratingCounts).forEach(([workerId, data]) => {
            ratingsMap[workerId] = data.sum / data.count;
          });
        }
      }
      
      // Parse sub_services from JSON and attach worker data
      const parsedBookings = (data || []).map(booking => {
        let subServices: { id: string; name: string }[] = [];
        try {
          if (typeof booking.sub_services === 'string') {
            subServices = JSON.parse(booking.sub_services);
          } else if (Array.isArray(booking.sub_services)) {
            subServices = booking.sub_services as { id: string; name: string }[];
          } else if (booking.sub_services && typeof booking.sub_services === 'object') {
            // Handle case where sub_services is an object but not an array
            subServices = [];
          }
        } catch (e) {
          console.error('Error parsing sub_services:', e);
          subServices = [];
        }
        
        return {
          ...booking,
          sub_services: subServices,
          worker: booking.workers as Worker | undefined,
          avg_rating: booking.assigned_worker_id ? ratingsMap[booking.assigned_worker_id] : undefined
        };
      });
      
      setBookings(parsedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load your bookings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceId: string) => {
    const service = servicesData.find(s => s.id === serviceId);
    return service?.icon;
  };

  const getServiceBgColor = (serviceId: string) => {
    const service = servicesData.find(s => s.id === serviceId);
    return service?.bgColor || 'bg-muted';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleHireClick = (booking: Booking) => {
    setPendingHireBooking(booking);
    
    // Check if user has active subscription
    if (!subscription) {
      setShowSubscriptionModal(true);
    } else {
      // User has subscription, proceed to salary modal
      setShowHireSalaryModal(true);
    }
  };

  // Called when user selects a plan from subscription modal
  const handlePlanSelected = (planName: string, planPrice: number) => {
    setPendingPlan({ name: planName, price: planPrice });
    setShowSubscriptionModal(false);
    setShowPaymentModal(true);
  };

  // Called when payment is successful
  const handlePaymentSuccess = async () => {
    if (pendingPlan) {
      // Create the subscription
      await subscribe(pendingPlan.name, pendingPlan.price);
      setPendingPlan(null);
    }
    setShowPaymentModal(false);
    // Now show the salary modal to complete hiring
    if (pendingHireBooking) {
      setShowHireSalaryModal(true);
    }
  };

  const handleConfirmHire = async (salary: number, frequency: string) => {
    if (!pendingHireBooking || !pendingHireBooking.worker || !user) return;
    
    setHiring(true);
    try {
      // Add worker to hired_workers table
      const { error: hireError } = await supabase
        .from('hired_workers')
        .insert({
          owner_id: user.id,
          worker_id: pendingHireBooking.worker.id,
          agreed_salary: salary,
          salary_frequency: frequency,
          status: 'active',
          hired_date: new Date().toISOString()
        });

      if (hireError) throw hireError;

      // Update booking status to work_assigned
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'work_assigned' })
        .eq('id', pendingHireBooking.id);

      if (bookingError) throw bookingError;

      // Update local state
      setBookings(prev => 
        prev.map(b => 
          b.id === pendingHireBooking.id 
            ? { ...b, status: 'work_assigned' } 
            : b
        )
      );

      toast({
        title: "🎉 Worker Hired Successfully!",
        description: `${pendingHireBooking.worker?.name} has been added to your employees with ₹${salary.toLocaleString()}/${frequency} salary.`,
      });

      setShowHireSalaryModal(false);
      setPendingHireBooking(null);
    } catch (error) {
      console.error('Error hiring worker:', error);
      toast({
        title: "Hiring Failed",
        description: "There was an error completing the hire. Please try again.",
        variant: "destructive",
      });
    } finally {
      setHiring(false);
    }
  };

  // Watch for subscription changes to continue hire flow
  useEffect(() => {
    if (subscription && pendingHireBooking && showSubscriptionModal) {
      setShowSubscriptionModal(false);
      setShowHireSalaryModal(true);
    }
  }, [subscription, pendingHireBooking, showSubscriptionModal]);

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
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
                  Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'User'}! 👋
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Manage your bookings and track your service requests
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Button variant="outline" size="sm" onClick={() => navigate('/services')} className="gap-2 flex-1 sm:flex-none">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Booking</span>
                  <span className="sm:hidden">Book</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/employees')} className="gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">My Employees</span>
                  <span className="sm:hidden">Employees</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            {[
              { label: 'Total Bookings', value: bookings.length, icon: Calendar },
              { label: 'Active', value: bookings.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status)).length, icon: Clock },
              { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: CheckCircle },
              { label: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, icon: AlertCircle },
            ].map((stat, index) => (
              <div key={stat.label} className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-soft">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Subscription Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6 sm:mb-8"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Subscription</h2>
            
            {subLoading ? (
              <div className="bg-card rounded-2xl p-6 shadow-soft flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : subscription ? (
              <div className="bg-gradient-to-br from-primary/5 via-card to-secondary/5 border border-primary/20 rounded-2xl p-5 sm:p-6 shadow-soft">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">{subscription.plan_name} Plan</h3>
                        <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        ₹{subscription.plan_price}/month
                      </p>
                      {subscription.trial_ends_at && (
                        <p className="text-sm text-primary mt-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Trial ends {new Date(subscription.trial_ends_at).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3">
                    {subscription.plan_name === 'Standard' && (
                      <Button 
                        variant="hero" 
                        size="sm" 
                        className="gap-2"
                        disabled={subscribing}
                        onClick={() => subscribe('Premium', 999)}
                      >
                        {subscribing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <ArrowUpRight className="w-4 h-4" />
                            Upgrade to Premium
                          </>
                        )}
                      </Button>
                    )}
                    {subscription.plan_name === 'Premium' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        disabled={subscribing}
                        onClick={() => subscribe('Standard', 499)}
                      >
                        {subscribing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Switch to Standard'
                        )}
                      </Button>
                    )}
                    
                    {showCancelConfirm ? (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={async () => {
                            await cancelSubscription();
                            setShowCancelConfirm(false);
                          }}
                        >
                          Confirm Cancel
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowCancelConfirm(false)}
                        >
                          Keep
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setShowCancelConfirm(true)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Plan Features Preview */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex flex-wrap gap-3 text-sm">
                    {subscription.plan_name === 'Premium' ? (
                      <>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <CheckCircle className="w-3.5 h-3.5 text-success" /> Backup worker on leave
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <CheckCircle className="w-3.5 h-3.5 text-success" /> Priority matching
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <CheckCircle className="w-3.5 h-3.5 text-success" /> 24/7 support
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <CheckCircle className="w-3.5 h-3.5 text-success" /> Verified matching
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <CheckCircle className="w-3.5 h-3.5 text-success" /> Basic support
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center">
                    <Crown className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">No Active Subscription</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Subscribe to a plan to get matched with verified workers
                    </p>
                  </div>
                  <Button onClick={() => navigate('/#subscription')} className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    View Plans
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Bookings List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Bookings</h2>
            
            {bookings.length === 0 ? (
              <div className="bg-card rounded-3xl p-12 text-center shadow-soft">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by booking your first domestic service
                </p>
                <Button onClick={() => navigate('/services')} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Book a Service
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-card rounded-2xl p-5 shadow-soft hover:shadow-elevated transition-all cursor-pointer"
                    onClick={() => setSelectedBooking(selectedBooking?.id === booking.id ? null : booking)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Service Icon */}
                      <div className={`w-14 h-14 ${getServiceBgColor(booking.service_id)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        {getServiceIcon(booking.service_id) ? (
                          <img 
                            src={getServiceIcon(booking.service_id)} 
                            alt={booking.service_title} 
                            className="w-8 h-8 object-contain" 
                          />
                        ) : (
                          <Home className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-foreground">{booking.service_title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {booking.sub_services.length} service{booking.sub_services.length !== 1 ? 's' : ''} • {houseSizeLabels[booking.house_size] || booking.house_size}
                            </p>
                          </div>
                          {(() => {
                            const trialStatus = computeTrialStatus(booking.start_date, booking.status);
                            const displayStatus = statusConfig[trialStatus.status] || statusConfig.pending;
                            return (
                              <Badge className={`${displayStatus.color} gap-1`}>
                                {displayStatus.icon}
                                <span>{displayStatus.label}</span>
                                {trialStatus.daysRemaining !== undefined && (
                                  <span className="ml-1">({trialStatus.daysRemaining}d left)</span>
                                )}
                              </Badge>
                            );
                          })()}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(booking.start_date).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{timeSlotLabels[booking.preferred_time]?.split(' (')[0] || booking.preferred_time}</span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${selectedBooking?.id === booking.id ? 'rotate-90' : ''}`} />
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {selectedBooking?.id === booking.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-4 border-t border-border space-y-4">
                            {/* Assigned Worker */}
                            {booking.worker && (
                              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-sm font-medium text-foreground">Assigned Worker</p>
                                  {/* Hire Button - Show only when trial ended and not already hired */}
                                  {(() => {
                                    const trialStatus = computeTrialStatus(booking.start_date, booking.status);
                                    if (trialStatus.status === 'trial_ended' && booking.status !== 'work_assigned') {
                                      return (
                                        <Button
                                          variant="hero"
                                          size="sm"
                                          className="gap-2"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleHireClick(booking);
                                          }}
                                        >
                                          <UserCheck className="w-4 h-4" />
                                          Hire Worker
                                        </Button>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-foreground">{booking.worker.name}</p>
                                    <p className="text-sm text-muted-foreground capitalize">
                                      {booking.worker.work_type?.replace('_', ' ')} • {booking.worker.years_experience || 0} yrs exp
                                    </p>
                                    {booking.avg_rating && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <span className="text-amber-500">★</span>
                                        <span className="text-sm font-medium">{booking.avg_rating.toFixed(1)}</span>
                                      </div>
                                    )}
                                  </div>
                                  {booking.call_scheduled_at && (
                                    <div className="text-right">
                                      <p className="text-xs text-muted-foreground">Call scheduled</p>
                                      <p className="text-sm font-medium text-primary">{booking.worker.phone}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Sub-services */}
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">Selected Services</p>
                              <div className="flex flex-wrap gap-2">
                                {booking.sub_services.map((sub: { id: string; name: string }) => (
                                  <span 
                                    key={sub.id} 
                                    className={`px-3 py-1 ${getServiceBgColor(booking.service_id)} rounded-full text-sm`}
                                  >
                                    {sub.name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Contact & Address */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-start gap-3">
                                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-foreground">{booking.full_name}</p>
                                  <p className="text-sm text-muted-foreground">{booking.phone}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <p className="text-sm text-muted-foreground">{booking.address}</p>
                              </div>
                            </div>

                            {/* Special Requirements */}
                            {booking.special_requirements && (
                              <div>
                                <p className="text-sm font-medium text-foreground mb-1">Special Requirements</p>
                                <p className="text-sm text-muted-foreground">{booking.special_requirements}</p>
                              </div>
                            )}

                            {/* Booking ID & Date */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Booking ID: {booking.id.slice(0, 8)}</span>
                              <span>Booked on {new Date(booking.created_at).toLocaleDateString('en-IN')}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => {
          setShowSubscriptionModal(false);
          setPendingHireBooking(null);
        }}
        onPlanSelected={handlePlanSelected}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPendingPlan(null);
        }}
        onSuccess={handlePaymentSuccess}
        planName={pendingPlan?.name || ''}
        planPrice={pendingPlan?.price || 0}
      />

      {/* Hire Salary Modal */}
      <HireSalaryModal
        isOpen={showHireSalaryModal}
        onClose={() => {
          setShowHireSalaryModal(false);
          setPendingHireBooking(null);
        }}
        onConfirm={handleConfirmHire}
        worker={pendingHireBooking?.worker || null}
        serviceName={pendingHireBooking?.service_title || ''}
        loading={hiring}
      />
    </div>
  );
};

export default Dashboard;
