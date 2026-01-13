import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Clock, Calendar, User, Phone, Mail, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SubService, Service } from '@/data/servicesData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { WorkerMatchModal } from './WorkerMatchModal';

interface RequirementFormProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  selectedSubServices: SubService[];
}

const houseSizes = [
  { id: '1bhk', label: '1 BHK', description: 'Small apartment' },
  { id: '2bhk', label: '2 BHK', description: 'Medium apartment' },
  { id: '3bhk', label: '3 BHK', description: 'Large apartment' },
  { id: '4bhk', label: '4+ BHK', description: 'Very large home' },
  { id: 'villa', label: 'Villa/Bungalow', description: 'Independent house' },
];

const timeSlots = [
  { id: 'morning', label: 'Morning', time: '6 AM - 10 AM' },
  { id: 'midday', label: 'Mid-Day', time: '10 AM - 2 PM' },
  { id: 'afternoon', label: 'Afternoon', time: '2 PM - 6 PM' },
  { id: 'evening', label: 'Evening', time: '6 PM - 10 PM' },
  { id: 'flexible', label: 'Flexible', time: 'Any time' },
];

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

export const RequirementForm = ({
  isOpen,
  onClose,
  service,
  selectedSubServices,
}: RequirementFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedWorkers, setMatchedWorkers] = useState<MatchedWorker[]>([]);
  const [isMatchingWorkers, setIsMatchingWorkers] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    houseSize: '',
    preferredTime: '',
    startDate: '',
    fullName: user?.user_metadata?.full_name || '',
    phone: '',
    email: user?.email || '',
    address: '',
    specialRequirements: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to submit a booking.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.from('bookings').insert({
        user_id: user.id,
        service_id: service.id,
        service_title: service.title,
        sub_services: selectedSubServices.map(s => ({ id: s.id, name: s.name })),
        house_size: formData.houseSize,
        preferred_time: formData.preferredTime,
        start_date: formData.startDate,
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        special_requirements: formData.specialRequirements || null,
        status: 'pending',
      }).select().single();

      if (error) throw error;
      
      toast({
        title: "Booking Request Submitted! 🎉",
        description: "Finding the best matched workers for you...",
      });

      // Store booking ID and trigger worker matching
      setCurrentBookingId(data.id);
      setIsSubmitting(false);
      setShowMatchModal(true);
      setIsMatchingWorkers(true);

      // Call the match-workers edge function
      try {
        const { data: matchData, error: matchError } = await supabase.functions.invoke('match-workers', {
          body: {
            bookingId: data.id,
            serviceType: service.id,
            preferredTime: formData.preferredTime,
            address: formData.address,
          },
        });

        if (matchError) throw matchError;

        if (matchData?.matchedWorkers) {
          setMatchedWorkers(matchData.matchedWorkers);
        }
      } catch (matchErr) {
        console.error('Error matching workers:', matchErr);
        // Still show the modal but with empty workers
        setMatchedWorkers([]);
      } finally {
        setIsMatchingWorkers(false);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Error",
        description: "Failed to submit booking. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleWorkerSelected = () => {
    // Reset form and close
    setStep(1);
    setFormData({
      houseSize: '',
      preferredTime: '',
      startDate: '',
      fullName: user?.user_metadata?.full_name || '',
      phone: '',
      email: user?.email || '',
      address: '',
      specialRequirements: '',
    });
    setShowMatchModal(false);
    setMatchedWorkers([]);
    setCurrentBookingId(null);
    onClose();
    navigate('/dashboard');
  };

  const handleCloseMatchModal = () => {
    setShowMatchModal(false);
    // Reset form state
    setStep(1);
    setFormData({
      houseSize: '',
      preferredTime: '',
      startDate: '',
      fullName: user?.user_metadata?.full_name || '',
      phone: '',
      email: user?.email || '',
      address: '',
      specialRequirements: '',
    });
    setMatchedWorkers([]);
    setCurrentBookingId(null);
    onClose();
    navigate('/dashboard');
  };

  const canProceedStep1 = formData.houseSize && formData.preferredTime && formData.startDate;
  const canProceedStep2 = formData.fullName && formData.phone && formData.email && formData.address;

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
          <div className={`p-4 sm:p-6 bg-gradient-to-br ${service.heroGradient}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${service.bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center`}>
                  <img src={service.icon} alt={service.title} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">{service.title}</h2>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {selectedSubServices.length} service{selectedSubServices.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted/80 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2 mt-4 sm:mt-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 sm:h-1.5 flex-1 rounded-full transition-colors ${
                    s <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                      <Home className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Tell us about your home
                    </h3>
                    
                    {/* House Size */}
                    <Label className="text-sm font-medium mb-2 sm:mb-3 block">House Size</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                      {houseSizes.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => handleInputChange('houseSize', size.id)}
                          className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                            formData.houseSize === size.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-medium text-foreground text-sm sm:text-base">{size.label}</div>
                          <div className="text-xs text-muted-foreground">{size.description}</div>
                        </button>
                      ))}
                    </div>

                    {/* Preferred Time */}
                    <Label className="text-sm font-medium mb-2 sm:mb-3 block flex items-center gap-2">
                      <Clock className="w-4 h-4 text-secondary" />
                      Preferred Time Slot
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleInputChange('preferredTime', slot.id)}
                          className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                            formData.preferredTime === slot.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-medium text-foreground text-sm sm:text-base">{slot.label}</div>
                          <div className="text-xs text-muted-foreground">{slot.time}</div>
                        </button>
                      ))}
                    </div>

                    {/* Start Date */}
                    <Label className="text-sm font-medium mb-2 sm:mb-3 block flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      When do you want to start?
                    </Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="max-w-full sm:max-w-xs"
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Your Contact Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-medium mb-2 block">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-sm font-medium mb-2 block">
                      Complete Address
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your full address including landmark"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Review & Additional Requirements
                  </h3>

                  {/* Summary */}
                  <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
                    <h4 className="font-medium text-foreground">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service</span>
                        <span className="font-medium text-foreground">{service.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sub-services</span>
                        <span className="font-medium text-foreground">{selectedSubServices.length} selected</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">House Size</span>
                        <span className="font-medium text-foreground">
                          {houseSizes.find(s => s.id === formData.houseSize)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time Slot</span>
                        <span className="font-medium text-foreground">
                          {timeSlots.find(s => s.id === formData.preferredTime)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start Date</span>
                        <span className="font-medium text-foreground">{formData.startDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Sub-services */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Selected Services</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubServices.map((sub) => (
                        <span
                          key={sub.id}
                          className={`px-3 py-1.5 ${service.bgColor} rounded-full text-sm font-medium`}
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <Label htmlFor="specialRequirements" className="text-sm font-medium mb-2 block">
                      Any Special Requirements? (Optional)
                    </Label>
                    <Textarea
                      id="specialRequirements"
                      placeholder="E.g., Need someone who speaks Hindi, vegetarian cooking only, pet-friendly..."
                      value={formData.specialRequirements}
                      onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Trust badge */}
                  <div className="flex items-center gap-3 bg-success/10 text-success rounded-xl p-4">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">
                      All workers are 100% verified with background checks. 7-day free trial included!
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-border flex items-center justify-between gap-3 sm:gap-4">
            {step > 1 ? (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                className="gap-2"
                size="sm"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 text-sm"
                size="sm"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Booking'}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Worker Match Modal */}
      <WorkerMatchModal
        isOpen={showMatchModal}
        onClose={handleCloseMatchModal}
        matchedWorkers={matchedWorkers}
        bookingId={currentBookingId || ''}
        isLoading={isMatchingWorkers}
        onWorkerSelected={handleWorkerSelected}
      />
    </AnimatePresence>
  );
};
