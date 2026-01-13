import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ShoppingCart, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { SubServiceCard } from '@/components/services/SubServiceCard';
import { RequirementForm } from '@/components/services/RequirementForm';
import { servicesData, getServiceById, SubService, Service } from '@/data/servicesData';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/AuthModal';

const ServiceSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="section-padding pt-24">
        <div className="container-main">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Our Services
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Choose Your <span className="text-gradient">Service</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Select a service category to view all available options and book your verified domestic help.
            </p>
          </motion.div>

          {/* Service Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {servicesData.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/services/${service.id}`)}
                className="group relative bg-card rounded-3xl p-6 shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`w-20 h-20 ${service.bgColor} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <img src={service.icon} alt={service.title} className="w-12 h-12 object-contain" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {service.description}
                </p>

                {/* Sub-services count */}
                <div className="text-sm text-primary font-medium mb-4">
                  {service.subServices.length} options available
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                  View Services
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

const ServiceDetailPage = ({ service }: { service: Service }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSubServices, setSelectedSubServices] = useState<SubService[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSelectSubService = (subService: SubService) => {
    setSelectedSubServices(prev => {
      const exists = prev.find(s => s.id === subService.id);
      if (exists) {
        return prev.filter(s => s.id !== subService.id);
      }
      return [...prev, subService];
    });
  };

  const handleProceedToBook = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className={`pt-20 pb-12 bg-gradient-to-br ${service.heroGradient}`}>
          <div className="container-main section-padding pb-0">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Services
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center gap-6"
            >
              <div className={`w-24 h-24 ${service.bgColor} rounded-3xl flex items-center justify-center shadow-soft`}>
                <img src={service.icon} alt={service.title} className="w-14 h-14 object-contain" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                  {service.title}
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  {service.description}. Choose from {service.subServices.length} specialized options below.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Sub-services Grid */}
        <section className="section-padding">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">Available Options</h2>
                <p className="text-muted-foreground">
                  Select one or more services to book
                </p>
              </div>
              {selectedSubServices.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"
                >
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {selectedSubServices.length} selected
                  </span>
                </motion.div>
              )}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.subServices.map((subService, index) => (
                <motion.div
                  key={subService.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <SubServiceCard
                    subService={subService}
                    serviceColor={service.color}
                    serviceBgColor={service.bgColor}
                    onSelect={handleSelectSubService}
                    isSelected={selectedSubServices.some(s => s.id === subService.id)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Sticky Bottom Bar */}
        <AnimatePresence>
          {selectedSubServices.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border p-4 shadow-elevated z-40"
            >
              <div className="container-main flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {selectedSubServices.slice(0, 3).map((sub, i) => (
                      <div
                        key={sub.id}
                        className={`w-10 h-10 ${service.bgColor} rounded-full border-2 border-card flex items-center justify-center`}
                        style={{ zIndex: 3 - i }}
                      >
                        <span className="text-xs font-medium">{sub.name.charAt(0)}</span>
                      </div>
                    ))}
                    {selectedSubServices.length > 3 && (
                      <div className="w-10 h-10 bg-muted rounded-full border-2 border-card flex items-center justify-center">
                        <span className="text-xs font-medium">+{selectedSubServices.length - 3}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {selectedSubServices.length} service{selectedSubServices.length !== 1 ? 's' : ''} selected
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ready to find your perfect match
                    </p>
                  </div>
                </div>
                <Button size="lg" className="gap-2 w-full sm:w-auto" onClick={handleProceedToBook}>
                  <Sparkles className="w-4 h-4" />
                  Proceed to Book
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Requirement Form Modal */}
        <RequirementForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          service={service}
          selectedSubServices={selectedSubServices}
        />

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultMode="login"
        />
      </main>
      <Footer />
      <WhatsAppButton offsetBottom={selectedSubServices.length > 0} />
    </div>
  );
};

const Services = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = serviceId ? getServiceById(serviceId) : null;

  useEffect(() => {
    if (serviceId && !service) {
      navigate('/services');
    }
  }, [serviceId, service, navigate]);

  if (serviceId && service) {
    return <ServiceDetailPage service={service} />;
  }

  return <ServiceSelector />;
};

export default Services;
