import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface SplashIntroProps {
  onComplete: () => void;
}

// Sparkle generator for a beautiful celestial/luxury atmosphere
const SPARKLERS = [
  { id: 1, top: '15%', left: '10%', size: 8, delay: 0.2, duration: 4 },
  { id: 2, top: '25%', left: '85%', size: 12, delay: 0.8, duration: 5 },
  { id: 3, top: '70%', left: '15%', size: 10, delay: 1.2, duration: 6 },
  { id: 4, top: '80%', left: '75%', size: 14, delay: 0.5, duration: 4.5 },
  { id: 5, top: '40%', left: '80%', size: 6, delay: 2.0, duration: 3.5 },
  { id: 6, top: '65%', left: '88%', size: 9, delay: 1.5, duration: 5.5 },
  { id: 7, top: '20%', left: '50%', size: 11, delay: 0.1, duration: 4.8 },
  { id: 8, top: '85%', left: '45%', size: 7, delay: 1.9, duration: 5.2 },
];

export default function SplashIntro({ onComplete }: SplashIntroProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Elegant 5 seconds duration
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5400); // Allow extra time for exit animation

    // Disable body scroll when splash is showing
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
      document.body.style.overflow = 'unset';
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="splash-screen"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-tr from-[#0F0D0B] via-[#1A1613] to-[#120E0C] text-neutral-100 select-none overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] } }}
        >
          {/* Subtle luxurious grid pattern or overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#C4A484_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04]" />

          {/* Ambient Feminine Rose-Gold & Champagne Glows */}
          <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full bg-[#E5BA99]/20 blur-[130px] mix-blend-screen animate-pulse" style={{ animationDuration: '5s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[55vw] h-[55vw] rounded-full bg-[#DBBBA0]/15 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full bg-gradient-to-b from-transparent via-[#E1C5AF]/8 to-transparent blur-[180px]" />

          {/* Twinkling Magical Feminine Sparklers */}
          {SPARKLERS.map((spark) => (
            <motion.div
              key={spark.id}
              className="absolute rounded-full bg-gradient-to-br from-white to-[#E4BFA0]"
              style={{
                top: spark.top,
                left: spark.left,
                width: spark.size,
                height: spark.size,
                boxShadow: '0 0 12px 3px rgba(228, 191, 160, 0.5)',
              }}
              animate={{
                y: [0, -35, 0],
                opacity: [0.1, 0.9, 0.1],
                scale: [0.7, 1.3, 0.7],
              }}
              transition={{
                duration: spark.duration,
                repeat: Infinity,
                delay: spark.delay,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Twinkles rotating and shimmering in space */}
          <motion.div 
            className="absolute top-[15%] right-[15%] text-[#E4BFA0]/50"
            animate={{ rotate: 360, scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles size={28} className="animate-pulse" />
          </motion.div>
          <motion.div 
            className="absolute bottom-[20%] left-[15%] text-[#E4BFA0]/40"
            animate={{ rotate: -360, scale: [0.7, 1.3, 0.7] }}
            transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles size={22} className="animate-pulse" />
          </motion.div>
          <motion.div 
            className="absolute top-[75%] right-[22%] text-[#E4BFA0]/30"
            animate={{ scale: [0.6, 1.1, 0.6], y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles size={16} />
          </motion.div>

          <div className="relative flex flex-col items-center justify-center max-w-2xl px-6 text-center z-10">
            
            {/* Grand Glorious Logo Emblem */}
            <motion.div
              className="relative flex items-center justify-center"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Outer soft golden ring */}
              <motion.div 
                className="absolute w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] rounded-full border border-[#E4BFA0]/15"
                animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Inner fast tracking sparkling orbital line */}
              <motion.div 
                className="absolute w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] rounded-full border border-dashed border-[#E4BFA0]/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
              />

              {/* Magnificent backdrop glow halo */}
              <motion.div 
                className="absolute w-[230px] h-[230px] sm:w-[320px] sm:h-[320px] rounded-full bg-gradient-to-tr from-[#E4BFA0]/20 to-transparent blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Main Applet Logo - Replaced and styled to be very big & majestic */}
              <motion.div
                className="relative z-10 p-4 sm:p-6"
                animate={{ 
                  y: [0, -8, 0]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <img
                  id="splash-logo-image"
                  src="https://i.postimg.cc/1tn6bRc4/Chat-GPT-Image-15-de-jun-de-2026-19-50-27.png"
                  alt="USEPEAH Logo"
                  referrerPolicy="no-referrer"
                  className="w-56 h-56 sm:w-80 sm:h-80 md:w-[380px] md:h-[380px] object-contain drop-shadow-[0_0_35px_rgba(228,191,160,0.55)] filter brightness-105"
                />
              </motion.div>
            </motion.div>

          </div>

          {/* Micro-loading progress gold line at the bottom with rose glow */}
          <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#120E0C] overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#DBBBA0]/60 via-[#FFFDF9] to-[#E4BFA0]/60 shadow-[0_0_10px_rgba(255,253,249,0.8)]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 4.8, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

