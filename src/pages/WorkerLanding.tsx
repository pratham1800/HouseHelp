import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  BadgeCheck, 
  Gift, 
  Shield, 
  ArrowRight,
  Users,
  Banknote,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkerNavbar } from '@/components/WorkerNavbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

const benefits = [
  {
    icon: MapPin,
    title: 'Choose Your Work Area',
    titleHi: 'अपना कार्य क्षेत्र चुनें',
    titleKn: 'ನಿಮ್ಮ ಕೆಲಸದ ಪ್ರದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    titleMr: 'तुमचे कामाचे क्षेत्र निवडा',
    description: 'Work in neighborhoods you know and prefer',
    descHi: 'अपनी पसंद के क्षेत्रों में काम करें',
    descKn: 'ನೀವು ತಿಳಿದಿರುವ ಪ್ರದೇಶಗಳಲ್ಲಿ ಕೆಲಸ ಮಾಡಿ',
    descMr: 'तुम्हाला माहीत असलेल्या भागात काम करा',
  },
  {
    icon: Clock,
    title: 'Flexible Hours',
    titleHi: 'लचीले घंटे',
    titleKn: 'ಹೊಂದಿಕೊಳ್ಳುವ ಸಮಯ',
    titleMr: 'लवचिक तास',
    description: 'Morning, evening, or full-day - you decide',
    descHi: 'सुबह, शाम, या पूरे दिन - आप तय करें',
    descKn: 'ಬೆಳಿಗ್ಗೆ, ಸಂಜೆ, ಅಥವಾ ಪೂರ್ಣ ದಿನ - ನೀವು ನಿರ್ಧರಿಸಿ',
    descMr: 'सकाळी, संध्याकाळी किंवा पूर्ण दिवस - तुम्ही ठरवा',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Jobs Regularly',
    titleHi: 'नियमित रूप से सत्यापित नौकरियाँ',
    titleKn: 'ನಿಯಮಿತವಾಗಿ ಪರಿಶೀಲಿಸಿದ ಕೆಲಸಗಳು',
    titleMr: 'नियमितपणे सत्यापित नोकऱ्या',
    description: 'Get matched with trusted families who need help',
    descHi: 'विश्वसनीय परिवारों से जुड़ें जिन्हें मदद चाहिए',
    descKn: 'ಸಹಾಯ ಬೇಕಾದ ವಿಶ್ವಾಸಾರ್ಹ ಕುಟುಂಬಗಳೊಂದಿಗೆ ಹೊಂದಿಕೊಳ್ಳಿ',
    descMr: 'मदत हवी असलेल्या विश्वासू कुटुंबांशी जोडले जा',
  },
  {
    icon: Banknote,
    title: 'Earn Bonuses',
    titleHi: 'बोनस कमाएं',
    titleKn: 'ಬೋನಸ್ ಗಳಿಸಿ',
    titleMr: 'बोनस कमवा',
    description: 'Extra rewards for consistent, quality work',
    descHi: 'निरंतर, गुणवत्तापूर्ण काम के लिए अतिरिक्त पुरस्कार',
    descKn: 'ಸ್ಥಿರ, ಗುಣಮಟ್ಟದ ಕೆಲಸಕ್ಕಾಗಿ ಹೆಚ್ಚುವರಿ ಬಹುಮಾನಗಳು',
    descMr: 'सातत्यपूर्ण, दर्जेदार कामासाठी अतिरिक्त बक्षिसे',
  },
  {
    icon: Shield,
    title: 'Insurance Benefits',
    titleHi: 'बीमा लाभ',
    titleKn: 'ವಿಮೆ ಪ್ರಯೋಜನಗಳು',
    titleMr: 'विमा लाभ',
    description: 'Health and accident coverage for verified workers',
    descHi: 'सत्यापित कर्मचारियों के लिए स्वास्थ्य और दुर्घटना कवरेज',
    descKn: 'ಪರಿಶೀಲಿತ ಕಾರ್ಮಿಕರಿಗೆ ಆರೋಗ್ಯ ಮತ್ತು ಅಪಘಾತ ಕವರೇಜ್',
    descMr: 'सत्यापित कामगारांसाठी आरोग्य आणि अपघात कव्हरेज',
  },
  {
    icon: Gift,
    title: 'Festival Gifts',
    titleHi: 'त्योहार उपहार',
    titleKn: 'ಹಬ್ಬದ ಉಡುಗೊರೆಗಳು',
    titleMr: 'सणाच्या भेटवस्तू',
    description: 'Special rewards during Diwali, Holi, and more',
    descHi: 'दिवाली, होली और अन्य त्योहारों पर विशेष पुरस्कार',
    descKn: 'ದೀಪಾವಳಿ, ಹೋಳಿ ಮತ್ತು ಇನ್ನೂ ಹೆಚ್ಚಿನ ಸಮಯದಲ್ಲಿ ವಿಶೇಷ ಬಹುಮಾನಗಳು',
    descMr: 'दिवाळी, होळी आणि इतर सणांवर विशेष बक्षिसे',
  },
];

