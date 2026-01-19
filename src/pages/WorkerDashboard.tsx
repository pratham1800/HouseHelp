import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User,
  MapPin,
  Clock,
  Phone,
  Briefcase,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageCircle,
  Star,
  ArrowLeft,
  Users,
  Trophy,
  Award,
  CalendarX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WorkerNavbar } from '@/components/WorkerNavbar';
import { Footer } from '@/components/Footer';
import { VerificationModal } from '@/components/VerificationModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

interface WorkerData {
  id: string;
  name: string;
  phone: string;
  work_type: string;
  years_experience: number;
  languages_spoken: string[];
  preferred_areas: string[];
  working_hours: string;
  status: string;
  trial_start_date: string | null;
  trial_end_date: string | null;
  scheduled_call_date: string | null;
  assigned_customer_id: string | null;
  id_proof_url: string | null;
}

interface WorkerMetrics {
  currentEmployers: number;
  totalLeaves: number;
  lateDays: number;
  bestWorkerAwards: number;
  totalAwards: number;
  awardsThisYear: number;
}

const statusConfig: Record<string, { label: string; labelHi: string; color: string; icon: any }> = {
  pending_verification: {
    label: 'Pending Verification',
    labelHi: 'सत्यापन लंबित',
    color: 'bg-amber-100 text-amber-700',
    icon: AlertCircle
  },
  verified: {
    label: 'Verified - Awaiting Match',
    labelHi: 'सत्यापित - मिलान की प्रतीक्षा',
    color: 'bg-blue-100 text-blue-700',
    icon: CheckCircle2
  },
  matched: {
    label: 'New Match Found!',
    labelHi: 'नया मिलान मिला!',
    color: 'bg-primary/10 text-primary',
    icon: Star
  },
  trial_active: {
    label: 'Trial Active',
    labelHi: 'ट्रायल सक्रिय',
    color: 'bg-secondary/10 text-secondary',
    icon: Clock
  },
  assigned: {
    label: 'Assigned',
    labelHi: 'नियुक्त',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2
  },
  rejected: {
    label: 'Verification Failed',
    labelHi: 'सत्यापन विफल',
    color: 'bg-destructive/10 text-destructive',
    icon: AlertCircle
  }
};

