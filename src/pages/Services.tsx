import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ShoppingCart, Sparkles, Star, Clock, IndianRupee } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {servicesData.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/services/${service.id}`)}
                className="group relative bg-card rounded-2xl sm:rounded-3xl shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Popular Badge */}
                {service.popularTag && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      {service.popularTag}
                    </span>
                  </div>
                )}

                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Main Content */}
                <div className="p-5 sm:p-6">
                  {/* Icon - Centered and prominent */}
                  <div className="flex justify-center mb-4">
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 ${service.bgColor} rounded-2xl sm:rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <img src={service.icon} alt={service.title} className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 text-center group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2 text-center">
                    {service.description}
                  </p>

                  {/* Pricing & Options Info */}
                  <div className="flex items-center justify-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 text-foreground">
                      <IndianRupee className="w-4 h-4 text-primary" />
                      <span className="font-semibold">From {service.startingPrice}</span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                  </div>

                  {/* Sub-services count */}
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.subServices.length} service options available</span>
                  </div>
                </div>

                {/* CTA Footer */}
                <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                  <div className={`flex items-center justify-center gap-2 py-3 px-4 ${service.bgColor} rounded-xl font-medium text-sm group-hover:gap-3 transition-all`}>
                    <span className="text-foreground">View Services</span>
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ServiceDetailPage = ({ service }: { service: Service }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSubServices, setSelectedSubServices] = useState<SubService[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Scroll to sub-services section when component mounts
  useEffect(() => {
    // Small delay to ensure DOM is rendered
    setTimeout(() => {
      const subServicesSection = document.getElementById('sub-services');
      if (subServicesSection) {
        subServicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Fallback to top if section not found
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  }, []);

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
      <main className="pb-24">
        {/* Hero Section */}
        <section className={`pt-20 pb-8 sm:pb-12 bg-gradient-to-br ${service.heroGradient}`}>
          <div className="container-main px-4 sm:px-8 lg:px-16 pt-6 sm:pt-8">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Services
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
            >
              <div className={`w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 ${service.bgColor} rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-soft flex-shrink-0`}>
                <img src={service.icon} alt={service.title} className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-1 sm:mb-2">
                  {service.title}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl">
                  {service.description}. Choose from {service.subServices.length} specialized options below.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Sub-services Grid */}
        <section id="sub-services" className="px-4 sm:px-8 lg:px-16 py-6 sm:py-12 lg:py-16">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8"
            >
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Available Options</h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Select one or more services to book
                </p>
              </div>
              {selectedSubServices.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full self-start sm:self-auto"
                >
                  <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-primary">
                    {selectedSubServices.length} selected
                  </span>
                </motion.div>
              )}
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {service.subServices.map((subService, index) => (
                <motion.div
                  key={subService.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
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
              className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border p-3 sm:p-4 shadow-elevated z-40"
            >
              <div className="container-main flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="flex -space-x-2">
                    {selectedSubServices.slice(0, 3).map((sub, i) => (
                      <div
                        key={sub.id}
                        className={`w-8 h-8 sm:w-10 sm:h-10 ${service.bgColor} rounded-full border-2 border-card flex items-center justify-center`}
                        style={{ zIndex: 3 - i }}
                      >
                        <span className="text-xs font-medium">{sub.name.charAt(0)}</span>
                      </div>
                    ))}
                    {selectedSubServices.length > 3 && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-full border-2 border-card flex items-center justify-center">
                        <span className="text-xs font-medium">+{selectedSubServices.length - 3}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm sm:text-base truncate">
                      {selectedSubServices.length} service{selectedSubServices.length !== 1 ? 's' : ''} selected
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                      Ready to find your perfect match
                    </p>
                  </div>
                </div>
                <Button size="default" className="gap-2 w-full sm:w-auto text-sm sm:text-base" onClick={handleProceedToBook}>
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

  // Handle hash navigation to sub-services section
  useEffect(() => {
    if (serviceId && service) {
      // Check if URL has hash for sub-services
      if (window.location.hash === '#sub-services') {
        setTimeout(() => {
          const subServicesSection = document.getElementById('sub-services');
          if (subServicesSection) {
            subServicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }
    }
  }, [serviceId, service]);

  if (serviceId && service) {
    return <ServiceDetailPage service={service} />;
  }

  return <ServiceSelector />;
};

export default Services;
