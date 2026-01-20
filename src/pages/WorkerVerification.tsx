import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Upload,
  User,
  Phone,
  Briefcase,
  MessageCircle,
  FileText,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getSubcategoriesForWorkType, getSubcategoryLabel } from '@/data/workerSubcategories';

interface WorkerData {
  id: string;
  name: string;
  phone: string;
  work_type: string;
  work_subcategories: string[] | null;
  status: string;
  years_experience: number;
  languages_spoken: string[];
  preferred_areas: string[];
  working_hours: string;
  residential_address: string | null;
  age: number | null;
  gender: string | null;
  has_whatsapp: boolean;
  id_proof_url: string | null;
}

const workTypes = [
  { value: 'domestic_help', label: 'Domestic Help (घरेलू सहायता)' },
  { value: 'cooking', label: 'Cooking (खाना बनाना)' },
  { value: 'driving', label: 'Driving (ड्राइविंग)' },
  { value: 'gardening', label: 'Gardening (बागवानी)' },
];

const languageOptions = [
  'English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati'
];

const areaOptions = [
  'Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Electronic City',
  'Jayanagar', 'JP Nagar', 'BTM Layout', 'Marathahalli', 'Bannerghatta Road'
];

const workingHoursOptions = [
  { value: 'morning', label: 'Morning (6 AM - 12 PM)' },
  { value: 'evening', label: 'Evening (12 PM - 8 PM)' },
  { value: 'full_day', label: 'Full Day (6 AM - 8 PM)' },
];

const statusConfig: Record<string, { label: string; color: string; icon: any; description: string }> = {
  pending_verification: {
    label: 'Pending Verification',
    color: 'bg-amber-100 text-amber-700',
    icon: Clock,
    description: 'Your profile is being reviewed by our team. This usually takes 24-48 hours.'
  },
  verified: {
    label: 'Verified',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
    description: 'Your profile is verified! You will be matched with households soon.'
  },
  rejected: {
    label: 'Verification Failed',
    color: 'bg-red-100 text-red-700',
    icon: AlertCircle,
    description: 'Your verification was not successful. Please contact support for assistance.'
  }
};

