import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);
  const [countdown, setCountdown] = useState(7);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1900),
      setTimeout(() => setPhase(4), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase < 4) return;
    const iv = setInterval(() => setCountdown(n => (n <= 0 ? 23 : n - 1)), 400);
    return () => clearInterval(iv);
  }, [phase]);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ scale: 1.06, opacity: 0, filter: 'blur(14px)' }}
      transition={{ duration: 0.8 }}
    >
      {/* Section label */}
      <motion.p
        style={{
          position: 'absolute',
          top: '8vh',
          left: '7vw',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.95vw',
          letterSpacing: '0.35em',
          color: '#e8906a',
          fontWeight: 400,
          textTransform: 'uppercase',
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
      >
        Magical Moments
      </motion.p>

      <div style={{ display: 'flex', gap: '5vw', alignItems: 'center' }}>
        {/* Memory Card */}
        <motion.div
          style={{
            width: '28vw',
            aspectRatio: '3/4',
            position: 'relative',
          }}
          initial={{ opacity: 0, rotateY: -25, x: -40 }}
          animate={phase >= 2 ? { opacity: 1, rotateY: 0, x: 0 } : { opacity: 0, rotateY: -25, x: -40 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Card body */}
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '1.5vw',
            background: 'linear-gradient(145deg, rgba(232,144,106,0.12) 0%, rgba(13,10,8,0.95) 60%, rgba(180,120,90,0.08) 100%)',
            border: '1px solid rgba(232,144,106,0.25)',
            padding: '2.5vw',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Animated SVG border trace */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 280 380" fill="none">
              <motion.rect
                x="1" y="1" width="278" height="378" rx="22"
                stroke="rgba(232,144,106,0.5)"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="1314"
                initial={{ strokeDashoffset: 1314 }}
                animate={phase >= 2 ? { strokeDashoffset: 0 } : { strokeDashoffset: 1314 }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
              />
            </svg>

            <div>
              <motion.p
                style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75vw', letterSpacing: '0.25em', color: '#e8906a', textTransform: 'uppercase', marginBottom: '1.2vh' }}
                initial={{ opacity: 0 }} animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.5 }}
              >
                Magic Recap
              </motion.p>
              <motion.h3
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3.2vw', fontWeight: 400, color: '#f5f0ea', lineHeight: 1.1 }}
                initial={{ opacity: 0, y: 15 }} animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }} transition={{ duration: 0.7, delay: 0.1 }}
              >
                For Emma,<br />with love.
              </motion.h3>
            </div>

            <motion.div
              initial={{ opacity: 0 }} animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.8 }}
            >
              <div style={{ height: '1px', background: 'rgba(232,144,106,0.3)', marginBottom: '1.5vh' }} />
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.1vw', color: 'rgba(245,240,234,0.55)', lineHeight: 1.55 }}>
                "Watching you become who you are has been my greatest joy."
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75vw', color: 'rgba(245,240,234,0.3)', marginTop: '1.5vh', letterSpacing: '0.1em' }}>
                June 19, 2026 — Golden Style
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Time-Lock */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2vh' }}
          initial={{ opacity: 0, x: 40 }}
          animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85vw', letterSpacing: '0.3em', color: '#e8906a', textTransform: 'uppercase' }}>
            Birthday Time-Lock
          </p>

          {/* Countdown */}
          <div style={{ textAlign: 'center' }}>
            <motion.span
              key={countdown}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '11vw',
                fontWeight: 300,
                color: '#f5f0ea',
                lineHeight: 1,
                display: 'block',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              {String(countdown).padStart(2, '0')}
            </motion.span>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9vw', color: 'rgba(245,240,234,0.35)', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '1vh' }}>
              Hours Until Midnight
            </p>
          </div>

          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: '0.6vw' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', background: '#e8906a' }} />
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8vw', color: 'rgba(245,240,234,0.4)', letterSpacing: '0.15em' }}>
              Sealed until their birthday
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
