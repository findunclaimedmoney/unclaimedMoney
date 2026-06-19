import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const SEND = 'Send a Glimr.';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96, filter: 'blur(16px)' }}
      transition={{ duration: 1 }}
    >
      {/* Expanding warm pulse behind text */}
      <motion.div
        style={{
          position: 'absolute',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,144,106,0.18) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={phase >= 1 ? { scale: 1.6, opacity: 1 } : { scale: 0.3, opacity: 0 }}
        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Logo mark */}
      <motion.div
        style={{
          width: '5vw', height: '5vw',
          borderRadius: '1.2vw',
          background: 'linear-gradient(135deg, #e8906a, #c45e8a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '3.5vh',
        }}
        initial={{ scale: 0, rotate: 180 }}
        animate={phase >= 1 ? { scale: 1, rotate: 0 } : { scale: 0, rotate: 180 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{ width: '2.4vw', height: '2.4vw', borderRadius: '50%', border: '2px solid rgba(245,240,234,0.85)' }} />
      </motion.div>

      {/* Main headline — per character */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0 }}>
        {SEND.split('').map((char, i) => (
          <motion.span
            key={i}
            style={{
              display: 'inline-block',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: char === ' ' ? '4vw' : '8vw',
              fontWeight: 300,
              color: '#f5f0ea',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}
            initial={{ opacity: 0, y: '0.25em', rotateX: -45, transformOrigin: 'bottom' }}
            animate={
              phase >= 2
                ? { opacity: 1, y: 0, rotateX: 0 }
                : { opacity: 0, y: '0.25em', rotateX: -45 }
            }
            transition={{
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
              delay: phase >= 2 ? i * 0.045 : 0,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </div>

      {/* Divider */}
      <motion.div
        style={{ height: '1px', background: 'rgba(232,144,106,0.35)', marginTop: '3vh', marginBottom: '2.5vh' }}
        initial={{ width: 0 }}
        animate={phase >= 3 ? { width: '22vw' } : { width: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Tagline */}
      <motion.p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '1.1vw',
          letterSpacing: '0.3em',
          color: 'rgba(245,240,234,0.4)',
          textTransform: 'uppercase',
          fontWeight: 300,
        }}
        initial={{ opacity: 0 }}
        animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        glimr.studio
      </motion.p>
    </motion.div>
  );
}
