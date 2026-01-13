import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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
              className="group relative bg-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-soft hover:shadow-elevated transition-all duration-300 overflow-hidden cursor-pointer"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Mobile: Horizontal layout, Desktop: Vertical layout */}
              <div className="flex items-start gap-4 sm:block">
                {/* Icon - Larger on mobile for visibility */}
                <div className={`w-16 h-16 sm:w-20 sm:h-20 ${service.bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 sm:mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <img src={service.icon} alt={service.title} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2 sm:mb-4 leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <Button 
                size="sm" 
                className="w-full gap-2 mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/services/${service.id}`);
                }}
              >
                Book Now
                <ArrowRight className="w-4 h-4" />
              </Button>
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
