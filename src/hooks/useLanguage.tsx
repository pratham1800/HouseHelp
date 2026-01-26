import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'kn' | 'mr';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    kn: string;
    mr: string;
  };
}

// Common translations
export const translations: Translations = {
  // Navbar
  services: { en: 'Services', hi: 'सेवाएं', kn: 'ಸೇವೆಗಳು', mr: 'सेवा' },
  howItWorks: { en: 'How It Works', hi: 'यह कैसे काम करता है', kn: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ', mr: 'हे कसे कार्य करते' },
  subscription: { en: 'Subscription', hi: 'सदस्यता', kn: 'ಚಂದಾದಾರಿಕೆ', mr: 'सदस्यता' },
  forWorkers: { en: 'For Workers', hi: 'श्रमिकों के लिए', kn: 'ಕಾರ್ಮಿಕರಿಗಾಗಿ', mr: 'कामगारांसाठी' },
  forEmployers: { en: 'For Employers', hi: 'नियोक्ताओं के लिए', kn: 'ನಿಯೋಜಕರಿಗಾಗಿ', mr: 'नियोक्त्यांसाठी' },
  aboutUs: { en: 'About Us', hi: 'हमारे बारे में', kn: 'ನಮ್ಮ ಬಗ್ಗೆ', mr: 'आमच्याबद्दल' },
  login: { en: 'Login', hi: 'लॉगिन', kn: 'ಲಾಗಿನ್', mr: 'लॉगिन' },
  signUp: { en: 'Sign Up', hi: 'साइन अप', kn: 'ಸೈನ್ ಅಪ್', mr: 'साइन अप' },
  signOut: { en: 'Sign Out', hi: 'लॉग आउट', kn: 'ಲಾಗ್ ಔಟ್', mr: 'लॉग आउट' },
  
  // User Menu
  myProfile: { en: 'My Profile', hi: 'मेरी प्रोफ़ाइल', kn: 'ನನ್ನ ಪ್ರೊಫೈಲ್', mr: 'माझे प्रोफाइल' },
  myBookings: { en: 'My Bookings', hi: 'मेरी बुकिंग', kn: 'ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು', mr: 'माझी बुकिंग' },
  myEarnings: { en: 'My Earnings', hi: 'मेरी कमाई', kn: 'ನನ್ನ ಗಳಿಕೆ', mr: 'माझी कमाई' },
  myDashboard: { en: 'My Dashboard', hi: 'मेरा डैशबोर्ड', kn: 'ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', mr: 'माझे डॅशबोर्ड' },
  
  // Worker Portal
  benefits: { en: 'Benefits', hi: 'लाभ', kn: 'ಪ್ರಯೋಜನಗಳು', mr: 'फायदे' },
  workerLogin: { en: 'Worker Login', hi: 'श्रमिक लॉगिन', kn: 'ಕಾರ್ಮಿಕ ಲಾಗಿನ್', mr: 'कामगार लॉगिन' },
  
  // Dashboard
  welcome: { en: 'Welcome', hi: 'स्वागत है', kn: 'ಸ್ವಾಗತ', mr: 'स्वागत' },
  currentStatus: { en: 'Current Status', hi: 'वर्तमान स्थिति', kn: 'ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ', mr: 'सध्याची स्थिती' },
  verificationPending: { en: 'Verification Pending', hi: 'सत्यापन लंबित', kn: 'ಪರಿಶೀಲನೆ ಬಾಕಿ', mr: 'पडताळणी प्रलंबित' },
  verified: { en: 'Verified', hi: 'सत्यापित', kn: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ', mr: 'सत्यापित' },
  needHelp: { en: 'Need Help?', hi: 'सहायता चाहिए?', kn: 'ಸಹಾಯ ಬೇಕೇ?', mr: 'मदत हवी?' },
  contactSupport: { en: 'Contact Support', hi: 'सहायता से संपर्क करें', kn: 'ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ', mr: 'समर्थनाशी संपर्क साधा' },
  yourProfile: { en: 'Your Profile', hi: 'आपकी प्रोफ़ाइल', kn: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್', mr: 'तुमचे प्रोफाइल' },
  workType: { en: 'Work Type', hi: 'काम का प्रकार', kn: 'ಕೆಲಸದ ಪ್ರಕಾರ', mr: 'कामाचा प्रकार' },
  experience: { en: 'Experience', hi: 'अनुभव', kn: 'ಅನುಭವ', mr: 'अनुभव' },
  workingHours: { en: 'Working Hours', hi: 'काम के घंटे', kn: 'ಕೆಲಸದ ಸಮಯ', mr: 'कामाचे तास' },
  phone: { en: 'Phone', hi: 'फ़ोन', kn: 'ಫೋನ್', mr: 'फोन' },
  languagesSpoken: { en: 'Languages Spoken', hi: 'बोली जाने वाली भाषाएं', kn: 'ಮಾತನಾಡುವ ಭಾಷೆಗಳು', mr: 'बोलल्या जाणाऱ्या भाषा' },
  preferredAreas: { en: 'Preferred Areas', hi: 'पसंदीदा क्षेत्र', kn: 'ಆದ್ಯತೆಯ ಪ್ರದೇಶಗಳು', mr: 'पसंतीचे क्षेत्र' },
  
  // Metrics
  currentEmployers: { en: 'Current Employers', hi: 'वर्तमान नियोक्ता', kn: 'ಪ್ರಸ್ತುತ ಉದ್ಯೋಗದಾತರು', mr: 'सध्याचे नियोक्ते' },
  totalLeaves: { en: 'Total Leaves', hi: 'कुल छुट्टियां', kn: 'ಒಟ್ಟು ರಜೆಗಳು', mr: 'एकूण रजा' },
  lateDays: { en: 'Late Days', hi: 'देरी के दिन', kn: 'ತಡವಾದ ದಿನಗಳು', mr: 'उशिरा दिवस' },
  bestWorkerAwards: { en: 'Best Worker Awards', hi: 'सर्वश्रेष्ठ कर्मचारी पुरस्कार', kn: 'ಅತ್ಯುತ್ತಮ ಕಾರ್ಮಿಕ ಪ್ರಶಸ್ತಿಗಳು', mr: 'सर्वोत्तम कामगार पुरस्कार' },
  totalAwards: { en: 'Total Awards', hi: 'कुल पुरस्कार', kn: 'ಒಟ್ಟು ಪ್ರಶಸ್ತಿಗಳು', mr: 'एकूण पुरस्कार' },
  awardsThisYear: { en: 'Awards This Year', hi: 'इस वर्ष के पुरस्कार', kn: 'ಈ ವರ್ಷದ ಪ್ರಶಸ್ತಿಗಳು', mr: 'या वर्षीचे पुरस्कार' },
  
  // Earnings
  totalRewards: { en: 'Total Rewards', hi: 'कुल पुरस्कार', kn: 'ಒಟ್ಟು ಬಹುಮಾನಗಳು', mr: 'एकूण बक्षिसे' },
  rewardsThisYear: { en: 'Rewards This Year', hi: 'इस वर्ष के पुरस्कार', kn: 'ಈ ವರ್ಷದ ಬಹುಮಾನಗಳು', mr: 'या वर्षीची बक्षिसे' },
  rewardsThisMonth: { en: 'Rewards This Month', hi: 'इस महीने के पुरस्कार', kn: 'ಈ ತಿಂಗಳ ಬಹುಮಾನಗಳು', mr: 'या महिन्याची बक्षिसे' },
  quarterlyBonuses: { en: 'Quarterly Bonuses', hi: 'त्रैमासिक बोनस', kn: 'ತ್ರೈಮಾಸಿಕ ಬೋನಸ್', mr: 'त्रैमासिक बोनस' },
  totalSalaries: { en: 'Total Salaries', hi: 'कुल वेतन', kn: 'ಒಟ್ಟು ವೇತನಗಳು', mr: 'एकूण पगार' },
  totalEarningsYear: { en: 'Total Earnings (Year)', hi: 'कुल कमाई (वर्ष)', kn: 'ಒಟ್ಟು ಗಳಿಕೆ (ವರ್ಷ)', mr: 'एकूण कमाई (वर्ष)' },
  totalEarnings: { en: 'Total Earnings', hi: 'कुल कमाई', kn: 'ಒಟ್ಟು ಗಳಿಕೆ', mr: 'एकूण कमाई' },
  
  // Verification
  completeVerification: { en: 'Complete Your Verification', hi: 'अपना सत्यापन पूरा करें', kn: 'ನಿಮ್ಮ ಪರಿಶೀಲನೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ', mr: 'तुमची पडताळणी पूर्ण करा' },
  uploadDocuments: { en: 'Upload your documents to get verified', hi: 'सत्यापित होने के लिए अपने दस्तावेज़ अपलोड करें', kn: 'ಪರಿಶೀಲಿಸಲು ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ', mr: 'पडताळणीसाठी तुमचे दस्तऐवज अपलोड करा' },
  profilePicture: { en: 'Profile Picture', hi: 'प्रोफ़ाइल चित्र', kn: 'ಪ್ರೊಫೈಲ್ ಚಿತ್ರ', mr: 'प्रोफाइल चित्र' },
  aadhaarCard: { en: 'Aadhaar Card', hi: 'आधार कार्ड', kn: 'ಆಧಾರ್ ಕಾರ್ಡ್', mr: 'आधार कार्ड' },
  submitVerification: { en: 'Submit for Verification', hi: 'सत्यापन के लिए जमा करें', kn: 'ಪರಿಶೀಲನೆಗಾಗಿ ಸಲ್ಲಿಸಿ', mr: 'पडताळणीसाठी सबमिट करा' },
  
  // Common
  none: { en: 'None', hi: 'कोई नहीं', kn: 'ಯಾವುದೂ ಇಲ್ಲ', mr: 'काहीही नाही' },
  years: { en: 'years', hi: 'वर्ष', kn: 'ವರ್ಷಗಳು', mr: 'वर्षे' },
  notSpecified: { en: 'Not specified', hi: 'निर्दिष्ट नहीं', kn: 'ನಿರ್ದಿಷ್ಟಪಡಿಸಿಲ್ಲ', mr: 'निर्दिष्ट नाही' },
  back: { en: 'Back', hi: 'वापस', kn: 'ಹಿಂದೆ', mr: 'परत' },
  save: { en: 'Save', hi: 'सहेजें', kn: 'ಉಳಿಸು', mr: 'जतन करा' },
  cancel: { en: 'Cancel', hi: 'रद्द करें', kn: 'ರದ್ದುಮಾಡು', mr: 'रद्द करा' },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('gharseva_language');
    return (saved as LanguageCode) || 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('gharseva_language', lang);
  };

  useEffect(() => {
    const saved = localStorage.getItem('gharseva_language');
    if (saved && ['en', 'hi', 'kn', 'mr'].includes(saved)) {
      setLanguageState(saved as LanguageCode);
    }
  }, []);

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key]['en'];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