export default function WorkerVerification() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [worker, setWorker] = useState<WorkerData | null>(null);
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    hasWhatsapp: true,
    workType: 'domestic_help',
    workSubcategories: [] as string[],
    yearsExperience: '',
    languagesSpoken: [] as string[],
    preferredAreas: [] as string[],
    workingHours: 'full_day',
    residentialAddress: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/for-workers/auth');
      return;
    }
    
    if (user) {
      fetchWorkerData();
    }
  }, [user, authLoading, navigate]);

  const fetchWorkerData = async () => {
    try {
      const { data: workerAuth } = await supabase
        .from('worker_auth')
        .select('worker_id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (workerAuth?.worker_id) {
        setWorkerId(workerAuth.worker_id);
        
        const { data: workerData } = await supabase
          .from('workers')
          .select('*')
          .eq('id', workerAuth.worker_id)
          .single();

        if (workerData) {
          setWorker(workerData);
          setFormData({
            name: workerData.name || '',
            age: workerData.age?.toString() || '',
            gender: workerData.gender || '',
            phone: workerData.phone || '',
            hasWhatsapp: workerData.has_whatsapp ?? true,
            workType: workerData.work_type || 'domestic_help',
            workSubcategories: workerData.work_subcategories || [],
            yearsExperience: workerData.years_experience?.toString() || '',
            languagesSpoken: workerData.languages_spoken || [],
            preferredAreas: workerData.preferred_areas || [],
            workingHours: workerData.working_hours || 'full_day',
            residentialAddress: workerData.residential_address || '',
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      // Clear subcategories when work type changes
      if (field === 'workType' && value !== prev.workType) {
        return { ...prev, [field]: value, workSubcategories: [] };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleLanguageToggle = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languagesSpoken: prev.languagesSpoken.includes(lang)
        ? prev.languagesSpoken.filter(l => l !== lang)
        : [...prev.languagesSpoken, lang]
    }));
  };

  const handleAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      preferredAreas: prev.preferredAreas.includes(area)
        ? prev.preferredAreas.filter(a => a !== area)
        : [...prev.preferredAreas, area]
    }));
  };

  const handleSubcategoryToggle = (subcategory: string) => {
    setFormData(prev => ({
      ...prev,
      workSubcategories: prev.workSubcategories.includes(subcategory)
        ? prev.workSubcategories.filter(s => s !== subcategory)
        : [...prev.workSubcategories, subcategory]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdProofFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workerId || !formData.name || !formData.phone || !formData.workType) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);

    try {
      let idProofUrl = worker?.id_proof_url || null;

      // Upload ID proof if provided
      if (idProofFile) {
        const fileExt = idProofFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('worker-documents')
          .upload(fileName, idProofFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
        } else {
          idProofUrl = uploadData.path;
        }
      }

      // Update worker record
      const { error } = await supabase
        .from('workers')
        .update({
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          phone: formData.phone,
          has_whatsapp: formData.hasWhatsapp,
          work_type: formData.workType,
          work_subcategories: formData.workSubcategories,
          years_experience: formData.yearsExperience ? parseInt(formData.yearsExperience) : 0,
          languages_spoken: formData.languagesSpoken,
          preferred_areas: formData.preferredAreas,
          working_hours: formData.workingHours,
          residential_address: formData.residentialAddress || null,
          id_proof_url: idProofUrl,
          status: 'pending_verification',
          updated_at: new Date().toISOString()
        })
        .eq('id', workerId);

      if (error) throw error;

      toast({
        title: 'Profile Updated!',
        description: 'Your profile has been submitted for verification.',
      });

      // Refresh data
      fetchWorkerData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
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

  // If no worker profile linked yet
  if (!workerId) {
    return (
      <div className="min-h-screen bg-background">
        <WorkerNavbar />
        <main className="pt-20 section-padding">
          <div className="container-main text-center max-w-md mx-auto">
            <div className="card-elevated p-8">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Profile Not Found
              </h1>
              <p className="text-muted-foreground mb-6">
                Please start by creating your worker profile from the auth page.
              </p>
              <Button onClick={() => navigate('/for-workers/auth')} className="w-full">
                Get Started
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStatus = statusConfig[worker?.status || 'pending_verification'];
  const StatusIcon = currentStatus.icon;

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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            {/* Status Banner */}
            <div className={`rounded-xl p-4 mb-8 ${currentStatus.color}`}>
              <div className="flex items-center gap-3">
                <StatusIcon className="w-6 h-6" />
                <div>
                  <p className="font-semibold">{currentStatus.label}</p>
                  <p className="text-sm opacity-90">{currentStatus.description}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Worker Verification
              </h1>
              <p className="text-muted-foreground">
                Complete your profile to get verified and start receiving work opportunities
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="card-elevated p-6 space-y-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Basic Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder="25"
                      min="18"
                      max="65"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={formData.gender} onValueChange={(v) => handleInputChange('gender', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="whatsapp"
                    checked={formData.hasWhatsapp}
                    onCheckedChange={(checked) => handleInputChange('hasWhatsapp', checked)}
                  />
                  <Label htmlFor="whatsapp" className="cursor-pointer">
                    This phone number has WhatsApp
                  </Label>
                </div>
              </div>

              {/* Work Details */}
              <div className="card-elevated p-6 space-y-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-secondary" />
                  Work Details
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Type of Work *</Label>
                    <Select value={formData.workType} onValueChange={(v) => handleInputChange('workType', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work type" />
                      </SelectTrigger>
                      <SelectContent>
                        {workTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={formData.yearsExperience}
                      onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                      placeholder="5"
                      min="0"
                      max="50"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Working Hours Preference</Label>
                    <Select value={formData.workingHours} onValueChange={(v) => handleInputChange('workingHours', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {workingHoursOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Subcategories based on work type */}
                {(formData.workType === 'domestic_help' || formData.workType === 'cooking') && (
                  <div className="space-y-3">
                    <Label>{getSubcategoryLabel(formData.workType)} *</Label>
                    <p className="text-sm text-muted-foreground">
                      Select all that apply. You can choose multiple options.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getSubcategoriesForWorkType(formData.workType).map(subcategory => (
                        <button
                          key={subcategory.value}
                          type="button"
                          onClick={() => handleSubcategoryToggle(subcategory.value)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            formData.workSubcategories.includes(subcategory.value)
                              ? 'bg-secondary text-secondary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {formData.workSubcategories.includes(subcategory.value) && (
                            <Check className="w-4 h-4 inline mr-1" />
                          )}
                          {subcategory.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label>Languages Spoken</Label>
                  <div className="flex flex-wrap gap-2">
                    {languageOptions.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleLanguageToggle(lang)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          formData.languagesSpoken.includes(lang)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {formData.languagesSpoken.includes(lang) && (
                          <Check className="w-4 h-4 inline mr-1" />
                        )}
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Preferred Working Areas</Label>
                  <div className="flex flex-wrap gap-2">
                    {areaOptions.map(area => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handleAreaToggle(area)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          formData.preferredAreas.includes(area)
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {formData.preferredAreas.includes(area) && (
                          <Check className="w-4 h-4 inline mr-1" />
                        )}
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="card-elevated p-6 space-y-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  Documents & Address
                </h2>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Residential Address</Label>
                  <Textarea
                    id="address"
                    value={formData.residentialAddress}
                    onChange={(e) => handleInputChange('residentialAddress', e.target.value)}
                    placeholder="Enter full address"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idproof">ID Proof Upload</Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                    <input
                      type="file"
                      id="idproof"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="idproof" className="cursor-pointer">
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      {idProofFile ? (
                        <p className="text-primary font-medium">{idProofFile.name}</p>
                      ) : worker?.id_proof_url ? (
                        <p className="text-green-600 font-medium flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Document Uploaded - Click to replace
                        </p>
                      ) : (
                        <>
                          <p className="text-muted-foreground">
                            Click to upload Aadhaar, PAN, or Voter ID
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG or PDF up to 5MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" size="lg" className="flex-1" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save & Submit for Verification'
                  )}
                </Button>
              </div>

              {/* Support */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => window.open('https://wa.me/919876543210?text=Hi, I need help with my verification', '_blank')}
                  className="text-muted-foreground"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Need help? Contact Support
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}