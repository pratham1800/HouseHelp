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
  Briefcase,
  Pencil,
  X,
  CheckCircle,
  Clock,
  Shield,
  Star,
  Calendar,
  LocateFixed
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { WorkerNavbar } from '@/components/WorkerNavbar';
import { Footer } from '@/components/Footer';
import { VerificationModal } from '@/components/VerificationModal';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/hooks/useLocation';
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
  id_proof_url: string | null;
  status: string | null;
  years_experience: number | null;
  languages_spoken: string[] | null;
}

const workTypeLabels: Record<string, string> = {
  domestic_help: 'Domestic Help',
  cooking: 'Cooking',
  driving: 'Driving',
  gardening: 'Gardening'
};

const WorkerProfile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { fetchLocation, loading: locationLoading } = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingLocation, setPendingLocation] = useState('');
  const [worker, setWorker] = useState<WorkerData | null>(null);
  
  // Edit mode states
  const [editingField, setEditingField] = useState<string | null>(null);
  
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

  const startEditing = (field: string) => {
    setEditingField(field);
  };

  const cancelEditing = () => {
    if (worker) {
      setFormData({
        name: worker.name || '',
        email: user?.email || '',
        phone: worker.phone || '',
        address: worker.residential_address || ''
      });
    }
    setEditingField(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (worker) {
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

      await supabase
        .from('profiles')
        .upsert({
          id: user!.id,
          full_name: formData.name,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        });

      setEditingField(null);
      setOriginalAddress(formData.address);
      
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

  const handleVerificationSuccess = () => {
    fetchWorkerProfile();
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

  const profilePictureUrl = worker?.id_proof_url 
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/worker-documents/profile-${worker.id}` 
    : null;

  const needsVerification = !worker?.status || (worker?.status !== 'verified' && worker?.status !== 'pending_verification');

  const getStatusConfig = () => {
    const status = worker?.status;
    if (status === 'verified') {
      return { 
        label: t('verified'), 
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle
      };
    } else if (status === 'pending_verification') {
      return { 
        label: t('verificationPending'), 
        color: 'bg-amber-100 text-amber-700',
        icon: Clock
      };
    } else {
      return { 
        label: language === 'hi' ? 'सत्यापन आवश्यक' : language === 'kn' ? 'ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ' : language === 'mr' ? 'पडताळणी आवश्यक' : 'Verification Required', 
        color: 'bg-amber-100 text-amber-700',
        icon: AlertTriangle
      };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

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
            {language === 'hi' ? 'डैशबोर्ड पर वापस' : language === 'kn' ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ' : language === 'mr' ? 'डॅशबोर्डवर परत' : 'Back to Dashboard'}
          </Button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('myProfile')} 👤
            </h1>
            <p className="text-muted-foreground">
              {language === 'hi' ? 'अपनी व्यक्तिगत जानकारी देखें और अपडेट करें' : language === 'kn' ? 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ನವೀಕರಿಸಿ' : language === 'mr' ? 'तुमची वैयक्तिक माहिती पहा आणि अपडेट करा' : 'View and update your personal information'}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Card - Matching Dashboard style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-elevated p-6"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Profile Picture */}
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden border-4 border-border shadow-lg">
                    {profilePictureUrl ? (
                      <img 
                        src={profilePictureUrl} 
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <User className={`w-12 h-12 text-muted-foreground ${profilePictureUrl ? 'hidden' : ''}`} />
                  </div>
                  
                  <h2 className="text-xl font-bold text-foreground mb-1">{formData.name || 'Worker'}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{workTypeLabels[worker?.work_type || ''] || worker?.work_type || 'Worker'}</p>
                  
                  {/* Verification Status Badge - Matching Dashboard */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{statusConfig.label}</span>
                  </div>

                  {needsVerification && worker && (
                    <Button 
                      type="button"
                      className="w-full mt-4"
                      onClick={() => setShowVerificationModal(true)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('completeVerification')}
                    </Button>
                  )}
                </div>
              </motion.div>

              {/* Stats Cards - Matching Dashboard metric cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <div className="card-elevated p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{language === 'hi' ? 'कार्य प्रकार' : language === 'kn' ? 'ಕೆಲಸದ ಪ್ರಕಾರ' : language === 'mr' ? 'काम प्रकार' : 'Work Type'}</p>
                      <p className="text-lg font-bold text-foreground">{workTypeLabels[worker?.work_type || ''] || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="card-elevated p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Star className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('experience')}</p>
                      <p className="text-lg font-bold text-foreground">{worker?.years_experience || 0} {t('years')}</p>
                    </div>
                  </div>
                </div>

                <div className="card-elevated p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{language === 'hi' ? 'स्थिति' : language === 'kn' ? 'ಸ್ಥಿತಿ' : language === 'mr' ? 'स्थिती' : 'Status'}</p>
                      <p className="text-lg font-bold text-foreground capitalize">{worker?.status?.replace('_', ' ') || 'Pending'}</p>
                    </div>
                  </div>
                </div>

                {worker?.languages_spoken && worker.languages_spoken.length > 0 && (
                  <div className="card-elevated p-4 sm:col-span-2 lg:col-span-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{language === 'hi' ? 'भाषाएं' : language === 'kn' ? 'ಭಾಷೆಗಳು' : language === 'mr' ? 'भाषा' : 'Languages'}</p>
                        <div className="flex flex-wrap gap-2">
                          {worker.languages_spoken.map((lang: string) => (
                            <Badge key={lang} variant="secondary" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Contact Information Card - Matching Earnings card style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-3 card-elevated p-6"
              >
                <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {language === 'hi' ? 'संपर्क जानकारी' : language === 'kn' ? 'ಸಂಪರ್ಕ ಮಾಹಿತಿ' : language === 'mr' ? 'संपर्क माहिती' : 'Contact Information'}
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {language === 'hi' ? 'पूरा नाम' : language === 'kn' ? 'ಪೂರ್ಣ ಹೆಸರು' : language === 'mr' ? 'पूर्ण नाव' : 'Full Name'}
                    </Label>
                    {editingField === 'name' ? (
                      <div className="relative">
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your name"
                          className="pr-10"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="absolute right-2 top-2 p-1 hover:bg-muted rounded-md"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <span className={formData.name ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                          {formData.name || 'No name set'}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEditing('name')}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Email Field - Read Only */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {language === 'hi' ? 'ईमेल' : language === 'kn' ? 'ಇಮೇಲ್' : language === 'mr' ? 'ईमेल' : 'Email'}
                    </Label>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <span className="text-foreground font-medium">{formData.email}</span>
                      <Badge variant="secondary" className="text-xs">
                        {language === 'hi' ? 'केवल पढ़ने के लिए' : language === 'kn' ? 'ಓದಲು ಮಾತ್ರ' : language === 'mr' ? 'फक्त वाचनासाठी' : 'Read Only'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {language === 'hi' ? 'ईमेल बदला नहीं जा सकता' : language === 'kn' ? 'ಇಮೇಲ್ ಬದಲಾಯಿಸಲಾಗುವುದಿಲ್ಲ' : language === 'mr' ? 'ईमेल बदलता येत नाही' : 'Email cannot be changed'}
                    </p>
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {language === 'hi' ? 'फ़ोन नंबर' : language === 'kn' ? 'ಫೋನ್ ನಂಬರ್' : language === 'mr' ? 'फोन नंबर' : 'Phone Number'}
                    </Label>
                    {editingField === 'phone' ? (
                      <div className="relative">
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                          className="pr-10"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="absolute right-2 top-2 p-1 hover:bg-muted rounded-md"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <span className={formData.phone ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                          {formData.phone || 'No phone set'}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEditing('phone')}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Address Field */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {language === 'hi' ? 'आवासीय पता' : language === 'kn' ? 'ವಾಸದ ವಿಳಾಸ' : language === 'mr' ? 'निवासी पत्ता' : 'Residential Address'}
                    </Label>
                    {editingField === 'address' ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <Textarea
                            value={formData.address}
                            onChange={(e) => handleAddressChange(e.target.value)}
                            placeholder="Enter your address"
                            rows={3}
                            className="pr-10"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="absolute right-2 top-2 p-1 hover:bg-muted rounded-md"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const loc = await fetchLocation();
                            if (loc) {
                              handleAddressChange(loc.address);
                            }
                          }}
                          disabled={locationLoading}
                        >
                          {locationLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <LocateFixed className="w-4 h-4 mr-2" />
                          )}
                          {language === 'hi' ? 'स्थान पता लगाएं' : language === 'kn' ? 'ಸ್ಥಳವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ' : language === 'mr' ? 'स्थान शोधा' : 'Detect Location'}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl min-h-[80px]">
                        <span className={formData.address ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                          {formData.address || 'No address set'}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEditing('address')}
                          className="p-2 hover:bg-muted rounded-lg transition-colors self-start"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button - only show when editing */}
                {editingField && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {language === 'hi' ? 'सहेज रहा है...' : language === 'kn' ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : language === 'mr' ? 'जतन करत आहे...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t('save')} {language === 'hi' ? 'परिवर्तन' : language === 'kn' ? 'ಬದಲಾವಣೆಗಳು' : language === 'mr' ? 'बदल' : 'Changes'}
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </form>
        </div>
      </main>

      {/* Location Change Warning Dialog */}
      <AlertDialog open={showLocationWarning} onOpenChange={setShowLocationWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {language === 'hi' ? 'पता परिवर्तन की पुष्टि करें' : language === 'kn' ? 'ವಿಳಾಸ ಬದಲಾವಣೆಯನ್ನು ದೃಢೀಕರಿಸಿ' : language === 'mr' ? 'पत्ता बदल निश्चित करा' : 'Confirm Address Change'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'hi' ? 'क्या आप वाकई अपना पता बदलना चाहते हैं? यह आपके वर्तमान कार्यस्थलों को प्रभावित कर सकता है।' : language === 'kn' ? 'ನಿಮ್ಮ ವಿಳಾಸವನ್ನು ಬದಲಾಯಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ? ಇದು ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಕೆಲಸದ ಸ್ಥಳಗಳ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರಬಹುದು.' : language === 'mr' ? 'तुम्ही खात्री आहात की तुम्ही तुमचा पत्ता बदलू इच्छिता? हे तुमच्या सध्याच्या कामाच्या ठिकाणांवर परिणाम करू शकते.' : 'Are you sure you want to change your address? This may affect your current workplaces as it appears to be significantly different from your previous location.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingLocation('')}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmLocationChange}>
              {language === 'hi' ? 'हाँ, पता बदलें' : language === 'kn' ? 'ಹೌದು, ವಿಳಾಸ ಬದಲಾಯಿಸಿ' : language === 'mr' ? 'हो, पत्ता बदला' : 'Yes, Change Address'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verification Modal */}
      {worker && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          workerId={worker.id}
          onSuccess={handleVerificationSuccess}
        />
      )}

      <Footer />
    </div>
  );
};

export default WorkerProfile;
