import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const FILTERS = [
  { name: 'Noir', bg: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)', accent: '#c8c8c8' },
  { name: 'Cinema', bg: 'linear-gradient(135deg, #1a1208, #2d1e0a)', accent: '#d4a27a' },
  { name: 'Vivid', bg: 'linear-gradient(135deg, #0a1520, #12203a)', accent: '#6ab4f0' },
  { name: 'Haze', bg: 'linear-gradient(135deg, #1a0d18, #2a1228)', accent: '#d080c0' },
];

const FEATURES = [
  { label: 'Photo Booth', sub: '4-frame strips' },
  { label: 'Drop-Ins', sub: 'Celebrity overlays' },
  { label: 'Live Filters', sub: 'Baked into recording' },
];

export function Scene4() {
  const [phase, setPhase] = useState(0);
  const [filterIdx, setFilterIdx] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 150),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1600),
      setTimeout(() => setPhase(4), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setFilterIdx(i => (i + 1) % FILTERS.length), 900);
    return () => clearInterval(iv);
  }, []);

  const f = FILTERS[filterIdx];

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0% 0 0)' }}
      exit={{ clipPath: 'inset(0 0 0 100%)', opacity: 0 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Label */}
      <motion.p
        style={{
          position: 'absolute',
          top: '8vh', left: '7vw',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.95vw',
          letterSpacing: '0.35em',
          color: '#e8906a',
          fontWeight: 400,
          textTransform: 'uppercase',
        }}
        initial={{ opacity: 0 }}
        animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        Express Yourself
      </motion.p>

      {/* Left: feature list */}
      <div style={{
        position: 'absolute',
        left: '7vw', top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: '3.5vh',
      }}>
        {FEATURES.map((feat, i) => (
          <motion.div
            key={feat.label}
            initial={{ opacity: 0, x: -30 }}
            animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.15 }}
          >
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '4.2vw', fontWeight: 300, color: '#f5f0ea', lineHeight: 1, letterSpacing: '-0.01em' }}>
              {feat.label}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9vw', color: 'rgba(245,240,234,0.38)', marginTop: '0.3vh', letterSpacing: '0.08em' }}>
              {feat.sub}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Right: animated filter preview */}
      <motion.div
        style={{
          position: 'absolute',
          right: '8vw', top: '50%',
          transform: 'translateY(-50%)',
          width: '28vw', height: '36vw',
          borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
          overflow: 'hidden',
          border: '1px solid rgba(245,240,234,0.1)',
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={phase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          key={filterIdx}
          style={{ width: '100%', height: '100%', background: f.bg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Filter name overlay */}
        <motion.div
          key={`label-${filterIdx}`}
          style={{
            position: 'absolute',
            bottom: '8%', left: 0, right: 0,
            textAlign: 'center',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.8vw', fontWeight: 400, color: f.accent, fontStyle: 'italic' }}>
            {f.name}
          </span>
        </motion.div>
      </motion.div>

      {/* Photo strip slides in */}
      <motion.div
        style={{
          position: 'absolute',
          right: '3vw', bottom: '6vh',
          display: 'flex', flexDirection: 'column', gap: '0.4vw',
        }}
        initial={{ opacity: 0, x: 60 }}
        animate={phase >= 4 ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: '5vw',
            height: '4vw',
            borderRadius: '0.3vw',
            background: `rgba(${30 + i * 15},${20 + i * 10},${10 + i * 8},0.9)`,
            border: '1px solid rgba(245,240,234,0.12)',
          }} />
        ))}
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65vw', color: 'rgba(245,240,234,0.3)', letterSpacing: '0.15em', textAlign: 'center', marginTop: '0.3vw', textTransform: 'uppercase' }}>
          Booth
        </p>
      </motion.div>
    </motion.div>
  );
}
