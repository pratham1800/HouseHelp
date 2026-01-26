import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Home, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OwnerAuthProps {
  onClose: () => void;
}

export const OwnerAuth = ({ onClose }: OwnerAuthProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [hasOwnerProfile, setHasOwnerProfile] = useState(false);
  const [workerData, setWorkerData] = useState<{ name: string; phone: string; address: string } | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (user) {
        // Check profile role
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_role, full_name, phone, address')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.user_role === 'owner') {
          setHasOwnerProfile(true);
        }

        // Get worker data if coming from worker portal
        const { data: workerAuth } = await supabase
          .from('worker_auth')
          .select('worker_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (workerAuth?.worker_id) {
          const { data: worker } = await supabase
            .from('workers')
            .select('name, phone, residential_address')
            .eq('id', workerAuth.worker_id)
            .maybeSingle();

          if (worker) {
            setWorkerData({
              name: worker.name,
              phone: worker.phone,
              address: worker.residential_address || ''
            });
          }
        }
      }
    };

    checkUserStatus();
  }, [user]);

  const handleContinueAsOwner = async () => {
    if (!user) return;
    
    setLoading(true);

    try {
      // Update profile to owner role
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          user_role: 'owner',
          full_name: workerData?.name || user.user_metadata?.full_name,
          phone: workerData?.phone || null,
          address: workerData?.address || null,
          updated_at: new Date().toISOString()
        });

      toast({
        title: 'Welcome to GharSeva!',
        description: 'You can now explore and hire household help.',
      });

      onClose();
      navigate('/services');
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to set up owner profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
        <Home className="w-7 h-7 text-white" />
      </div>
      
      <h2 className="text-xl font-bold text-center text-foreground mb-2">
        {hasOwnerProfile ? 'Owner Account Active' : 'Continue as Owner'}
      </h2>
      
      <p className="text-muted-foreground text-center mb-6 text-sm">
        Signed in as <strong>{user.email}</strong>
      </p>

      {hasOwnerProfile ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">Your owner profile is active</span>
          </div>
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => {
              onClose();
              navigate('/services');
            }}
          >
            <Home className="w-4 h-4 mr-2" />
            Book Now
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {workerData && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Your worker data will be used:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {workerData.name && <li>• Name: {workerData.name}</li>}
                {workerData.phone && <li>• Phone: {workerData.phone}</li>}
              </ul>
            </div>
          )}
          
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleContinueAsOwner}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Home className="w-4 h-4 mr-2" />
                Continue as Owner
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}

      <p className="text-center text-muted-foreground mt-4 text-xs">
        Looking for work?{' '}
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/for-workers');
          }}
          className="text-secondary hover:underline font-medium"
        >
          Go to Worker Portal
        </button>
      </p>
    </motion.div>
  );
};