import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 3800), // exit start
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center bg-[#0d0a08]"
      initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
      animate={{ clipPath: 'polygon(0% 0, 100% 0, 100% 100%, 0% 100%)' }}
      exit={{ scale: 1.2, filter: 'blur(15px)', opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
    >
      <div 
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}bokeh-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="relative z-10 w-full flex px-[10vw]">
        {/* Asymmetric layout: Left Text */}
        <div className="w-1/2 flex flex-col justify-center pr-12">
          <motion.h2 
            className="text-[5vw] leading-[1.1] font-serif text-[#f5f0ea] mb-6"
            initial={{ opacity: 0, y: 30, rotateX: 20 }}
            animate={phase >= 1 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 30, rotateX: 20 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            Your words,<br/>
            <span className="italic text-[#d4a27a]">perfectly spoken.</span>
          </motion.h2>
          
          <motion.p
            className="text-[1.5vw] text-[#8a7a6e] font-sans leading-relaxed max-w-md"
            initial={{ opacity: 0, x: -20 }}
            animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            High-quality studio recording meets an invisible teleprompter. 
            Speak from the heart, never lose your place.
          </motion.p>
        </div>

        {/* Right Visual: Teleprompter abstraction */}
        <div className="w-1/2 relative h-[60vh] flex items-center justify-center">
          <motion.div 
            className="absolute inset-0 border border-[#e8906a]/20 rounded-2xl overflow-hidden bg-[#0d0a08]/60 backdrop-blur-md p-10 shadow-2xl shadow-[#e8906a]/10"
            initial={{ opacity: 0, scale: 0.9, rotateY: 20, z: -100 }}
            animate={phase >= 2 ? { opacity: 1, scale: 1, rotateY: 0, z: 0 } : { opacity: 0, scale: 0.9, rotateY: 20, z: -100 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: 1200 }}
          >
             <div className="relative h-full w-full overflow-hidden flex flex-col justify-center items-center">
                {/* Focus indicator / viewfinder bounds */}
                <motion.div 
                  className="absolute inset-4 border border-white/5 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 0.5, duration: 1 }}
                />
                <motion.div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-[#e8906a]/60" />
                <motion.div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-[#e8906a]/60" />
                <motion.div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-[#e8906a]/60" />
                <motion.div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-[#e8906a]/60" />

                {/* Scrolling text lines */}
                <div className="flex flex-col items-center w-full max-w-[80%] gap-6">
                  {[1, 2, 3, 4, 5].map((line) => (
                    <motion.div
                      key={line}
                      className={`h-[3px] rounded-full w-full ${line === 3 ? 'bg-gradient-to-r from-transparent via-[#f5f0ea] to-transparent' : 'bg-gradient-to-r from-transparent via-[#8a7a6e]/40 to-transparent'}`}
                      initial={{ opacity: 0, y: 40 }}
                      animate={phase >= 3 ? { opacity: line === 3 ? 1 : 0.4, y: 0 } : { opacity: 0, y: 40 }}
                      transition={{ 
                        duration: 1.5, 
                        delay: line * 0.1,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                    />
                  ))}
                </div>
                
                {/* Teleprompter Focus line */}
                {phase >= 3 && (
                  <motion.div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-16 border-l-2 border-r-2 border-[#e8906a]/40 bg-gradient-to-r from-[#e8906a]/5 via-transparent to-[#e8906a]/5"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  />
                )}
             </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