const workTypeLabels: Record<string, string> = {
  domestic_help: 'Domestic Help',
  cooking: 'Cooking',
  driving: 'Driving',
  gardening: 'Gardening'
};

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [worker, setWorker] = useState<WorkerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [metrics, setMetrics] = useState<WorkerMetrics>({
    currentEmployers: 0,
    totalLeaves: 0,
    lateDays: 0,
    bestWorkerAwards: 0,
    totalAwards: 0,
    awardsThisYear: 0
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchWorkerData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchWorkerData = async () => {
    try {
      // Check if user has a linked worker account
      const { data: workerAuth, error: authError } = await supabase
        .from('worker_auth')
        .select('worker_id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (authError) {
        console.error('Error fetching worker auth:', authError);
        setLoading(false);
        return;
      }

      if (workerAuth?.worker_id) {
        const { data: workerData, error: workerError } = await supabase
          .from('workers')
          .select('*')
          .eq('id', workerAuth.worker_id)
          .single();

        if (workerError) {
          console.error('Error fetching worker:', workerError);
        } else {
          setWorker(workerData);
          // Show verification modal if worker is unverified and has no documents
          if (!workerData.id_proof_url && workerData.status !== 'verified' && workerData.status !== 'pending_verification') {
            setShowVerificationModal(true);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrialProgress = () => {
    if (!worker?.trial_start_date || !worker?.trial_end_date) return 0;
    
    const start = new Date(worker.trial_start_date).getTime();
    const end = new Date(worker.trial_end_date).getTime();
    const now = Date.now();
    
    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getDaysRemaining = () => {
    if (!worker?.trial_end_date) return 0;
    const end = new Date(worker.trial_end_date).getTime();
    const now = Date.now();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <WorkerNavbar />
        <main className="pt-20 section-padding flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <WorkerNavbar />
        <main className="pt-20 section-padding">
          <div className="container-main text-center max-w-md mx-auto">
            <div className="card-elevated p-8">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Worker Login Required
              </h1>
              <p className="text-muted-foreground mb-6">
                Please login to access your worker dashboard
              </p>
              <Button onClick={() => navigate('/for-workers/auth')} className="w-full">
                Login / Sign Up
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-background">
        <WorkerNavbar />
        <main className="pt-20 section-padding">
          <div className="container-main text-center max-w-md mx-auto">
            <div className="card-elevated p-8">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Complete Your Profile
              </h1>
              <p className="text-muted-foreground mb-6">
                Your worker profile needs to be completed. Please fill in your details to start receiving work opportunities.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/for-workers/verification')}
                  className="w-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  Complete Verification
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://wa.me/919876543210?text=Hi, I need help with my worker registration', '_blank')}
                  className="w-full"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => navigate('/for-workers')}
                  className="w-full"
                >
                  Back to Worker Portal
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const status = statusConfig[worker.status] || statusConfig.pending_verification;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background">
      <WorkerNavbar />
      
      <main className="pt-20 pb-16">
        <div className="container-main px-4 md:px-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/for-workers')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Worker Portal
          </Button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome, {worker.name}!
            </h1>
            <p className="text-muted-foreground">
              स्वागत है, {worker.name}!
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Card with Avatar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-elevated p-6"
            >
              <div className="flex flex-col items-center text-center">
                {/* Profile Picture */}
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden border-4 border-border">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-1">{worker.name}</h2>
                <p className="text-sm text-muted-foreground mb-4">{workTypeLabels[worker.work_type] || worker.work_type}</p>
                
                {/* Verification Status Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{status.label}</span>
                </div>
                
                {/* View Verification Details Button */}
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/for-workers/verification')}
                  className="mt-4 w-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  View Verification Details
                </Button>
              </div>
            </motion.div>

            {/* Metrics Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <div className="card-elevated p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('currentEmployers')}</p>
                    <p className="text-xl font-bold text-foreground">{metrics.currentEmployers}</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <CalendarX className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('totalLeaves')}</p>
                    <p className="text-xl font-bold text-foreground">{metrics.totalLeaves}</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('lateDays')}</p>
                    <p className="text-xl font-bold text-foreground">{metrics.lateDays}</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('bestWorkerAwards')}</p>
                    <p className="text-xl font-bold text-foreground">{metrics.bestWorkerAwards}</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('awardsThisYear')}</p>
                    <p className="text-xl font-bold text-foreground">{metrics.awardsThisYear}</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Star className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('totalAwards')}</p>
                    <p className="text-xl font-bold text-foreground">{metrics.totalAwards}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-elevated p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {t('needHelp')}
              </h2>
              <Button 
                className="w-full mb-3"
                onClick={() => window.open('https://wa.me/919876543210', '_blank')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t('contactSupport')}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Available Mon-Sat, 9 AM - 6 PM
              </p>
            </motion.div>

            {/* Profile Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-3 card-elevated p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-6">
                {t('yourProfile')}
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Work Type</p>
                    <p className="font-medium text-foreground">
                      {workTypeLabels[worker.work_type] || worker.work_type}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium text-foreground">
                      {worker.years_experience} years
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Working Hours</p>
                    <p className="font-medium text-foreground capitalize">
                      {worker.working_hours.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{worker.phone}</p>
                  </div>
                </div>
              </div>

              {/* Languages & Areas */}
              <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Languages Spoken</p>
                  <div className="flex flex-wrap gap-2">
                    {worker.languages_spoken?.map((lang: string) => (
                      <span key={lang} className="px-3 py-1 bg-muted rounded-full text-sm">
                        {lang}
                      </span>
                    ))}
                    {(!worker.languages_spoken || worker.languages_spoken.length === 0) && (
                      <span className="text-muted-foreground">Not specified</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Preferred Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {worker.preferred_areas?.map((area: string) => (
                      <span key={area} className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {area}
                      </span>
                    ))}
                    {(!worker.preferred_areas || worker.preferred_areas.length === 0) && (
                      <span className="text-muted-foreground">Not specified</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Verification Modal */}
      {worker && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          workerId={worker.id}
          onSuccess={() => {
            // Refresh worker data
            setLoading(true);
            fetchWorkerData();
          }}
        />
      )}

      <Footer />
    </div>
  );
}