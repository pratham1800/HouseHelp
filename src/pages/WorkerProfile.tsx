import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Loader2, 
  ArrowLeft,
  AlertTriangle,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WorkerNavbar } from '@/components/WorkerNavbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WorkerData {
  id: string;
  name: string;
  phone: string;
  work_type: string;
  residential_address: string | null;
}

const WorkerProfile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [pendingLocation, setPendingLocation] = useState('');
  const [worker, setWorker] = useState<WorkerData | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [originalAddress, setOriginalAddress] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/for-workers/auth');
      return;
    }
    
    if (user) {
      fetchWorkerProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchWorkerProfile = async () => {
    try {
      // Get worker_auth link
      const { data: workerAuth } = await supabase
        .from('worker_auth')
        .select('worker_id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (workerAuth?.worker_id) {
        const { data: workerData } = await supabase
          .from('workers')
          .select('*')
          .eq('id', workerAuth.worker_id)
          .single();

        if (workerData) {
          setWorker(workerData);
          setFormData({
            name: workerData.name || '',
            email: user?.email || '',
            phone: workerData.phone || '',
            address: workerData.residential_address || ''
          });
          setOriginalAddress(workerData.residential_address || '');
        }
      } else {
        // No worker profile, use auth data
        setFormData({
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
          phone: '',
          address: ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (newAddress: string) => {
    if (originalAddress && newAddress !== originalAddress && originalAddress.length > 0) {
      // Simple check - if significantly different, show warning
      if (newAddress.length > 0 && !newAddress.toLowerCase().includes(originalAddress.toLowerCase().split(',')[0])) {
        setPendingLocation(newAddress);
        setShowLocationWarning(true);
        return;
      }
    }
    setFormData(prev => ({ ...prev, address: newAddress }));
  };

  const confirmLocationChange = () => {
    setFormData(prev => ({ ...prev, address: pendingLocation }));
    setOriginalAddress(pendingLocation);
    setShowLocationWarning(false);
    setPendingLocation('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (worker) {
        // Update existing worker
        const { error } = await supabase
          .from('workers')
          .update({
            name: formData.name,
            phone: formData.phone,
            residential_address: formData.address,
            updated_at: new Date().toISOString()
          })
          .eq('id', worker.id);

        if (error) throw error;
      }

      // Also update profiles table
      await supabase
        .from('profiles')
        .upsert({
          id: user!.id,
          full_name: formData.name,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        });

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
        <div className="container-main px-4 md:px-8 max-w-2xl mx-auto">
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
                My Profile
              </h1>
              <p className="text-muted-foreground">
                Update your personal and work information
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card-elevated p-6 space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Briefcase className="w-10 h-10 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{formData.name || 'Worker'}</h3>
                    <p className="text-sm text-muted-foreground">{worker?.work_type || 'Worker'}</p>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Residential Address
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    placeholder="Enter your full address"
                    rows={3}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </main>

      {/* Location Change Warning Dialog */}
      <AlertDialog open={showLocationWarning} onOpenChange={setShowLocationWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Confirm Address Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change your address? This may affect your current workplaces as it appears to be significantly different from your previous location.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingLocation('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmLocationChange}>
              Yes, Change Address
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default WorkerProfile;
