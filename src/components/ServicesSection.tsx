import { motion } from 'framer-motion';
import { ArrowRight, Star, IndianRupee, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { servicesData } from '@/data/servicesData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const ServicesSection = () => {
  const navigate = useNavigate();
  
  return (
    <section id="services" className="section-padding bg-background">
      <div className="container-main">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Our Services
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Help That Fits Your <span className="text-gradient">Home</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose from our range of verified domestic services. All workers are background-checked and trained.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {servicesData.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              onClick={() => navigate(`/services/${service.id}`)}
              className="group relative bg-card rounded-2xl sm:rounded-3xl shadow-soft hover:shadow-elevated transition-all duration-300 overflow-hidden cursor-pointer"
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

                {/* Pricing Info */}
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
                  <span>{service.subServices.length} service options</span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                <Button 
                  size="sm" 
                  className="w-full gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/services/${service.id}#sub-services`);
                  }}
                >
                  Book Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg" onClick={() => navigate('/services')}>
            View All Services
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
