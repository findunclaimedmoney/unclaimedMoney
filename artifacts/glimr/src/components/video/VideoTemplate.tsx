import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = {
  hero: 4500,
  studio: 5000,
  moments: 5500,
  express: 5000,
  send: 4500,
};

const accentX = ['50%', '8%', '80%', '15%', '50%'];
const accentY = ['48%', '80%', '20%', '55%', '48%'];
const accentScale = [1.8, 0.6, 1.1, 0.8, 2.2];
const lineLeft = ['10%', '0%', '55%', '5%', '20%'];
const lineWidth = ['0%', '45%', '35%', '60%', '60%'];

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });
  const si = currentScene;

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ background: '#0d0a08', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Persistent warm ambient glow — shifts position per scene */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '70vw',
          height: '70vw',
          background: 'radial-gradient(circle, rgba(232,144,106,0.13) 0%, transparent 70%)',
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{ left: accentX[si], top: accentY[si], scale: accentScale[si] }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Persistent secondary cool glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '40vw',
          height: '40vw',
          background: 'radial-gradient(circle, rgba(180,120,160,0.09) 0%, transparent 70%)',
          right: 0,
          bottom: 0,
        }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.15, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Persistent accent line that travels between scenes */}
      <motion.div
        className="absolute h-px pointer-events-none"
        style={{ background: 'rgba(232,144,106,0.55)', top: '88%' }}
        animate={{ left: lineLeft[si], width: lineWidth[si] }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Persistent corner dot */}
      <motion.div
        className="absolute w-2 h-2 rounded-full pointer-events-none"
        style={{ background: '#e8906a', right: '4vw', top: '4vh' }}
        animate={{ opacity: si === 0 || si === 4 ? 1 : 0.35, scale: si === 0 || si === 4 ? 1.4 : 1 }}
        transition={{ duration: 0.8 }}
      />

      <AnimatePresence mode="popLayout">
        {si === 0 && <Scene1 key="hero" />}
        {si === 1 && <Scene2 key="studio" />}
        {si === 2 && <Scene3 key="moments" />}
        {si === 3 && <Scene4 key="express" />}
        {si === 4 && <Scene5 key="send" />}
      </AnimatePresence>
    </div>
  );
}
