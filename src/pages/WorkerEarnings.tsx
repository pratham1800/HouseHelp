import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  IndianRupee, 
  Star, 
  Trophy, 
  Calendar,
  TrendingUp,
  Loader2,
  Gift,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WorkerNavbar } from '@/components/WorkerNavbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface WorkerAward {
  id: string;
  award_type: string;
  title: string;
  description: string | null;
  bonus_amount: number | null;
  month: string | null;
  created_at: string;
}

interface EarningsData {
  totalRewards: number;
  currentRating: number;
  totalRatings: number;
  awards: WorkerAward[];
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function WorkerEarnings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [earnings, setEarnings] = useState<EarningsData>({
    totalRewards: 0,
    currentRating: 0,
    totalRatings: 0,
    awards: []
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/for-workers/auth');
      return;
    }
    
    if (user) {
      fetchWorkerData();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (workerId) {
      fetchEarnings();
    }
  }, [workerId, selectedYear, selectedMonth]);

  const fetchWorkerData = async () => {
    try {
      const { data: workerAuth } = await supabase
        .from('worker_auth')
        .select('worker_id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (workerAuth?.worker_id) {
        setWorkerId(workerAuth.worker_id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const fetchEarnings = async () => {
    if (!workerId) return;
    
    try {
      // Fetch awards
      const { data: awardsData } = await supabase
        .from('worker_awards')
        .select('*')
        .eq('worker_id', workerId)
        .order('created_at', { ascending: false });

      // Fetch ratings
      const { data: ratingsData } = await supabase
        .from('worker_ratings')
        .select('rating')
        .eq('worker_id', workerId);

      const totalBonuses = awardsData?.reduce((sum, award) => sum + (award.bonus_amount || 0), 0) || 0;
      const avgRating = ratingsData && ratingsData.length > 0
        ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length
        : 0;

      setEarnings({
        totalRewards: totalBonuses,
        currentRating: Math.round(avgRating * 10) / 10,
        totalRatings: ratingsData?.length || 0,
        awards: awardsData || []
      });
    } catch (error) {
      console.error('Error fetching earnings:', error);
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

  if (!workerId) {
    return (
      <div className="min-h-screen bg-background">
        <WorkerNavbar />
        <main className="pt-20 section-padding">
          <div className="container-main text-center max-w-md mx-auto">
            <div className="card-elevated p-8">
              <IndianRupee className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                No Worker Profile
              </h1>
              <p className="text-muted-foreground mb-6">
                Complete your worker registration to view earnings.
              </p>
              <Button onClick={() => navigate('/for-workers/auth')} className="w-full">
                Complete Registration
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <WorkerNavbar />
      
      <main className="pt-20 pb-16">
        <div className="container-main px-4 md:px-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/for-workers/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Earnings 💰
            </h1>
            <p className="text-muted-foreground">
              Track your rewards, bonuses, and performance
            </p>
          </motion.div>

          {/* Top Metrics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-elevated p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Rewards</p>
                  <p className="text-2xl font-bold text-foreground">₹{earnings.totalRewards.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-elevated p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-foreground">{earnings.currentRating || 'N/A'}</p>
                    <span className="text-sm text-muted-foreground">({earnings.totalRatings} reviews)</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-elevated p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Awards Won</p>
                  <p className="text-2xl font-bold text-foreground">{earnings.awards.length}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4 mb-6"
          >
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((month, i) => (
                  <SelectItem key={month} value={(i + 1).toString()}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Awards List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-elevated p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Awards & Bonuses
            </h2>

            {earnings.awards.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Awards Yet</h3>
                <p className="text-muted-foreground">
                  Keep up the great work! Awards and bonuses will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {earnings.awards.map((award) => (
                  <div 
                    key={award.id} 
                    className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {award.award_type === 'worker_of_month' ? (
                        <Trophy className="w-6 h-6 text-primary" />
                      ) : (
                        <Gift className="w-6 h-6 text-secondary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{award.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {award.award_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      {award.description && (
                        <p className="text-sm text-muted-foreground">{award.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(award.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    </div>
                    {award.bonus_amount && award.bonus_amount > 0 && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">+₹{award.bonus_amount}</p>
                        <p className="text-xs text-muted-foreground">Bonus</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
