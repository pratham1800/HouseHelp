import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, Clock, Star, Phone, CheckCircle, Loader2, Languages, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MatchedWorker {
  id: string;
  name: string;
  phone: string;
  work_type: string;
  years_experience: number | null;
  languages_spoken: string[] | null;
  preferred_areas: string[] | null;
  working_hours: string | null;
  gender: string | null;
  match_score: number;
}

interface WorkerMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedWorkers: MatchedWorker[];
  bookingId: string;
  isLoading: boolean;
  onWorkerSelected: () => void;
}

export const WorkerMatchModal = ({
  isOpen,
  onClose,
  matchedWorkers,
  bookingId,
  isLoading,
  onWorkerSelected,
}: WorkerMatchModalProps) => {
  const { toast } = useToast();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleSelectWorker = async (worker: MatchedWorker) => {
    setSelectedWorkerId(worker.id);
    setIsAssigning(true);

    try {
      // Calculate trial dates
      const trialStartDate = new Date().toISOString();
      const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const scheduledCallDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Update worker with assignment
      const { error: workerError } = await supabase
        .from('workers')
        .update({
          assigned_customer_id: bookingId,
          trial_start_date: trialStartDate,
          trial_end_date: trialEndDate,
          scheduled_call_date: scheduledCallDate,
          match_score: worker.match_score,
        })
        .eq('id', worker.id);

      if (workerError) throw workerError;

      // Update booking status and assign worker
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          assigned_worker_id: worker.id,
          call_scheduled_at: scheduledCallDate,
          call_status: 'scheduled',
        })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      toast({
        title: "Worker Selected! 🎉",
        description: `${worker.name} will contact you within 24 hours to schedule a call. Your 7-day trial starts after confirmation.`,
      });

      onWorkerSelected();
      onClose();
    } catch (error) {
      console.error('Error selecting worker:', error);
      toast({
        title: "Error",
        description: "Failed to assign worker. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
      setSelectedWorkerId(null);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-success/10 text-success border-success/20';
    if (score >= 60) return 'bg-primary/10 text-primary border-primary/20';
    if (score >= 40) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    return 'bg-muted text-muted-foreground';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-card w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-elevated overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-secondary/5 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  {isLoading ? 'Finding Matches...' : 'Your Matched Workers'}
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                  {isLoading 
                    ? 'Analyzing preferences and availability...' 
                    : `${matchedWorkers.length} verified workers match your requirements`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted/80 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground text-center">
                  Matching you with the best workers based on<br />
                  service type, location, and availability...
                </p>
              </div>
            ) : matchedWorkers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Matches Found</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  We couldn't find verified workers matching your requirements right now. 
                  Our team will manually match you within 24 hours.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {matchedWorkers.map((worker, index) => (
                  <motion.div
                    key={worker.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-background rounded-2xl p-4 border-2 transition-all cursor-pointer ${
                      selectedWorkerId === worker.id 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => !isAssigning && handleSelectWorker(worker)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="w-7 h-7 text-primary" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{worker.name}</h3>
                            <p className="text-sm text-muted-foreground">{worker.work_type}</p>
                          </div>
                          <Badge className={`${getMatchColor(worker.match_score)} flex items-center gap-1`}>
                            <Star className="w-3 h-3" />
                            {worker.match_score}% Match
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {worker.years_experience && (
                            <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                              <Clock className="w-3 h-3" />
                              {worker.years_experience}+ years exp
                            </span>
                          )}
                          {worker.working_hours && (
                            <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                              <Calendar className="w-3 h-3" />
                              {worker.working_hours}
                            </span>
                          )}
                          {worker.languages_spoken && worker.languages_spoken.length > 0 && (
                            <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                              <Languages className="w-3 h-3" />
                              {worker.languages_spoken.slice(0, 2).join(', ')}
                            </span>
                          )}
                          {worker.preferred_areas && worker.preferred_areas.length > 0 && (
                            <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                              <MapPin className="w-3 h-3" />
                              {worker.preferred_areas.slice(0, 2).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Select Button */}
                    <div className="mt-4 pt-3 border-t border-border">
                      <Button
                        className="w-full gap-2"
                        disabled={isAssigning}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectWorker(worker);
                        }}
                      >
                        {isAssigning && selectedWorkerId === worker.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Assigning...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Select {worker.name.split(' ')[0]}
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!isLoading && matchedWorkers.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-border bg-muted/30">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">7-Day Free Trial Included</p>
                  <p>After selecting a worker, you'll get a scheduled call within 24 hours. 
                  The trial begins after the first successful visit.</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
