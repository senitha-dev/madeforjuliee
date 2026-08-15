import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Photos cycling through all 5 ── */
const PHOTOS = [
  '/nethmini.png',
  '/photo2.png',
  '/photo3.png',
  '/photo4.png',
  '/photo5.png',
];

/* ── Parametric heart equation ──
   x = 16 sin³(t)
   y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
   Generates N evenly-spaced points on the heart curve
*/
function heartPoints(n: number, scale: number, cx: number, cy: number) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    pts.push({ x: cx + x * scale, y: cy + y * scale });
  }
  return pts;
}

interface PhotoHeartProps {
  onClose: () => void;
}

export default function PhotoHeart({ onClose }: PhotoHeartProps) {
  // We use 3 phases: 'hidden' -> 'intro' (fast pop-up) -> 'heart' (formation)
  const [phase, setPhase] = useState<'hidden' | 'intro' | 'heart'>('hidden');

  const N = 16; // number of photo slots

  // Pre-calculate stable random offsets for the "intro pop-up" sequence
  const introPositions = useMemo(() => {
    const winW = typeof window !== 'undefined' ? window.innerWidth : 800;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    return Array.from({ length: N }).map(() => ({
      x: (Math.random() - 0.5) * (winW * 0.75),
      y: (Math.random() - 0.5) * (winH * 0.75),
      rot: (Math.random() - 0.5) * 60, // Wild rotation
      targetRot: (Math.random() - 0.5) * 12 // Subtle rotation for final heart
    }));
  }, []);

  useEffect(() => {
    // 1. Start intro pop-up very quickly after mount
    const t1 = setTimeout(() => setPhase('intro'), 100);
    // 2. Wait for intro staggered animation (N * 0.05s + duration) then form heart
    const t2 = setTimeout(() => setPhase('heart'), 1600);
    
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Center of the viewport
  const cx = 0;   // SVG-relative
  const cy = 10;  // slightly down

  // Responsive scale: smaller on mobile
  const scale = typeof window !== 'undefined' && window.innerWidth < 600 ? 11 : 15;

  const points = heartPoints(N, scale, cx, cy);

  // Photo size: slightly varies per slot for depth effect
  const sizes = points.map((_, i) => 58 + (i % 3) * 8);

  return (
    <motion.div
      className="photo-heart-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClose}
    >
      {/* Glow behind the heart */}
      <div className="ph-glow" />

      {/* Sparkles */}
      {['✨','💖','🌸','⭐','💕','🎀','✨','💝'].map((e, i) => (
        <motion.div
          key={i}
          className="ph-sparkle"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${5 + Math.random() * 90}%`,
            fontSize: `${14 + Math.random() * 14}px`,
          }}
          animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
        >
          {e}
        </motion.div>
      ))}

      {/* SVG coordinate container — photos placed relative to center */}
      <div className="ph-stage">
        {points.map((pt, i) => (
          <motion.div
            key={i}
            className="ph-photo-slot"
            style={{
              width: sizes[i],
              height: sizes[i],
              left: `calc(50% + ${pt.x}px - ${sizes[i] / 2}px)`,
              top: `calc(50% + ${pt.y}px - ${sizes[i] / 2}px)`,
            }}
            initial={{
              opacity: 0,
              scale: 0,
              x: introPositions[i].x,
              y: introPositions[i].y,
              rotate: introPositions[i].rot,
            }}
            animate={{
              opacity: phase !== 'hidden' ? 1 : 0,
              // Pop up big in 'intro', settle to 1 in 'heart'
              scale: phase === 'intro' ? 1.6 : (phase === 'heart' ? 1 : 0),
              x: phase === 'intro' ? introPositions[i].x : 0,
              y: phase === 'intro' ? introPositions[i].y : 0,
              rotate: phase === 'intro' ? introPositions[i].rot : introPositions[i].targetRot,
              zIndex: phase === 'intro' ? 10 + i : 1,
            }}
            transition={{
              // Fast staggered delay for intro, slower simultaneous fly-in for heart
              delay: phase === 'intro' ? i * 0.05 : i * 0.03,
              duration: phase === 'intro' ? 0.4 : 1.2,
              type: 'spring',
              stiffness: phase === 'intro' ? 220 : 85,
              damping: phase === 'intro' ? 12 : 14,
            }}
            whileHover={{ scale: 1.18, zIndex: 100, rotate: 0 }}
          >
            <img
              src={PHOTOS[i % PHOTOS.length]}
              alt={`Memory ${i + 1}`}
              className="ph-photo"
            />
            {/* Glow ring */}
            <div className="ph-ring" />
          </motion.div>
        ))}

        {/* Centre heart label */}
        <AnimatePresence>
          {phase === 'heart' && (
            <motion.div
              className="ph-center-label"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: 'spring', stiffness: 150 }}
            >
              <div className="ph-center-emoji">💖</div>
              <div className="ph-center-text">Nethmini</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Close hint */}
      <motion.div
        className="ph-close-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        Tap anywhere to close ✕
      </motion.div>
    </motion.div>
  );
}
