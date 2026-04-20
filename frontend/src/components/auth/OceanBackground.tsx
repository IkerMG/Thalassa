import { useMemo } from 'react';

interface Bubble {
  id: number;
  size: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
}

// Pre-seeded so positions stay stable across hot-reloads
const BUBBLE_SEEDS: Bubble[] = [
  { id: 0,  size: 35,  left: 8,  top: 72, delay: 0,   duration: 7  },
  { id: 1,  size: 58,  left: 17, top: 30, delay: 1.2, duration: 9  },
  { id: 2,  size: 22,  left: 25, top: 55, delay: 2.5, duration: 6  },
  { id: 3,  size: 80,  left: 33, top: 10, delay: 0.8, duration: 11 },
  { id: 4,  size: 44,  left: 42, top: 80, delay: 3.1, duration: 8  },
  { id: 5,  size: 28,  left: 50, top: 40, delay: 1.7, duration: 7  },
  { id: 6,  size: 65,  left: 60, top: 65, delay: 4.0, duration: 10 },
  { id: 7,  size: 18,  left: 68, top: 20, delay: 0.4, duration: 6  },
  { id: 8,  size: 90,  left: 75, top: 48, delay: 2.9, duration: 12 },
  { id: 9,  size: 40,  left: 82, top: 78, delay: 1.5, duration: 8  },
  { id: 10, size: 55,  left: 90, top: 15, delay: 3.7, duration: 9  },
  { id: 11, size: 30,  left: 5,  top: 90, delay: 5.2, duration: 7  },
  { id: 12, size: 72,  left: 14, top: 5,  delay: 0.9, duration: 10 },
  { id: 13, size: 24,  left: 48, top: 92, delay: 2.1, duration: 6  },
  { id: 14, size: 48,  left: 57, top: 8,  delay: 4.5, duration: 9  },
  { id: 15, size: 36,  left: 72, top: 35, delay: 1.0, duration: 8  },
  { id: 16, size: 62,  left: 88, top: 58, delay: 3.4, duration: 11 },
  { id: 17, size: 20,  left: 38, top: 25, delay: 6.0, duration: 7  },
];

export default function OceanBackground() {
  const bubbles = useMemo(() => BUBBLE_SEEDS, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Ambient radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Tech grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating bubbles */}
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full border border-cyan/20 bg-cyan/5 animate-bubble"
          style={{
            width:  b.size,
            height: b.size,
            left:   `${b.left}%`,
            top:    `${b.top}%`,
            animationDelay:    `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}

      {/* Bottom fade-out */}
      <div
        className="absolute inset-x-0 bottom-0 h-48"
        style={{
          background:
            'linear-gradient(to top, rgba(5,11,24,1) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
