import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const scenes = [
  {
    src: '/images/scene-rowing.jpg',
    alt: 'Athlete on rowing machine in dark industrial gym with yellow light beam',
  },
  {
    src: '/images/scene-yoga.jpg',
    alt: 'Yoga group silhouettes in warehouse studio with yellow neon halo',
  },
  {
    src: '/images/scene-boxing.jpg',
    alt: 'Boxing heavy bag with yellow LED spark impact effect',
  },
];

export function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % scenes.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={scenes[currentIndex].src}
          alt={scenes[currentIndex].alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
        {scenes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 transition-all duration-300 ${index === currentIndex
                ? 'w-8 bg-[#DFFF00]'
                : 'w-4 bg-white/40 hover:bg-white/60'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