const stats = [
  { value: '5000+', labelEn: 'Happy Workers', labelHi: 'खुश कर्मचारी', labelKn: 'ಸಂತೋಷದ ಕಾರ್ಮಿಕರು', labelMr: 'आनंदी कामगार' },
  { value: '₹25K+', labelEn: 'Avg. Monthly Earnings', labelHi: 'औसत मासिक कमाई', labelKn: 'ಸರಾಸರಿ ಮಾಸಿಕ ಗಳಿಕೆ', labelMr: 'सरासरी मासिक कमाई' },
  { value: '50+', labelEn: 'Cities Covered', labelHi: 'शहर कवर किए गए', labelKn: 'ನಗರಗಳನ್ನು ಒಳಗೊಂಡಿದೆ', labelMr: 'शहरे समाविष्ट' },
  { value: '98%', labelEn: 'Worker Satisfaction', labelHi: 'कर्मचारी संतुष्टि', labelKn: 'ಕಾರ್ಮಿಕ ತೃಪ್ತಿ', labelMr: 'कामगार समाधान' },
];

const howItWorksSteps = [
  { step: 1, titleEn: 'Register', titleHi: 'पंजीकरण करें', titleKn: 'ನೋಂದಾಯಿಸಿ', titleMr: 'नोंदणी करा', descEn: 'Our team helps you register with your details', descHi: 'हमारी टीम आपके विवरण के साथ पंजीकरण में मदद करती है', descKn: 'ನಮ್ಮ ತಂಡ ನಿಮ್ಮ ವಿವರಗಳೊಂದಿಗೆ ನೋಂದಾಯಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ', descMr: 'आमची टीम तुमच्या तपशीलांसह नोंदणी करण्यात मदत करते' },
  { step: 2, titleEn: 'Get Verified', titleHi: 'सत्यापित हों', titleKn: 'ಪರಿಶೀಲಿಸಿ', titleMr: 'सत्यापित व्हा', descEn: 'Complete ID verification and background check', descHi: 'आईडी सत्यापन और पृष्ठभूमि जांच पूरी करें', descKn: 'ಐಡಿ ಪರಿಶೀಲನೆ ಮತ್ತು ಹಿನ್ನೆಲೆ ತಪಾಸಣೆ ಪೂರ್ಣಗೊಳಿಸಿ', descMr: 'आयडी सत्यापन आणि पार्श्वभूमी तपासणी पूर्ण करा' },
  { step: 3, titleEn: 'Get Matched', titleHi: 'मैच हों', titleKn: 'ಹೊಂದಿಕೊಳ್ಳಿ', titleMr: 'जोडले जा', descEn: 'We match you with families in your preferred area', descHi: 'हम आपको आपके पसंदीदा क्षेत्र में परिवारों से मिलाते हैं', descKn: 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಪ್ರದೇಶದಲ್ಲಿ ಕುಟುಂಬಗಳೊಂದಿಗೆ ಹೊಂದಿಕೊಳ್ಳುತ್ತೇವೆ', descMr: 'तुमच्या पसंतीच्या भागातील कुटुंबांशी जोडतो' },
  { step: 4, titleEn: 'Start Earning', titleHi: 'कमाई शुरू करें', titleKn: 'ಗಳಿಸಲು ಪ್ರಾರಂಭಿಸಿ', titleMr: 'कमाई सुरू करा', descEn: 'Begin work after a 7-day trial period', descHi: '7 दिन की ट्रायल अवधि के बाद काम शुरू करें', descKn: '7 ದಿನಗಳ ಟ್ರಯಲ್ ಅವಧಿಯ ನಂತರ ಕೆಲಸ ಪ್ರಾರಂಭಿಸಿ', descMr: '7 दिवसांच्या चाचणी कालावधीनंतर काम सुरू करा' },
];

export default function WorkerLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getStatLabel = (stat: typeof stats[0]) => {
    switch (language) {
      case 'hi': return stat.labelHi;
      case 'kn': return stat.labelKn;
      case 'mr': return stat.labelMr;
      default: return stat.labelEn;
    }
  };

  const getBenefitTitle = (benefit: typeof benefits[0]) => {
    switch (language) {
      case 'hi': return benefit.titleHi;
      case 'kn': return benefit.titleKn;
      case 'mr': return benefit.titleMr;
      default: return benefit.title;
    }
  };

  const getBenefitDesc = (benefit: typeof benefits[0]) => {
    switch (language) {
      case 'hi': return benefit.descHi;
      case 'kn': return benefit.descKn;
      case 'mr': return benefit.descMr;
      default: return benefit.description;
    }
  };

  const getStepTitle = (step: typeof howItWorksSteps[0]) => {
    switch (language) {
      case 'hi': return step.titleHi;
      case 'kn': return step.titleKn;
      case 'mr': return step.titleMr;
      default: return step.titleEn;
    }
  };

  const getStepDesc = (step: typeof howItWorksSteps[0]) => {
    switch (language) {
      case 'hi': return step.descHi;
      case 'kn': return step.descKn;
      case 'mr': return step.descMr;
      default: return step.descEn;
    }
  };

  const texts = {
    tagline: {
      en: '🏠 For Home Service Professionals',
      hi: '🏠 घरेलू सेवा पेशेवरों के लिए',
      kn: '🏠 ಮನೆ ಸೇವಾ ವೃತ್ತಿಪರರಿಗಾಗಿ',
      mr: '🏠 घरगुती सेवा व्यावसायिकांसाठी'
    },
    headline: {
      en: 'Join Our Trusted Network of',
      hi: 'हमारे विश्वसनीय नेटवर्क से जुड़ें',
      kn: 'ನಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ನೆಟ್‌ವರ್ಕ್‌ಗೆ ಸೇರಿ',
      mr: 'आमच्या विश्वासार्ह नेटवर्कमध्ये सामील व्हा'
    },
    headlineHighlight: {
      en: 'Home Service Professionals',
      hi: 'घरेलू सेवा पेशेवर',
      kn: 'ಮನೆ ಸೇವಾ ವೃತ್ತಿಪರರು',
      mr: 'घरगुती सेवा व्यावसायिक'
    },
    subheadline: {
      en: 'Join our trusted network and help families with your skills. Get regular work, good earnings, and excellent benefits.',
      hi: 'हमारे विश्वसनीय नेटवर्क से जुड़ें और अपने कौशल से परिवारों की मदद करें। नियमित काम, अच्छी कमाई, और बेहतरीन लाभ पाएं।',
      kn: 'ನಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ನೆಟ್‌ವರ್ಕ್‌ಗೆ ಸೇರಿ ಮತ್ತು ನಿಮ್ಮ ಕೌಶಲ್ಯಗಳೊಂದಿಗೆ ಕುಟುಂಬಗಳಿಗೆ ಸಹಾಯ ಮಾಡಿ. ನಿಯಮಿತ ಕೆಲಸ, ಉತ್ತಮ ಗಳಿಕೆ ಮತ್ತು ಅತ್ಯುತ್ತಮ ಪ್ರಯೋಜನಗಳನ್ನು ಪಡೆಯಿರಿ.',
      mr: 'आमच्या विश्वासार्ह नेटवर्कमध्ये सामील व्हा आणि तुमच्या कौशल्यांसह कुटुंबांना मदत करा. नियमित काम, चांगली कमाई आणि उत्कृष्ट लाभ मिळवा.'
    },
    viewBenefits: {
      en: 'View Benefits',
      hi: 'लाभ देखें',
      kn: 'ಪ್ರಯೋಜನಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
      mr: 'फायदे पहा'
    },
    loginSignup: {
      en: 'Worker Login / Sign Up',
      hi: 'श्रमिक लॉगिन / साइन अप',
      kn: 'ಕಾರ್ಮಿಕ ಲಾಗಿನ್ / ಸೈನ್ ಅಪ್',
      mr: 'कामगार लॉगिन / साइन अप'
    },
    goToDashboard: {
      en: 'Go to Dashboard',
      hi: 'डैशबोर्ड पर जाएं',
      kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ',
      mr: 'डॅशबोर्डवर जा'
    },
    whyJoin: {
      en: 'Why Join GharSeva?',
      hi: 'GharSeva से क्यों जुड़ें?',
      kn: 'GharSeva ಗೆ ಏಕೆ ಸೇರಬೇಕು?',
      mr: 'GharSeva मध्ये का सामील व्हावे?'
    },
    whyJoinDesc: {
      en: 'We take care of our workers with the best benefits in the industry',
      hi: 'हम अपने कर्मचारियों की देखभाल उद्योग में सर्वोत्तम लाभों के साथ करते हैं',
      kn: 'ಉದ್ಯಮದಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಪ್ರಯೋಜನಗಳೊಂದಿಗೆ ನಮ್ಮ ಕಾರ್ಮಿಕರನ್ನು ನಾವು ನೋಡಿಕೊಳ್ಳುತ್ತೇವೆ',
      mr: 'आम्ही आमच्या कामगारांची उद्योगातील सर्वोत्तम लाभांसह काळजी घेतो'
    },
    howItWorks: {
      en: 'How It Works',
      hi: 'यह कैसे काम करता है',
      kn: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
      mr: 'हे कसे कार्य करते'
    },
    howItWorksDesc: {
      en: 'Simple steps to start earning with GharSeva',
      hi: 'GharSeva के साथ कमाई शुरू करने के सरल चरण',
      kn: 'GharSeva ನೊಂದಿಗೆ ಗಳಿಸಲು ಪ್ರಾರಂಭಿಸಲು ಸರಳ ಹಂತಗಳು',
      mr: 'GharSeva सह कमाई सुरू करण्यासाठी सोपी पायरी'
    },
    readyToJoin: {
      en: 'Ready to Join?',
      hi: 'जुड़ने के लिए तैयार?',
      kn: 'ಸೇರಲು ಸಿದ್ಧರಿದ್ದೀರಾ?',
      mr: 'सामील होण्यास तयार?'
    },
    ctaDesc: {
      en: 'Contact our team to get registered. We\'ll help you through the entire process.',
      hi: 'पंजीकरण के लिए हमारी टीम से संपर्क करें। हम पूरी प्रक्रिया में आपकी मदद करेंगे।',
      kn: 'ನೋಂದಾಯಿಸಲು ನಮ್ಮ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ. ನಾವು ಸಂಪೂರ್ಣ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇವೆ.',
      mr: 'नोंदणीसाठी आमच्या टीमशी संपर्क साधा. आम्ही तुम्हाला संपूर्ण प्रक्रियेत मदत करू.'
    },
    contactWhatsApp: {
      en: 'Contact Us on WhatsApp',
      hi: 'WhatsApp पर संपर्क करें',
      kn: 'WhatsApp ನಲ್ಲಿ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ',
      mr: 'WhatsApp वर संपर्क साधा'
    }
  };

  const getText = (key: keyof typeof texts) => {
    return texts[key][language] || texts[key]['en'];
  };

  return (
    <div className="min-h-screen bg-background">
      <WorkerNavbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="section-padding bg-gradient-to-br from-secondary/10 via-background to-primary/5">
          <div className="container-main">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-6">
                  {getText('tagline')}
                </span>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                  {getText('headline')}{' '}
                  <span className="text-gradient">{getText('headlineHighlight')}</span>
                </h1>
                
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {getText('subheadline')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="hero" 
                    size="xl" 
                    className="group"
                    onClick={() => navigate('/for-workers/benefits')}
                  >
                    {getText('viewBenefits')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  {user ? (
                    <Button 
                      variant="outline" 
                      size="xl"
                      onClick={() => navigate('/for-workers/dashboard')}
                      className="group"
                    >
                      <LayoutDashboard className="w-5 h-5 mr-2" />
                      {getText('goToDashboard')}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="xl"
                      onClick={() => navigate('/for-workers/auth')}
                    >
                      {getText('loginSignup')}
                    </Button>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-secondary/20 to-primary/20 rounded-3xl p-8 lg:p-12">
                  <div className="grid grid-cols-2 gap-6">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.labelEn}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="bg-card rounded-2xl p-6 text-center shadow-card"
                      >
                        <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                          {stat.value}
                        </div>
                        <div className="text-sm text-muted-foreground">{getStatLabel(stat)}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="section-padding">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {getText('whyJoin')}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {getText('whyJoinDesc')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card-elevated p-6 hover:shadow-elevated transition-shadow"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {getBenefitTitle(benefit)}
                  </h3>
                  <p className="text-muted-foreground">
                    {getBenefitDesc(benefit)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="section-padding bg-muted/50">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {getText('howItWorks')}
              </h2>
              <p className="text-muted-foreground text-lg">
                {getText('howItWorksDesc')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {howItWorksSteps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{getStepTitle(item)}</h3>
                  <p className="text-muted-foreground text-sm">{getStepDesc(item)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-gradient-to-br from-primary to-primary/80">
          <div className="container-main text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Users className="w-16 h-16 text-primary-foreground/80 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                {getText('readyToJoin')}
              </h2>
              <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
                {getText('ctaDesc')}
              </p>
              <Button 
                variant="secondary" 
                size="xl"
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => window.open('https://wa.me/919876543210?text=Hi, I want to register as a worker', '_blank')}
              >
                {getText('contactWhatsApp')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}