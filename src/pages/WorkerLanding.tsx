import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  BadgeCheck, 
  Gift, 
  Shield, 
  ArrowRight,
  Users,
  Star,
  Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkerNavbar } from '@/components/WorkerNavbar';
import { Footer } from '@/components/Footer';

const benefits = [
  {
    icon: MapPin,
    title: 'Choose Your Work Area',
    titleHi: 'अपना कार्य क्षेत्र चुनें',
    titleKn: 'ನಿಮ್ಮ ಕೆಲಸದ ಪ್ರದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    description: 'Work in neighborhoods you know and prefer',
  },
  {
    icon: Clock,
    title: 'Flexible Hours',
    titleHi: 'लचीले घंटे',
    titleKn: 'ಹೊಂದಿಕೊಳ್ಳುವ ಸಮಯ',
    description: 'Morning, evening, or full-day - you decide',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Jobs Regularly',
    titleHi: 'नियमित रूप से सत्यापित नौकरियाँ',
    titleKn: 'ನಿಯಮಿತವಾಗಿ ಪರಿಶೀಲಿಸಿದ ಕೆಲಸಗಳು',
    description: 'Get matched with trusted families who need help',
  },
  {
    icon: Banknote,
    title: 'Earn Bonuses',
    titleHi: 'बोनस कमाएं',
    titleKn: 'ಬೋನಸ್ ಗಳಿಸಿ',
    description: 'Extra rewards for consistent, quality work',
  },
  {
    icon: Shield,
    title: 'Insurance Benefits',
    titleHi: 'बीमा लाभ',
    titleKn: 'ವಿಮೆ ಪ್ರಯೋಜನಗಳು',
    description: 'Health and accident coverage for verified workers',
  },
  {
    icon: Gift,
    title: 'Festival Gifts',
    titleHi: 'त्योहार उपहार',
    titleKn: 'ಹಬ್ಬದ ಉಡುಗೊರೆಗಳು',
    description: 'Special rewards during Diwali, Holi, and more',
  },
];

const stats = [
  { value: '5000+', label: 'Happy Workers' },
  { value: '₹25K+', label: 'Avg. Monthly Earnings' },
  { value: '50+', label: 'Cities Covered' },
  { value: '98%', label: 'Worker Satisfaction' },
];

export default function WorkerLanding() {
  const navigate = useNavigate();

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
                  🏠 For Home Service Professionals
                </span>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                  Join Our Trusted Network of{' '}
                  <span className="text-gradient">Home Service Professionals</span>
                </h1>
                
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  हमारे विश्वसनीय नेटवर्क से जुड़ें और अपने कौशल से परिवारों की मदद करें। 
                  नियमित काम, अच्छी कमाई, और बेहतरीन लाभ पाएं।
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="hero" 
                    size="xl" 
                    className="group"
                    onClick={() => navigate('/for-workers/benefits')}
                  >
                    View Benefits
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="xl"
                    onClick={() => navigate('/for-workers/dashboard')}
                  >
                    Worker Login
                  </Button>
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
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="bg-card rounded-2xl p-6 text-center shadow-card"
                      >
                        <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                          {stat.value}
                        </div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
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
                Why Join GharSeva?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                We take care of our workers with the best benefits in the industry
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
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-secondary font-medium mb-2">
                    {benefit.titleHi}
                  </p>
                  <p className="text-muted-foreground">
                    {benefit.description}
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
                How It Works
              </h2>
              <p className="text-muted-foreground text-lg">
                Simple steps to start earning with GharSeva
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: 1, title: 'Register', desc: 'Our team helps you register with your details' },
                { step: 2, title: 'Get Verified', desc: 'Complete ID verification and background check' },
                { step: 3, title: 'Get Matched', desc: 'We match you with families in your preferred area' },
                { step: 4, title: 'Start Earning', desc: 'Begin work after a 7-day trial period' },
              ].map((item, index) => (
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
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
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
                Ready to Join?
              </h2>
              <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
                Contact our team to get registered. We'll help you through the entire process.
              </p>
              <Button 
                variant="secondary" 
                size="xl"
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => window.open('https://wa.me/919876543210?text=Hi, I want to register as a worker', '_blank')}
              >
                Contact Us on WhatsApp
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