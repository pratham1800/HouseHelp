import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Bangalore',
    role: 'Working Professional',
    content: 'Finding a reliable cook was always a nightmare until GharSeva. Now I come home to fresh, home-cooked meals every day. The 7-day trial gave me complete confidence.',
    rating: 5,
    avatar: 'P',
  },
  {
    id: 2,
    name: 'Rajesh Kumar',
    location: 'Mumbai',
    role: 'Business Owner',
    content: 'We have elderly parents at home. The verified driver from GharSeva has been a blessing. Police verification and ID checks gave us peace of mind.',
    rating: 5,
    avatar: 'R',
  },
  {
    id: 3,
    name: 'Anita Desai',
    location: 'Delhi',
    role: 'Homemaker',
    content: 'After 3 failed attempts with local agencies, GharSeva matched us with the perfect house help. Their backup guarantee during leaves is a lifesaver!',
    rating: 5,
    avatar: 'A',
  },
  {
    id: 4,
    name: 'Suresh Patel',
    location: 'Pune',
    role: 'IT Manager',
    content: 'The whole process was as simple as ordering on Swiggy. I was matched with 5 options, picked one, and my home has been spotless ever since.',
    rating: 5,
    avatar: 'S',
  },
];

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-main">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent-foreground rounded-full text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Loved by <span className="text-gradient">10,000+</span> Families
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real stories from real families who found their perfect home help.
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-3xl p-8 md:p-12 shadow-card relative overflow-hidden"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote className="w-20 h-20 text-primary" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                ))}
              </div>

              {/* Content */}
              <p className="text-xl md:text-2xl text-foreground font-medium leading-relaxed mb-8">
                "{testimonials[currentIndex].content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {testimonials[currentIndex].avatar}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonials[currentIndex].name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[currentIndex].role} • {testimonials[currentIndex].location}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full bg-card shadow-soft hover:shadow-card flex items-center justify-center transition-all hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            
            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-primary w-8'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-12 h-12 rounded-full bg-card shadow-soft hover:shadow-card flex items-center justify-center transition-all hover:scale-105"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
