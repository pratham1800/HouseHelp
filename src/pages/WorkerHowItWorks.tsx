import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  UserPlus, 
  FileCheck, 
  Phone, 
  Briefcase, 
  IndianRupee,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkerNavbar } from '@/components/WorkerNavbar';
import { Footer } from '@/components/Footer';

const steps = [
  {
    icon: UserPlus,
    title: 'Register Your Profile',
    titleHi: 'प्रोफ़ाइल पंजीकृत करें',
    description: 'Create your account with basic details - name, phone number, and work preferences.',
    color: 'bg-primary/10 text-primary'
  },
  {
    icon: FileCheck,
    title: 'Complete Verification',
    titleHi: 'सत्यापन पूरा करें',
    description: 'Upload your ID proof (Aadhaar/PAN/Voter ID) and complete the verification process.',
    color: 'bg-secondary/10 text-secondary'
  },
  {
    icon: Phone,
    title: 'Schedule Interview Call',
    titleHi: 'इंटरव्यू कॉल शेड्यूल करें',
    description: 'Our team will contact you to understand your skills and experience better.',
    color: 'bg-amber-100 text-amber-700'
  },
  {
    icon: Briefcase,
    title: 'Get Matched with Owners',
    titleHi: 'मालिकों से मिलान करें',
    description: 'We match you with suitable house owners based on your skills and preferred areas.',
    color: 'bg-blue-100 text-blue-700'
  },
  {
    icon: IndianRupee,
    title: 'Start Earning',
    titleHi: 'कमाई शुरू करें',
    description: 'Complete a 7-day trial, get hired, and start receiving regular salary payments.',
    color: 'bg-green-100 text-green-700'
  }
];

const benefits = [
  'Verified and trusted house owners',
  'Regular salary payments',
  'Insurance coverage',
  'Performance bonuses',
  'Worker of the Month awards',
  'Skill development opportunities'
];

export default function WorkerHowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <WorkerNavbar />
      
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

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4">
              For Workers
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How GharSeva Works for You
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of workers earning better with GharSeva. Follow these simple steps to get started.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="max-w-3xl mx-auto mb-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 mb-8 relative"
                >
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-7 top-16 w-0.5 h-16 bg-border" />
                  )}
                  
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 card-elevated p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-muted-foreground">STEP {index + 1}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.titleHi}
                    </p>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="card-elevated p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Why Work with GharSeva?</h2>
                  <p className="text-muted-foreground">Benefits you get as a GharSeva worker</p>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/for-workers/auth')}
              className="px-8"
            >
              Get Started Today
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
