import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import iconCleaning from '@/assets/icon-cleaning.png';
import iconCooking from '@/assets/icon-cooking.png';
import iconDriver from '@/assets/icon-driver.png';
import iconGardening from '@/assets/icon-gardening.png';

const services = [
  {
    id: 'cleaning',
    title: 'Domestic Help',
    description: 'Mopping, brooming, dusting, dish washing & bathroom cleaning',
    icon: iconCleaning,
    color: 'from-orange-400 to-orange-500',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'cooking',
    title: 'Cooking',
    description: 'Delicious home-cooked meals prepared fresh daily',
    icon: iconCooking,
    color: 'from-amber-400 to-orange-400',
    bgColor: 'bg-amber-50',
  },
  {
    id: 'driver',
    title: 'Car Drivers',
    description: 'Safe and reliable drivers for your daily commute',
    icon: iconDriver,
    color: 'from-teal-400 to-teal-500',
    bgColor: 'bg-teal-50',
  },
  {
    id: 'gardening',
    title: 'Gardeners',
    description: 'Keep your garden green, beautiful and well-maintained',
    icon: iconGardening,
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50',
  },
];

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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative bg-card rounded-3xl p-6 shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Animated Icon Container */}
              <div className="relative mb-5">
                {/* Glow effect behind icon */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${service.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-40`}
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Floating ring animation */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl border-2 border-dashed opacity-20`}
                  style={{ borderColor: `hsl(var(--primary))` }}
                  animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  }}
                />
                
                {/* Icon container with bounce animation */}
                <motion.div
                  className={`relative w-20 h-20 ${service.bgColor} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 overflow-hidden`}
                  whileHover={{ 
                    scale: 1.15,
                    rotate: [0, -5, 5, 0],
                  }}
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    y: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 },
                    rotate: { duration: 0.5 },
                  }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                    animate={{
                      x: ['-200%', '200%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 2,
                    }}
                  />
                  
                  {/* Icon with subtle pulse */}
                  <motion.img 
                    src={service.icon} 
                    alt={service.title} 
                    className="w-12 h-12 object-contain relative z-10 drop-shadow-md"
                    whileHover={{
                      scale: 1.1,
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                    }}
                  />
                </motion.div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {service.description}
              </p>

              {/* CTA */}
              <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                Book Now
                <ArrowRight className="w-4 h-4" />
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
          <Button variant="outline" size="lg">
            View All Services
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
