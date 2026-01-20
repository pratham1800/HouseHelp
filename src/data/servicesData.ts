import iconCleaning from '@/assets/icon-cleaning.png';
import iconCooking from '@/assets/icon-cooking.png';
import iconDriver from '@/assets/icon-driver.png';
import iconGardening from '@/assets/icon-gardening.png';

export interface SubService {
  id: string;
  name: string;
  description: string;
  priceRange: string;
  duration: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  heroGradient: string;
  startingPrice: string;
  popularTag?: string;
  subServices: SubService[];
}

export const servicesData: Service[] = [
  {
    id: 'cleaning',
    title: 'Domestic Help',
    description: 'Mopping, brooming, dusting, dish washing & bathroom cleaning',
    icon: iconCleaning,
    color: 'from-orange-400 to-orange-500',
    bgColor: 'bg-orange-50',
    heroGradient: 'from-orange-500/20 to-amber-500/10',
    startingPrice: '₹2,000',
    popularTag: 'Most Popular',
    subServices: [
      {
        id: 'brooming',
        name: 'Brooming & Mopping',
        description: 'Deep cleaning of all floor types including marble, tiles, and wooden floors',
        priceRange: '₹3,000 - ₹5,000/month',
        duration: '1-2 hours daily',
      },
      {
        id: 'dusting',
        name: 'Dusting & Home Organization',
        description: 'Daily and dusting of all rooms, furniture, and surfaces and home organization',
        priceRange: '₹2,500 - ₹4,000/month',
        duration: '45 mins - 1 hour daily',
      },
      {
        id: 'dishwashing',
        name: 'Dish Washing',
        description: 'Cleaning of utensils, cookware, and kitchen equipment',
        priceRange: '₹2,000 - ₹3,500/month',
        duration: '30-45 mins daily',
      },
      {
        id: 'bathroom',
        name: 'Bathroom Cleaning',
        description: 'Deep cleaning of bathrooms including scrubbing, sanitization',
        priceRange: '₹2,500 - ₹4,500/month',
        duration: '30-45 mins daily',
      },
      {
        id: 'laundry',
        name: 'Laundry & Ironing',
        description: 'Washing, drying, and ironing of clothes',
        priceRange: '₹3,500 - ₹6,000/month',
        duration: '1-2 hours daily',
      },
      {
        id: 'full-house',
        name: 'Full House Cleaning',
        description: 'Complete home cleaning including all above services',
        priceRange: '₹8,000 - ₹15,000/month',
        duration: '3-4 hours daily',
      },
    ],
  },
  {
    id: 'cooking',
    title: 'Cooking',
    description: 'Delicious home-cooked meals prepared fresh daily',
    icon: iconCooking,
    color: 'from-amber-400 to-orange-400',
    bgColor: 'bg-amber-50',
    heroGradient: 'from-amber-500/20 to-yellow-500/10',
    startingPrice: '₹4,000',
    subServices: [
      {
        id: 'breakfast',
        name: 'Breakfast Only',
        description: 'Fresh morning meals including parathas, idli, dosa, poha, upma',
        priceRange: '₹4,000 - ₹6,000/month',
        duration: '1 hour daily',
      },
      {
        id: 'lunch',
        name: 'Lunch Preparation',
        description: 'Complete lunch with roti, sabzi, dal, rice, and salad',
        priceRange: '₹5,000 - ₹8,000/month',
        duration: '1.5-2 hours daily',
      },
      {
        id: 'dinner',
        name: 'Dinner Preparation',
        description: 'Evening meals with variety of cuisines and dishes',
        priceRange: '₹5,000 - ₹8,000/month',
        duration: '1.5-2 hours daily',
      },
      {
        id: 'two-meals',
        name: 'Two Meals (Lunch + Dinner)',
        description: 'Both lunch and dinner preparation with kitchen cleaning',
        priceRange: '₹8,000 - ₹12,000/month',
        duration: '3-4 hours daily',
      },
      {
        id: 'all-meals',
        name: 'All Three Meals',
        description: 'Complete meal service for breakfast, lunch, and dinner',
        priceRange: '₹12,000 - ₹18,000/month',
        duration: '4-5 hours daily',
      },
      {
        id: 'special-cuisine',
        name: 'Special Cuisine Cook',
        description: 'Specialized cooking - South Indian, Jain, Continental, etc.',
        priceRange: '₹15,000 - ₹25,000/month',
        duration: 'Varies',
      },
    ],
  },
  {
    id: 'driver',
    title: 'Car Drivers',
    description: 'Safe and reliable drivers for your daily commute',
    icon: iconDriver,
    color: 'from-teal-400 to-teal-500',
    bgColor: 'bg-teal-50',
    heroGradient: 'from-teal-500/20 to-cyan-500/10',
    startingPrice: '₹4,000',
    subServices: [
      {
        id: 'daily-commute',
        name: 'Daily Office Commute',
        description: 'Regular pick-up and drop for office, fixed hours',
        priceRange: '₹12,000 - ₹18,000/month',
        duration: '4-6 hours daily',
      },
      {
        id: 'full-time',
        name: 'Full-Time Driver',
        description: 'Dedicated driver for all your driving needs',
        priceRange: '₹18,000 - ₹25,000/month',
        duration: '8-10 hours daily',
      },
      {
        id: 'school-pickup',
        name: 'School Pick-up & Drop',
        description: 'Safe transportation for children to/from school',
        priceRange: '₹8,000 - ₹12,000/month',
        duration: '2-3 hours daily',
      },
      {
        id: 'weekend',
        name: 'Weekend Driver',
        description: 'Driver available only on weekends for outings',
        priceRange: '₹4,000 - ₹6,000/month',
        duration: 'Weekend only',
      },
      {
        id: 'night-driver',
        name: 'Night Shift Driver',
        description: 'For late-night or early morning commutes',
        priceRange: '₹15,000 - ₹22,000/month',
        duration: 'Night hours',
      },
      {
        id: 'outstation',
        name: 'Outstation Trips',
        description: 'Long-distance travel and outstation journeys',
        priceRange: '₹800 - ₹1,500/day',
        duration: 'As needed',
      },
    ],
  },
  {
    id: 'gardening',
    title: 'Gardeners',
    description: 'Keep your garden green, beautiful and well-maintained',
    icon: iconGardening,
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50',
    heroGradient: 'from-green-500/20 to-emerald-500/10',
    startingPrice: '₹2,000',
    subServices: [
      {
        id: 'weekly-maintenance',
        name: 'Weekly Garden Maintenance',
        description: 'Once a week visit for watering, pruning, and cleaning',
        priceRange: '₹2,000 - ₹4,000/month',
        duration: '2-3 hours weekly',
      },
      {
        id: 'daily-care',
        name: 'Daily Plant Care',
        description: 'Daily watering, monitoring, and basic maintenance',
        priceRange: '₹4,000 - ₹7,000/month',
        duration: '1 hour daily',
      },
      {
        id: 'lawn-care',
        name: 'Lawn Mowing & Care',
        description: 'Regular lawn mowing, edging, and fertilization',
        priceRange: '₹3,000 - ₹6,000/month',
        duration: 'Weekly visits',
      },
      {
        id: 'landscaping',
        name: 'Landscaping Design',
        description: 'Garden design, plant selection, and setup',
        priceRange: '₹10,000 - ₹50,000',
        duration: 'One-time service',
      },
      {
        id: 'terrace-garden',
        name: 'Terrace Garden Care',
        description: 'Specialized care for rooftop and balcony gardens',
        priceRange: '₹3,000 - ₹5,000/month',
        duration: '1-2 hours weekly',
      },
      {
        id: 'pest-control',
        name: 'Plant Pest Control',
        description: 'Treatment and prevention of plant pests and diseases',
        priceRange: '₹500 - ₹2,000/visit',
        duration: 'As needed',
      },
    ],
  },
];

export const getServiceById = (id: string): Service | undefined => {
  return servicesData.find(service => service.id === id);
};
