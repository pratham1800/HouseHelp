import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  Loader2, 
  ArrowRight, 
  LogOut,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';

interface PortalSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPortal: 'owner' | 'worker';
}

export const PortalSwitchModal = ({ isOpen, onClose, targetPortal }: PortalSwitchModalProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [existingData, setExistingData] = useState<{ name?: string; phone?: string } | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      checkExistingProfile();
    }
  }, [isOpen, user]);

  const checkExistingProfile = async () => {
    if (!user) return;
    
    try {
      if (targetPortal === 'owner') {
        // Check if user has owner profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_role, full_name, phone')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile?.user_role === 'owner') {
          setHasProfile(true);
        }
        
        // Get data from worker profile if exists
        const { data: workerAuth } = await supabase
          .from('worker_auth')
          .select('worker_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (workerAuth?.worker_id) {
          const { data: worker } = await supabase
            .from('workers')
            .select('name, phone')
            .eq('id', workerAuth.worker_id)
            .maybeSingle();
          
          if (worker) {
            setExistingData({ name: worker.name, phone: worker.phone });
          }
        }
      } else {
        // Check if user has worker profile
        const { data: workerAuth } = await supabase
          .from('worker_auth')
          .select('worker_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (workerAuth?.worker_id) {
          setHasProfile(true);
        }
        
        // Get data from owner profile if exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile) {
          setExistingData({ name: profile.full_name || undefined, phone: profile.phone || undefined });
        }
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const handleContinue = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      if (targetPortal === 'owner') {
        // Set up owner profile
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            user_role: 'owner',
            full_name: existingData?.name || user.user_metadata?.full_name,
            phone: existingData?.phone || null,
            updated_at: new Date().toISOString()
          });
        
        toast({
          title: 'Welcome!',
          description: 'You can now explore and hire household help.',
        });
        
        onClose();
        navigate('/services');
      } else {
        // Navigate to worker auth to complete setup
        onClose();
        navigate('/for-workers/auth');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to switch portal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    await signOut();
    onClose();
    if (targetPortal === 'owner') {
      navigate('/');
    } else {
      navigate('/for-workers/auth');
    }
  };

  const isOwnerTarget = targetPortal === 'owner';
  const Icon = isOwnerTarget ? Home : Briefcase;

  const texts = {
    title: {
      owner: {
        en: 'Switch to Owner Portal',
        hi: 'मालिक पोर्टल पर जाएं',
        kn: 'ಮಾಲೀಕ ಪೋರ್ಟಲ್‌ಗೆ ಬದಲಿಸಿ',
        mr: 'मालक पोर्टलवर जा'
      },
      worker: {
        en: 'Switch to Worker Portal',
        hi: 'श्रमिक पोर्टल पर जाएं',
        kn: 'ಕಾರ್ಮಿಕ ಪೋರ್ಟಲ್‌ಗೆ ಬದಲಿಸಿ',
        mr: 'कामगार पोर्टलवर जा'
      }
    },
    loggedInAs: {
      en: 'You are logged in as',
      hi: 'आप इस रूप में लॉग इन हैं',
      kn: 'ನೀವು ಈ ರೀತಿ ಲಾಗಿನ್ ಆಗಿದ್ದೀರಿ',
      mr: 'तुम्ही या रूपात लॉग इन आहात'
    },
    continueAs: {
      owner: {
        en: 'Continue as Owner',
        hi: 'मालिक के रूप में जारी रखें',
        kn: 'ಮಾಲೀಕರಾಗಿ ಮುಂದುವರಿಸಿ',
        mr: 'मालक म्हणून सुरू ठेवा'
      },
      worker: {
        en: 'Continue as Worker',
        hi: 'श्रमिक के रूप में जारी रखें',
        kn: 'ಕಾರ್ಮಿಕರಾಗಿ ಮುಂದುವರಿಸಿ',
        mr: 'कामगार म्हणून सुरू ठेवा'
      }
    },
    switchAccount: {
      en: 'Switch Account',
      hi: 'खाता बदलें',
      kn: 'ಖಾತೆ ಬದಲಿಸಿ',
      mr: 'खाते बदला'
    },
    switchDesc: {
      en: 'Log out and use a different account',
      hi: 'लॉग आउट करें और अलग खाता उपयोग करें',
      kn: 'ಲಾಗ್ ಔಟ್ ಮಾಡಿ ಮತ್ತು ಬೇರೆ ಖಾತೆ ಬಳಸಿ',
      mr: 'लॉग आउट करा आणि वेगळे खाते वापरा'
    },
    profileActive: {
      owner: {
        en: 'Your owner profile is active',
        hi: 'आपका मालिक प्रोफ़ाइल सक्रिय है',
        kn: 'ನಿಮ್ಮ ಮಾಲೀಕ ಪ್ರೊಫೈಲ್ ಸಕ್ರಿಯವಾಗಿದೆ',
        mr: 'तुमचे मालक प्रोफाइल सक्रिय आहे'
      },
      worker: {
        en: 'Your worker profile is active',
        hi: 'आपका श्रमिक प्रोफ़ाइल सक्रिय है',
        kn: 'ನಿಮ್ಮ ಕಾರ್ಮಿಕ ಪ್ರೊಫೈಲ್ ಸಕ್ರಿಯವಾಗಿದೆ',
        mr: 'तुमचे कामगार प्रोफाइल सक्रिय आहे'
      }
    },
    goTo: {
      owner: {
        en: 'Go to Services',
        hi: 'सेवाओं पर जाएं',
        kn: 'ಸೇವೆಗಳಿಗೆ ಹೋಗಿ',
        mr: 'सेवांवर जा'
      },
      worker: {
        en: 'Go to Dashboard',
        hi: 'डैशबोर्ड पर जाएं',
        kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ',
        mr: 'डॅशबोर्डवर जा'
      }
    },
    dataWillBeUsed: {
      en: 'Your existing data will be used:',
      hi: 'आपका मौजूदा डेटा उपयोग किया जाएगा:',
      kn: 'ನಿಮ್ಮ ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಡೇಟಾ ಬಳಸಲಾಗುತ್ತದೆ:',
      mr: 'तुमचा विद्यमान डेटा वापरला जाईल:'
    }
  };

  const getText = (key: keyof typeof texts, subKey?: 'owner' | 'worker') => {
    const textObj = texts[key];
    if (subKey && typeof textObj === 'object' && subKey in textObj) {
      const subObj = textObj[subKey as keyof typeof textObj];
      if (typeof subObj === 'object' && language in subObj) {
        return subObj[language as keyof typeof subObj] || subObj['en' as keyof typeof subObj];
      }
    }
    if (typeof textObj === 'object' && language in textObj) {
      return textObj[language as keyof typeof textObj] || textObj['en' as keyof typeof textObj];
    }
    return '';
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            {getText('title', targetPortal)}
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-2"
        >
          <p className="text-sm text-muted-foreground">
            {getText('loggedInAs')}: <strong>{user.email}</strong>
          </p>

          {hasProfile ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">{getText('profileActive', targetPortal)}</span>
              </div>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => {
                  onClose();
                  navigate(isOwnerTarget ? '/services' : '/for-workers/dashboard');
                }}
              >
                <Icon className="w-4 h-4 mr-2" />
                {getText('goTo', targetPortal)}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {existingData && (existingData.name || existingData.phone) && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    {getText('dataWillBeUsed')}
                  </p>
                  <ul className="text-sm space-y-1">
                    {existingData.name && <li>• Name: {existingData.name}</li>}
                    {existingData.phone && <li>• Phone: {existingData.phone}</li>}
                  </ul>
                </div>
              )}
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleContinue}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Icon className="w-4 h-4 mr-2" />
                    {getText('continueAs', targetPortal)}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleSwitchAccount}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {getText('switchAccount')}
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            {getText('switchDesc')}
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
