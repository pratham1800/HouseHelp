// Subcategory options for different work types
export const domesticHelpSubcategories = [
  { value: 'brooming_dusting', label: 'Brooming & Dusting (झाड़ू और धूल हटाना)' },
  { value: 'laundry_ironing', label: 'Laundry & Ironing (धुलाई और प्रेस)' },
  { value: 'mopping_floor', label: 'Mopping & Floor Cleaning (पोछा और फर्श की सफाई)' },
  { value: 'dish_washing', label: 'Dish Washing (बर्तन धोना)' },
  { value: 'bathroom_cleaning', label: 'Bathroom Cleaning (बाथरूम की सफाई)' },
  { value: 'full_house', label: 'Full House Cleaning (पूर्ण घर की सफाई)' },
];

export const cookingDietaryPreferences = [
  { value: 'vegetarian', label: 'Vegetarian (शाकाहारी)' },
  { value: 'eggitarian', label: 'Eggitarian (अंडा सहित)' },
  { value: 'non_vegetarian', label: 'Non-Vegetarian (मांसाहारी)' },
];

// Map booking sub-service IDs to worker subcategory values
export const bookingToWorkerSubcategoryMap: Record<string, string> = {
  'brooming': 'brooming_dusting',
  'laundry': 'laundry_ironing',
  'mopping': 'mopping_floor',
  'dishwashing': 'dish_washing',
  'bathroom': 'bathroom_cleaning',
  'full-house': 'full_house',
};

export const getSubcategoriesForWorkType = (workType: string) => {
  switch (workType) {
    case 'domestic_help':
      return domesticHelpSubcategories;
    case 'cooking':
      return cookingDietaryPreferences;
    default:
      return [];
  }
};

export const getSubcategoryLabel = (workType: string) => {
  switch (workType) {
    case 'domestic_help':
      return 'Select Services You Can Do';
    case 'cooking':
      return 'Dietary Preferences You Can Cook';
    default:
      return 'Select Subcategories';
  }
};
