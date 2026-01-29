import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Clock, Calendar, User, Phone, Mail, MessageSquare, ArrowRight, CheckCircle, CreditCard, Users, Utensils, Car, Flower2, LocateFixed, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SubService, Service } from '@/data/servicesData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { WorkerMatchModal } from './WorkerMatchModal';
import { useLocation } from '@/hooks/useLocation';

interface RequirementFormProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  selectedSubServices: SubService[];
}

// Cleaning-specific options
const houseSizes = [
  { id: '1bhk', label: '1 BHK', description: 'Small apartment' },
  { id: '2bhk', label: '2 BHK', description: 'Medium apartment' },
  { id: '3bhk', label: '3 BHK', description: 'Large apartment' },
  { id: '4bhk', label: '4+ BHK', description: 'Very large home' },
  { id: 'villa', label: 'Villa/Bungalow', description: 'Independent house' },
];

const bathroomCounts = [
  { id: '1', label: '1 Bathroom' },
  { id: '2', label: '2 Bathrooms' },
  { id: '3', label: '3 Bathrooms' },
  { id: '4+', label: '4+ Bathrooms' },
];

// Cooking-specific options
const familyMembers = [
  { id: '1-2', label: '1-2 Members', description: 'Couple / Single' },
  { id: '3-4', label: '3-4 Members', description: 'Small family' },
  { id: '5-6', label: '5-6 Members', description: 'Medium family' },
  { id: '7+', label: '7+ Members', description: 'Large family' },
];

const cuisinePreferences = [
  { id: 'north-indian', label: 'North Indian' },
  { id: 'south-indian', label: 'South Indian' },
  { id: 'gujarati', label: 'Gujarati' },
  { id: 'punjabi', label: 'Punjabi' },
  { id: 'bengali', label: 'Bengali' },
  { id: 'continental', label: 'Continental' },
  { id: 'chinese', label: 'Chinese' },
  { id: 'mixed', label: 'Mixed / All' },
];

const dietaryPreferences = [
  { id: 'veg', label: 'Pure Vegetarian', description: 'No meat, fish, or eggs' },
  { id: 'egg', label: 'Eggitarian', description: 'Veg + Eggs' },
  { id: 'nonveg', label: 'Non-Vegetarian', description: 'All types of food' },
  { id: 'jain', label: 'Jain', description: 'No onion, garlic, root vegetables' },
];

// Driver-specific options
const vehicleTypes = [
  { id: 'hatchback', label: 'Hatchback', description: 'Swift, i10, etc.' },
  { id: 'sedan', label: 'Sedan', description: 'City, Verna, etc.' },
  { id: 'suv', label: 'SUV', description: 'Creta, Seltos, etc.' },
  { id: 'luxury', label: 'Luxury', description: 'BMW, Mercedes, etc.' },
];

const transmissionTypes = [
  { id: 'manual', label: 'Manual' },
  { id: 'automatic', label: 'Automatic' },
  { id: 'both', label: 'Both' },
];

// Gardening-specific options
const gardenTypes = [
  { id: 'terrace', label: 'Terrace Garden', description: 'Rooftop plants' },
  { id: 'balcony', label: 'Balcony Garden', description: 'Balcony pots' },
  { id: 'lawn', label: 'Lawn/Yard', description: 'Ground-level garden' },
  { id: 'indoor', label: 'Indoor Plants', description: 'Interior plants' },
];

const gardenSizes = [
  { id: 'small', label: 'Small', description: 'Up to 10 plants' },
  { id: 'medium', label: 'Medium', description: '10-30 plants' },
  { id: 'large', label: 'Large', description: '30-50 plants' },
  { id: 'xlarge', label: 'Very Large', description: '50+ plants' },
];

const timeSlots = [
  { id: 'morning', label: 'Morning', time: '6 AM - 10 AM' },
  { id: 'midday', label: 'Mid-Day', time: '10 AM - 2 PM' },
  { id: 'evening', label: 'Evening', time: '5 PM - 9 PM' },
  { id: 'flexible', label: 'Flexible', time: 'Any time' },
];

