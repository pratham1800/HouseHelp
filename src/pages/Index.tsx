import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { ServicesSection } from '@/components/ServicesSection';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { TrustSection } from '@/components/TrustSection';
import { HowItWorks } from '@/components/HowItWorks';
import { Testimonials } from '@/components/Testimonials';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <WhyChooseUs />
        <TrustSection />
        <HowItWorks />
        <Testimonials />
        <SubscriptionPlans />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
