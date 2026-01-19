import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Upload,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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

export default function WorkerRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    hasWhatsapp: true,
    workType: '',
    yearsExperience: '',
    languagesSpoken: [] as string[],
    preferredAreas: [] as string[],
    workingHours: 'full_day',
    residentialAddress: '',
    notes: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdProofFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to register workers',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.name || !formData.phone || !formData.workType) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      let idProofUrl = null;

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

      // Insert worker record
      const { data: workerData, error: workerError } = await supabase
        .from('workers')
        .insert({
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          phone: formData.phone,
          has_whatsapp: formData.hasWhatsapp,
          work_type: formData.workType,
          years_experience: formData.yearsExperience ? parseInt(formData.yearsExperience) : 0,
          languages_spoken: formData.languagesSpoken,
          preferred_areas: formData.preferredAreas,
          working_hours: formData.workingHours,
          id_proof_url: idProofUrl,
          residential_address: formData.residentialAddress || null,
          notes: formData.notes || null,
          status: 'pending_verification'
        })
        .select('id')
        .single();

      if (workerError) throw workerError;

      // Create worker_auth entry to link user to worker profile
      const { error: authError } = await supabase
        .from('worker_auth')
        .insert({
          user_id: user.id,
          worker_id: workerData.id
        });

      if (authError) {
        console.error('Error creating worker_auth link:', authError);
        // Worker was created but linking failed - still show success but log the error
      }

      toast({
        title: 'Worker Registered!',
        description: 'Your profile has been created and is pending verification.',
      });

      // Redirect to worker dashboard
      navigate('/for-workers/dashboard');

    } catch (error: any) {
      console.error('Error registering worker:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 section-padding">
          <div className="container-main text-center">
            <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
            <p className="text-muted-foreground mb-6">
              This page is for internal team use only. Please login to continue.
            </p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4">
                Internal Use Only
              </span>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Worker Registration Form
              </h1>
              <p className="text-muted-foreground">
                Fill in the worker details. All fields marked with * are required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="card-elevated p-6 space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
                
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
                <h2 className="text-lg font-semibold text-foreground">Work Details</h2>
                
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

              {/* Additional Info */}
              <div className="card-elevated p-6 space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Additional Information</h2>
                
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

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes / Special Information</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional notes about the worker..."
                    rows={3}
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Worker'
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}