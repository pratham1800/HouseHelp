// Subcategory options for different work types
export const domesticHelpSubcategories = [
  { value: 'brooming', label: 'Brooming & Mopping (झाड़ू और पोछा)' },
  { value: 'dusting', label: 'Dusting & Home Organization (धूल हटाना और घर व्यवस्थित करना)' },
  { value: 'laundry', label: 'Laundry & Ironing (धुलाई और प्रेस)' },
  { value: 'dishwashing', label: 'Dish Washing (बर्तन धोना)' },
  { value: 'bathroom', label: 'Bathroom Cleaning (बाथरूम की सफाई)' },
  { value: 'full-house', label: 'Full House Cleaning (पूर्ण घर की सफाई)' },
];

export const cookingDietaryPreferences = [
  { value: 'vegetarian', label: 'Vegetarian (शाकाहारी)' },
  { value: 'eggitarian', label: 'Eggitarian (अंडा सहित)' },
  { value: 'non_vegetarian', label: 'Non-Vegetarian (मांसाहारी)' },
];

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
