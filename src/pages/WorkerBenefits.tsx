import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Gift, 
  Shield, 
  Banknote, 
  GraduationCap, 
  Heart, 
  Star,
  ArrowLeft,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const benefitCards = [
  {
    icon: Banknote,
    title: 'Performance Bonuses',
    titleHi: 'प्रदर्शन बोनस',
    titleKn: 'ಕಾರ್ಯಕ್ಷಮತೆ ಬೋನಸ್',
    description: 'Earn extra ₹500-₹2000 monthly for consistent, quality work. Top performers get additional rewards.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Gift,
    title: 'Festival Gifts',
    titleHi: 'त्योहार उपहार',
    titleKn: 'ಹಬ್ಬದ ಉಡುಗೊರೆಗಳು',
    description: 'Special gifts during Diwali, Holi, Eid, Christmas, and other festivals. Cash bonuses and gift hampers.',
    color: 'bg-accent/20 text-accent-foreground',
  },
  {
    icon: Shield,
    title: 'Insurance Coverage',
    titleHi: 'बीमा कवरेज',
    titleKn: 'ವಿಮೆ ಕವರೇಜ್',
    description: 'Free health insurance and accident coverage for all verified workers. Covers hospitalization up to ₹1 Lakh.',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: GraduationCap,
    title: 'Training Programs',
    titleHi: 'प्रशिक्षण कार्यक्रम',
    titleKn: 'ತರಬೇತಿ ಕಾರ್ಯಕ್ರಮಗಳು',
    description: 'Free skill development workshops - cooking classes, driving lessons, modern cleaning techniques.',
    color: 'bg-purple-100 text-purple-700',
    badge: 'Coming Soon',
  },
  {
    icon: Heart,
    title: 'Family Support',
    titleHi: 'पारिवारिक सहायता',
    titleKn: 'ಕುಟುಂಬ ಬೆಂಬಲ',
    description: 'Emergency loan assistance and children education support for long-term workers.',
    color: 'bg-rose-100 text-rose-700',
  },
  {
    icon: Star,
    title: 'Recognition Awards',
    titleHi: 'मान्यता पुरस्कार',
    titleKn: 'ಗುರುತಿಸುವಿಕೆ ಪ್ರಶಸ್ತಿಗಳು',
    description: 'Monthly "Worker of the Month" awards with certificates and cash prizes up to ₹5000.',
    color: 'bg-amber-100 text-amber-700',
  },
];

export default function WorkerBenefits() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Header */}
        <section className="section-padding bg-gradient-to-br from-accent/10 via-background to-primary/5">
          <div className="container-main">
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
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Worker Benefits & Perks
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                कर्मचारी लाभ और सुविधाएं
              </p>
              <p className="text-lg text-muted-foreground">
                At GharSeva, we believe in taking care of our workers. Here are the exclusive 
                benefits you get when you join our verified network.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="section-padding">
          <div className="container-main">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefitCards.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card-elevated p-8 relative overflow-hidden hover:shadow-elevated transition-shadow"
                >
                  {benefit.badge && (
                    <span className="absolute top-4 right-4 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full">
                      {benefit.badge}
                    </span>
                  )}
                  
                  <div className={`w-16 h-16 rounded-2xl ${benefit.color} flex items-center justify-center mb-6`}>
                    <benefit.icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-secondary font-medium mb-3">
                    {benefit.titleHi} | {benefit.titleKn}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Eligibility Section */}
        <section className="section-padding bg-muted/50">
          <div className="container-main">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Eligibility Criteria
                </h2>
                <ul className="space-y-4">
                  {[
                    'Complete ID verification and background check',
                    'Maintain minimum 4-star rating from customers',
                    'Work consistently for at least 3 months',
                    'No complaints or issues from assigned families',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-secondary text-sm font-bold">{index + 1}</span>
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-3xl p-8 shadow-card"
              >
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Questions? Contact Us
                </h3>
                <p className="text-muted-foreground mb-6">
                  Our team is available to answer any questions about worker benefits and registration.
                </p>
                <div className="space-y-3">
                  <Button 
                    variant="hero" 
                    className="w-full"
                    onClick={() => window.open('https://wa.me/919876543210', '_blank')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    WhatsApp: +91 98765 43210
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Available Mon-Sat, 9 AM - 6 PM
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}