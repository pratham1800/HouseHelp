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
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
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

interface ProfileData {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  location: string | null;
  address: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [pendingLocation, setPendingLocation] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: ''
  });
  
  const [originalLocation, setOriginalLocation] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }
    
    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      setFormData({
        fullName: data?.full_name || user?.user_metadata?.full_name || '',
        email: user?.email || '',
        phone: data?.phone || '',
        location: data?.location || ''
      });
      
      setOriginalLocation(data?.location || '');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (loc1: string, loc2: string): number => {
    // Simplified distance calculation - in production, use a geocoding API
    // For now, if locations are different strings, assume > 30km
    if (!loc1 || !loc2) return 0;
    if (loc1.toLowerCase().trim() === loc2.toLowerCase().trim()) return 0;
    return 50; // Assume significant distance if different
  };

  const handleLocationChange = (newLocation: string) => {
    if (originalLocation && newLocation !== originalLocation) {
      const distance = calculateDistance(originalLocation, newLocation);
      if (distance > 30) {
        setPendingLocation(newLocation);
        setShowLocationWarning(true);
        return;
      }
    }
    setFormData(prev => ({ ...prev, location: newLocation }));
  };

  const confirmLocationChange = () => {
    setFormData(prev => ({ ...prev, location: pendingLocation }));
    setOriginalLocation(pendingLocation);
    setShowLocationWarning(false);
    setPendingLocation('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user!.id,
          full_name: formData.fullName,
          phone: formData.phone,
          location: formData.location,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

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
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container-main px-4 md:px-8 max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
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
                Update your personal information
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card-elevated p-6 space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    {user?.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{formData.fullName || 'User'}</h3>
                    <p className="text-sm text-muted-foreground">{formData.email}</p>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
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

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    placeholder="Enter your area/locality"
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
              Confirm Location Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change your location? This will affect your current workers/workplaces as it appears to be more than 30km away from your previous location.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingLocation('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmLocationChange}>
              Yes, Change Location
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default Profile;
