import { motion } from "framer-motion";

const AVATAR = `${import.meta.env.BASE_URL}mia-poster.jpg`;

function AvatarDemo({ active, label }: { active: boolean; label: string }) {
  const size = 120;
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <motion.span
          className="absolute inset-0 rounded-full blur-md"
          style={{ background: active ? "#00C1D5" : "#f5b942" }}
          animate={
            active
              ? { scale: [1, 1.6, 1.1, 1.6, 1], opacity: [0.8, 0.1, 0.6, 0.1, 0.8] }
              : { scale: [1, 1.15, 1], opacity: [0.35, 0.1, 0.35] }
          }
          transition={{ duration: active ? 0.9 : 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute rounded-full"
          style={{
            inset: -3,
            background: active
              ? "conic-gradient(from 0deg, #00C1D5, transparent 55%, #00C1D5)"
              : "conic-gradient(from 0deg, #f5b942, transparent 55%, #f5b942)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: active ? 1.8 : 9, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute rounded-full overflow-hidden bg-[#0f2233] ring-1 ring-white/10"
          style={{ inset: 3 }}
          animate={active ? { scale: [1, 1.04, 1] } : { y: [0, -2, 0] }}
          transition={{ duration: active ? 0.9 : 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src={AVATAR}
            alt="Mia"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 20%" }}
          />
        </motion.div>

        {active && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-[3px]">
            {[0.4, 0.7, 1, 0.7, 0.4].map((h, i) => (
              <motion.div
                key={i}
                className="w-[3px] rounded-full bg-[#00C1D5]"
                animate={{ scaleY: [h, 1, h * 0.3, 1, h] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                style={{ height: 14, transformOrigin: "bottom" }}
              />
            ))}
          </div>
        )}
      </div>

      <p className="text-sm font-bold tracking-wider text-white/70 uppercase">{label}</p>
    </div>
  );
}

export default function MiaPreview() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-16 bg-[#061826] px-8">
      <div className="text-center">
        <p className="text-[#f5b942] font-bold tracking-widest text-xs uppercase mb-2">Preview</p>
        <h1 className="text-white text-3xl font-bold">Mia Speaking Animation</h1>
        <p className="text-white/50 text-sm mt-2">Live animations — this is what customers see</p>
      </div>

      <div className="flex gap-24 items-start">
        <AvatarDemo active={false} label="Idle" />
        <AvatarDemo active={true} label="Speaking" />
      </div>

      <div className="text-center max-w-sm">
        <p className="text-white/40 text-xs leading-relaxed">
          The teal (#00C1D5) ring spins faster, the glow pulses in rhythm with speech, and the sound-wave bars animate below the avatar while Mia's voice plays.
        </p>
      </div>
    </div>
  );
}