// Time slots for lunch (no evening option)
const lunchTimeSlots = [
  { id: 'morning', label: 'Morning', time: '6 AM - 10 AM' },
  { id: 'midday', label: 'Mid-Day', time: '10 AM - 2 PM' },
  { id: 'flexible', label: 'Flexible', time: 'Any time' },
];

const MATCHING_FEE = 199;

// Helper function to get minimum selectable date in local timezone (YYYY-MM-DD format)
// If current time is after 5 PM, return tomorrow's date, otherwise return today's date
const getMinSelectableDate = (): string => {
  const now = new Date();
  const currentHour = now.getHours();
  
  // If it's after 5 PM (17:00), use tomorrow's date
  const targetDate = currentHour >= 17 ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : now;
  
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
  const { fetchLocation, loading: locationLoading } = useLocation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedWorkers, setMatchedWorkers] = useState<MatchedWorker[]>([]);
  const [isMatchingWorkers, setIsMatchingWorkers] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [hasAttemptedLocationFetch, setHasAttemptedLocationFetch] = useState(false);

  const [formData, setFormData] = useState({
    // Common fields
    preferredTime: '',
    startDate: '',
    fullName: user?.user_metadata?.full_name || '',
    phone: '',
    email: user?.email || '',
    address: '',
    specialRequirements: '',
    // Cleaning-specific
    houseSize: '',
    bathroomCount: '',
    // Cooking-specific
    familyMembers: '',
    cuisinePreference: '',
    dietaryPreference: '',
    // Driver-specific
    vehicleType: '',
    transmissionType: '',
    primaryUse: '',
    // Gardening-specific
    gardenType: '',
    gardenSize: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-fetch location when entering step 2 (contact details) if address is empty
  useEffect(() => {
    const autoFetchLocation = async () => {
      if (step === 2 && !formData.address && !hasAttemptedLocationFetch && user) {
        setHasAttemptedLocationFetch(true);
        
        // First check if user already has location in profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('location, address')
          .eq('id', user.id)
          .single();
        
        if (profile?.address) {
          // Use existing address from profile
          handleInputChange('address', profile.address);
        } else if (profile?.location) {
          // Use location as address if address not set
          handleInputChange('address', profile.location);
        } else {
          // No location in profile, auto-detect it
          const locationData = await fetchLocation();
          if (locationData) {
            handleInputChange('address', locationData.address);
            
            // Save to profile for future use
            await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                location: locationData.address,
              }, { onConflict: 'id' });
          }
        }
      }
    };
    
    autoFetchLocation();
  }, [step, formData.address, hasAttemptedLocationFetch, user, fetchLocation]);

  // Manual location fetch handler
  const handleManualLocationFetch = async () => {
    const locationData = await fetchLocation();
    if (locationData) {
      handleInputChange('address', locationData.address);
      
      // Save to profile for future use
      if (user) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            location: locationData.address,
          }, { onConflict: 'id' });
      }
    }
  };

  // Helper functions to determine which fields to show based on selected sub-services
  const hasSubService = (subServiceId: string) => {
    return selectedSubServices.some(sub => sub.id === subServiceId);
  };

  const shouldShowHouseSize = () => {
    if (service.id !== 'cleaning') return false;
    // Show house size for:
    // 1. Full-house (needs both house size and family members)
    // 2. All other cleaning sub-services (mopping, brooming, bathroom, etc.) - NOT dishwashing or laundry
    const hasDishwashing = hasSubService('dishwashing');
    const hasLaundry = hasSubService('laundry');
    const hasFullHouse = hasSubService('full-house');
    
    // If full-house is selected, always show house size
    if (hasFullHouse) return true;
    
    // If only dishwashing or laundry (without full-house), don't show house size
    if ((hasDishwashing || hasLaundry) && !hasFullHouse) return false;
    
    // For all other cleaning services (mopping, brooming, bathroom, etc.), show house size
    return true;
  };

  const shouldShowFamilyMembers = () => {
    if (service.id !== 'cleaning') return false;
    // Show family members ONLY for: dishwashing, laundry, or full-house
    // NOT for other cleaning services (mopping, brooming, bathroom, etc.)
    return hasSubService('dishwashing') || 
           hasSubService('laundry') || 
           hasSubService('full-house');
  };

  const shouldShowPreferredTime = () => {
    // Hide preferred time for full-time driver and night shift driver (they work specific hours anyway)
    if (service.id === 'driver' && (hasSubService('full-time') || hasSubService('night-driver'))) {
      return false;
    }
    // Hide preferred time for breakfast only (always morning)
    if (service.id === 'cooking' && hasSubService('breakfast') && 
        !hasSubService('lunch') && !hasSubService('dinner') && 
        !hasSubService('two-meals') && !hasSubService('all-meals') && 
        !hasSubService('special-cuisine')) {
      return false;
    }
    return true;
  };

  // Get appropriate time slots based on selected cooking sub-services
  const getAvailableTimeSlots = () => {
    if (service.id === 'cooking') {
      // For lunch only (no dinner, no all-meals, no two-meals) - exclude evening
      const hasLunch = hasSubService('lunch');
      const hasDinner = hasSubService('dinner');
      const hasTwoMeals = hasSubService('two-meals');
      const hasAllMeals = hasSubService('all-meals');
      
      if (hasLunch && !hasDinner && !hasTwoMeals && !hasAllMeals) {
        return lunchTimeSlots;
      }
    }
    return timeSlots;
  };

  const getServiceIcon = () => {
    switch (service.id) {
      case 'cleaning': return <Home className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />;
      case 'cooking': return <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />;
      case 'driver': return <Car className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />;
      case 'gardening': return <Flower2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />;
      default: return <Home className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />;
    }
  };

  const getStep1Title = () => {
    switch (service.id) {
      case 'cleaning': return 'Tell us about your home';
      case 'cooking': return 'Tell us about your household';
      case 'driver': return 'Tell us about your vehicle';
      case 'gardening': return 'Tell us about your garden';
      default: return 'Tell us your requirements';
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Create payment record
      const { error: paymentError } = await supabase.from('booking_payments').insert({
        user_id: user.id,
        booking_id: currentBookingId!,
        amount: MATCHING_FEE,
        payment_type: 'matching_fee',
        status: 'completed', // In production, this would be after actual payment verification
      });

      if (paymentError) throw paymentError;

      setPaymentCompleted(true);
      
      toast({
        title: "Payment Successful! 🎉",
        description: "Finding the best matched workers for you...",
      });

      // Now trigger worker matching
      setShowMatchModal(true);
      setIsMatchingWorkers(true);

      try {
        // For full-time driver, use 'flexible' as preferredTime if not set
        // For breakfast only cooking, use 'morning'
        const getPreferredTimeForMatching = () => {
          if (!shouldShowPreferredTime()) {
            if (service.id === 'driver' && hasSubService('full-time')) {
              return 'flexible';
            }
            if (service.id === 'cooking' && hasSubService('breakfast')) {
              return 'morning';
            }
          }
          return formData.preferredTime;
        };
        const preferredTimeForMatching = getPreferredTimeForMatching();
        
        const { data: matchData, error: matchError } = await supabase.functions.invoke('match-workers', {
          body: {
            bookingId: currentBookingId,
            serviceType: service.id,
            preferredTime: preferredTimeForMatching,
            address: formData.address,
            subServices: selectedSubServices.map(s => ({ id: s.id, name: s.name })),
          },
        });

        if (matchError) throw matchError;

        if (matchData?.matchedWorkers) {
          setMatchedWorkers(matchData.matchedWorkers);
        }
      } catch (matchErr) {
        console.error('Error matching workers:', matchErr);
        setMatchedWorkers([]);
      } finally {
        setIsMatchingWorkers(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
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
      // Build service-specific details
      // For full-time driver, set preferredTime to 'flexible' if not provided
      // For breakfast only cooking, set preferredTime to 'morning'
      const getPreferredTimeValue = () => {
        if (!shouldShowPreferredTime()) {
          if (service.id === 'driver' && hasSubService('full-time')) {
            return 'flexible';
          }
          if (service.id === 'cooking' && hasSubService('breakfast')) {
            return 'morning';
          }
        }
        return formData.preferredTime;
      };
      const preferredTimeValue = getPreferredTimeValue();
      
      const serviceDetails = {
        // Common
        preferredTime: preferredTimeValue,
        startDate: formData.startDate,
        // Service-specific (will be stored in sub_services JSON)
        ...(service.id === 'cleaning' && {
          ...(shouldShowHouseSize() && { houseSize: formData.houseSize }),
          ...(shouldShowFamilyMembers() && { familyMembers: formData.familyMembers }),
          ...(formData.bathroomCount && { bathroomCount: formData.bathroomCount }),
        }),
        ...(service.id === 'cooking' && {
          familyMembers: formData.familyMembers,
          cuisinePreference: formData.cuisinePreference,
          dietaryPreference: formData.dietaryPreference,
        }),
        ...(service.id === 'driver' && {
          vehicleType: formData.vehicleType,
          transmissionType: formData.transmissionType,
          primaryUse: formData.primaryUse,
        }),
        ...(service.id === 'gardening' && {
          gardenType: formData.gardenType,
          gardenSize: formData.gardenSize,
        }),
      };

      const { data, error } = await supabase.from('bookings').insert({
        user_id: user.id,
        service_id: service.id,
        service_title: service.title,
        sub_services: {
          selectedServices: selectedSubServices.map(s => ({ id: s.id, name: s.name })),
          serviceDetails,
        },
        house_size: service.id === 'cleaning' && shouldShowHouseSize() && formData.houseSize ? formData.houseSize : (service.id === 'cleaning' ? 'N/A' : 'N/A'),
        preferred_time: preferredTimeValue,
        start_date: formData.startDate,
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        special_requirements: formData.specialRequirements || null,
        status: 'pending_payment',
      }).select().single();

      if (error) throw error;

      // Update user profile with address and phone number
      if (formData.address || formData.phone) {
        const profileUpdate: { id: string; address?: string; phone?: string } = {
          id: user.id,
        };
        if (formData.address) {
          profileUpdate.address = formData.address;
        }
        if (formData.phone) {
          profileUpdate.phone = formData.phone;
        }

        // Use upsert to update or create profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profileUpdate, {
            onConflict: 'id',
          });

        if (profileError) {
          console.error('Error updating profile:', profileError);
          // Don't throw error - booking is already created, just log it
        }
      }
      
      toast({
        title: "Booking Created! 💼",
        description: "Please complete the matching fee payment to see workers.",
      });

      // Store booking ID and move to payment step
      setCurrentBookingId(data.id);
      setIsSubmitting(false);
      setStep(4); // Move to payment step
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
    setStep(1);
    setFormData({
      preferredTime: '',
      startDate: '',
      fullName: user?.user_metadata?.full_name || '',
      phone: '',
      email: user?.email || '',
      address: '',
      specialRequirements: '',
      houseSize: '',
      bathroomCount: '',
      familyMembers: '',
      cuisinePreference: '',
      dietaryPreference: '',
      vehicleType: '',
      transmissionType: '',
      primaryUse: '',
      gardenType: '',
      gardenSize: '',
    });
    setShowMatchModal(false);
    setMatchedWorkers([]);
    setCurrentBookingId(null);
    setPaymentCompleted(false);
    onClose();
    navigate('/dashboard');
  };

  const handleCloseMatchModal = () => {
    setShowMatchModal(false);
    setStep(1);
    setFormData({
      preferredTime: '',
      startDate: '',
      fullName: user?.user_metadata?.full_name || '',
      phone: '',
      email: user?.email || '',
      address: '',
      specialRequirements: '',
      houseSize: '',
      bathroomCount: '',
      familyMembers: '',
      cuisinePreference: '',
      dietaryPreference: '',
      vehicleType: '',
      transmissionType: '',
      primaryUse: '',
      gardenType: '',
      gardenSize: '',
    });
    setMatchedWorkers([]);
    setCurrentBookingId(null);
    setPaymentCompleted(false);
    onClose();
    navigate('/dashboard');
  };

  // Service-specific validation for step 1
  const canProceedStep1 = () => {
    // For full-time driver, preferredTime is not required
    const hasCommon = shouldShowPreferredTime() 
      ? (formData.preferredTime && formData.startDate)
      : formData.startDate;
    
    switch (service.id) {
      case 'cleaning':
        // For dishwashing/laundry: need familyMembers
        // For full-house: need both houseSize and familyMembers
        // For others: need houseSize
        if (hasSubService('full-house')) {
          return hasCommon && formData.houseSize && formData.familyMembers;
        } else if (hasSubService('dishwashing') || hasSubService('laundry')) {
          return hasCommon && formData.familyMembers;
        } else {
          return hasCommon && formData.houseSize;
        }
      case 'cooking':
        return hasCommon && formData.familyMembers && formData.dietaryPreference;
      case 'driver':
        return hasCommon && formData.vehicleType && formData.transmissionType;
      case 'gardening':
        return hasCommon && formData.gardenType && formData.gardenSize;
      default:
        return hasCommon;
    }
  };

  const canProceedStep2 = formData.fullName && formData.phone && formData.email && formData.address;

  // Get summary label for service-specific data
  const getServiceSummary = () => {
    switch (service.id) {
      case 'cleaning':
        return (
          <>
            {shouldShowHouseSize() && formData.houseSize && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">House Size</span>
                <span className="font-medium text-foreground">
                  {houseSizes.find(s => s.id === formData.houseSize)?.label || '-'}
                </span>
              </div>
            )}
            {shouldShowFamilyMembers() && formData.familyMembers && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. of People</span>
                <span className="font-medium text-foreground">
                  {familyMembers.find(f => f.id === formData.familyMembers)?.label || '-'}
                </span>
              </div>
            )}
            {formData.bathroomCount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bathrooms</span>
                <span className="font-medium text-foreground">
                  {bathroomCounts.find(b => b.id === formData.bathroomCount)?.label || '-'}
                </span>
              </div>
            )}
          </>
        );
      case 'cooking':
        return (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Family Members</span>
              <span className="font-medium text-foreground">
                {familyMembers.find(f => f.id === formData.familyMembers)?.label || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cuisine</span>
              <span className="font-medium text-foreground">
                {cuisinePreferences.find(c => c.id === formData.cuisinePreference)?.label || 'Any'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Diet</span>
              <span className="font-medium text-foreground">
                {dietaryPreferences.find(d => d.id === formData.dietaryPreference)?.label || '-'}
              </span>
            </div>
          </>
        );
      case 'driver':
        return (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle Type</span>
              <span className="font-medium text-foreground">
                {vehicleTypes.find(v => v.id === formData.vehicleType)?.label || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transmission</span>
              <span className="font-medium text-foreground">
                {transmissionTypes.find(t => t.id === formData.transmissionType)?.label || '-'}
              </span>
            </div>
          </>
        );
      case 'gardening':
        return (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Garden Type</span>
              <span className="font-medium text-foreground">
                {gardenTypes.find(g => g.id === formData.gardenType)?.label || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Garden Size</span>
              <span className="font-medium text-foreground">
                {gardenSizes.find(g => g.id === formData.gardenSize)?.label || '-'}
              </span>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const totalSteps = 4; // Service details, Contact, Review, Payment

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
              {[1, 2, 3, 4].map((s) => (
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
              {/* Step 1: Service-specific questions */}
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
                      {getServiceIcon()}
                      {getStep1Title()}
                    </h3>
                    
                    {/* Cleaning-specific fields */}
                    {service.id === 'cleaning' && (
                      <>
                        {/* House Size - Show for full-house or if neither dishwashing nor laundry is selected */}
                        {shouldShowHouseSize() && (
                          <>
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
                          </>
                        )}

                        {/* Family Members - Show for dishwashing, laundry, or full-house */}
                        {shouldShowFamilyMembers() && (
                          <>
                            <Label className="text-sm font-medium mb-2 sm:mb-3 block flex items-center gap-2">
                              <Users className="w-4 h-4 text-primary" />
                              Number of People in Household
                            </Label>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                              {familyMembers.map((size) => (
                                <button
                                  key={size.id}
                                  onClick={() => handleInputChange('familyMembers', size.id)}
                                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                                    formData.familyMembers === size.id
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                >
                                  <div className="font-medium text-foreground text-sm sm:text-base">{size.label}</div>
                                  <div className="text-xs text-muted-foreground">{size.description}</div>
                                </button>
                              ))}
                            </div>
                          </>
                        )}

                        {/* Show bathroom count if bathroom cleaning is selected */}
                        {selectedSubServices.some(s => s.id === 'bathroom') && (
                          <>
                            <Label className="text-sm font-medium mb-2 sm:mb-3 block">Number of Bathrooms</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                              {bathroomCounts.map((count) => (
                                <button
                                  key={count.id}
                                  onClick={() => handleInputChange('bathroomCount', count.id)}
                                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                                    formData.bathroomCount === count.id
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                >
                                  <div className="font-medium text-foreground text-sm">{count.label}</div>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {/* Cooking-specific fields */}
                    {service.id === 'cooking' && (
                      <>
                        <Label className="text-sm font-medium mb-2 sm:mb-3 block flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          How many family members?
                        </Label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                          {familyMembers.map((size) => (
                            <button
                              key={size.id}
                              onClick={() => handleInputChange('familyMembers', size.id)}
                              className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                                formData.familyMembers === size.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="font-medium text-foreground text-sm sm:text-base">{size.label}</div>
                              <div className="text-xs text-muted-foreground">{size.description}</div>
                            </button>
                          ))}
                        </div>

                        <Label className="text-sm font-medium mb-2 sm:mb-3 block">Dietary Preference</Label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                          {dietaryPreferences.map((diet) => (
                            <button
                              key={diet.id}
                              onClick={() => handleInputChange('dietaryPreference', diet.id)}
                              className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                                formData.dietaryPreference === diet.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="font-medium text-foreground text-sm sm:text-base">{diet.label}</div>
                              <div className="text-xs text-muted-foreground">{diet.description}</div>
                            </button>
                          ))}
                        </div>

                        <Label className="text-sm font-medium mb-2 sm:mb-3 block">Preferred Cuisine (Optional)</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                          {cuisinePreferences.map((cuisine) => (
                            <button
                              key={cuisine.id}
                              onClick={() => handleInputChange('cuisinePreference', cuisine.id)}
                              className={`p-3 rounded-xl border-2 transition-all text-center ${
                                formData.cuisinePreference === cuisine.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="font-medium text-foreground text-sm">{cuisine.label}</div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Driver-specific fields */}
                    {service.id === 'driver' && (
                      <>
                        <Label className="text-sm font-medium mb-2 sm:mb-3 block">Vehicle Type</Label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                          {vehicleTypes.map((vehicle) => (
                            <button
                              key={vehicle.id}
                              onClick={() => handleInputChange('vehicleType', vehicle.id)}
                              className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                                formData.vehicleType === vehicle.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="font-medium text-foreground text-sm sm:text-base">{vehicle.label}</div>
                              <div className="text-xs text-muted-foreground">{vehicle.description}</div>
                            </button>
                          ))}
                        </div>

                        <Label className="text-sm font-medium mb-2 sm:mb-3 block">Transmission Type</Label>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                          {transmissionTypes.map((trans) => (
                            <button
                              key={trans.id}
                              onClick={() => handleInputChange('transmissionType', trans.id)}
                              className={`p-3 rounded-xl border-2 transition-all text-center ${
                                formData.transmissionType === trans.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="font-medium text-foreground text-sm">{trans.label}</div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Gardening-specific fields */}
                    {service.id === 'gardening' && (
                      <>
                        <Label className="text-sm font-medium mb-2 sm:mb-3 block">Garden Type</Label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                          {gardenTypes.map((garden) => (
                            <button
                              key={garden.id}
                              onClick={() => handleInputChange('gardenType', garden.id)}
                              className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                                formData.gardenType === garden.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="font-medium text-foreground text-sm sm:text-base">{garden.label}</div>
                              <div className="text-xs text-muted-foreground">{garden.description}</div>
                            </button>
                          ))}
                        </div>

                        <Label className="text-sm font-medium mb-2 sm:mb-3 block">Garden Size</Label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                          {gardenSizes.map((size) => (
                            <button
                              key={size.id}
                              onClick={() => handleInputChange('gardenSize', size.id)}
                              className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                                formData.gardenSize === size.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="font-medium text-foreground text-sm sm:text-base">{size.label}</div>
                              <div className="text-xs text-muted-foreground">{size.description}</div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Preferred Time - Common to all, except full-time driver */}
                    {shouldShowPreferredTime() && (
                      <>
                        <Label className="text-sm font-medium mb-2 sm:mb-3 block flex items-center gap-2">
                          <Clock className="w-4 h-4 text-secondary" />
                          Preferred Time Slot
                        </Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                          {getAvailableTimeSlots().map((slot) => (
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
                      </>
                    )}

                    {/* Start Date */}
                    <Label className="text-sm font-medium mb-2 sm:mb-3 block flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      When do you want to start?
                    </Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      min={getMinSelectableDate()}
                      className="max-w-full sm:max-w-xs"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Contact Details */}
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
                    <Label htmlFor="address" className="text-sm font-medium mb-2 block flex items-center justify-between">
                      <span>Complete Address</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleManualLocationFetch}
                        disabled={locationLoading}
                        className="text-xs gap-1 h-7 px-2"
                      >
                        {locationLoading ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Detecting...
                          </>
                        ) : (
                          <>
                            <LocateFixed className="w-3 h-3" />
                            Auto-detect
                          </>
                        )}
                      </Button>
                    </Label>
                    <Textarea
                      id="address"
                      placeholder={locationLoading ? "Detecting your location..." : "Enter your full address including landmark"}
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      disabled={locationLoading}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review */}
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
                      {getServiceSummary()}
                      {shouldShowPreferredTime() && formData.preferredTime && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time Slot</span>
                          <span className="font-medium text-foreground">
                            {timeSlots.find(s => s.id === formData.preferredTime)?.label}
                          </span>
                        </div>
                      )}
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
                      All workers are 100% verified with background checks. 3-day free trial included!
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Payment */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Complete Payment to See Matches
                  </h3>

                  <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <CreditCard className="w-8 h-8 text-primary" />
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-bold text-foreground">Matching Fee</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        One-time fee to access verified worker matches
                      </p>
                    </div>

                    <div className="text-4xl font-bold text-primary">
                      ₹{MATCHING_FEE}
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 justify-center">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span>View top 5 matched workers</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span>Contact workers directly</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span>3-day free trial with selected worker</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isProcessingPayment || paymentCompleted}
                    className="w-full gap-2 h-12"
                    size="lg"
                  >
                    {isProcessingPayment ? (
                      'Processing...'
                    ) : paymentCompleted ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Payment Complete
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay ₹{MATCHING_FEE} & View Matches
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Secure payment. This is a one-time fee and won't be charged again for this booking.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-border flex items-center justify-between gap-3 sm:gap-4">
            {step > 1 && step < 4 ? (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !canProceedStep1() : !canProceedStep2}
                className="gap-2"
                size="sm"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : step === 3 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 text-sm"
                size="sm"
              >
                {isSubmitting ? 'Submitting...' : 'Continue to Payment'}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </Button>
            ) : null}
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
