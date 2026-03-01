import { useEffect, useState } from 'react';

const PARTICLE_COUNT = 40;
const COLORS = ['#6C63FF', '#A78BFA', '#34D399', '#F59E0B', '#EC4899', '#3B82F6', '#F97316', '#06B6D4'];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Confetti({ active, onDone }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) return;
    const ps = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: randomBetween(10, 90),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: randomBetween(0, 0.3),
      duration: randomBetween(0.8, 1.6),
      size: randomBetween(6, 12),
      rotation: randomBetween(0, 360),
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    }));
    setParticles(ps);
    const timeout = setTimeout(() => {
      setParticles([]);
      onDone?.();
    }, 2000);
    return () => clearTimeout(timeout);
  }, [active, onDone]);

  if (particles.length === 0) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999, overflow: 'hidden' }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-5%',
            width: p.size,
            height: p.shape === 'circle' ? p.size : p.size * 1.5,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            background: p.color,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
