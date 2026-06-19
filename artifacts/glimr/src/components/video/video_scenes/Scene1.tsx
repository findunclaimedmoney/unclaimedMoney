import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const TITLE = 'GLIMR';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1600),
      setTimeout(() => setPhase(4), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-start justify-center"
      style={{ paddingLeft: '10vw' }}
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0, filter: 'blur(18px)', scale: 1.04 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Eyebrow */}
      <motion.div
        style={{ overflow: 'hidden', marginBottom: '1.5vh' }}
        initial={{ opacity: 0 }}
        animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '1.2vw',
            letterSpacing: '0.35em',
            color: '#e8906a',
            fontWeight: 400,
            textTransform: 'uppercase',
          }}
          initial={{ y: 30 }}
          animate={phase >= 1 ? { y: 0 } : { y: 30 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          A Memory Studio
        </motion.p>
      </motion.div>

      {/* Main title — per-character stagger */}
      <div style={{ display: 'flex', lineHeight: 0.9 }}>
        {TITLE.split('').map((char, i) => (
          <motion.span
            key={i}
            style={{
              display: 'inline-block',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '20vw',
              fontWeight: 300,
              color: '#f5f0ea',
              letterSpacing: '-0.02em',
            }}
            initial={{ opacity: 0, y: '0.3em', rotateX: -55, transformOrigin: 'bottom center' }}
            animate={
              phase >= 2
                ? { opacity: 1, y: 0, rotateX: 0 }
                : { opacity: 0, y: '0.3em', rotateX: -55 }
            }
            transition={{
              duration: 0.75,
              ease: [0.16, 1, 0.3, 1],
              delay: phase >= 2 ? i * 0.07 : 0,
            }}
          >
            {char}
          </motion.span>
        ))}
      </div>

      {/* Divider line draws */}
      <motion.div
        style={{ height: '1px', background: 'rgba(245,240,234,0.2)', marginTop: '2vh' }}
        initial={{ width: 0 }}
        animate={phase >= 3 ? { width: '36vw' } : { width: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Tagline */}
      <motion.p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '2.4vw',
          fontWeight: 400,
          fontStyle: 'italic',
          color: 'rgba(245,240,234,0.7)',
          marginTop: '2.5vh',
          letterSpacing: '0.01em',
        }}
        initial={{ opacity: 0, filter: 'blur(12px)' }}
        animate={phase >= 4 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(12px)' }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      >
        Messages worth keeping.
      </motion.p>

      {/* REC dot */}
      <motion.div
        style={{ display: 'flex', alignItems: 'center', gap: '0.6vw', marginTop: '3.5vh' }}
        initial={{ opacity: 0 }}
        animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          style={{ width: '0.7vw', height: '0.7vw', borderRadius: '50%', background: '#e8906a' }}
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9vw', color: 'rgba(245,240,234,0.4)', letterSpacing: '0.2em' }}>
          READY
        </span>
      </motion.div>
    </motion.div>
  );
}
