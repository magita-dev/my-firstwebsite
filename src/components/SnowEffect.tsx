import React, { useEffect, useRef, useState } from 'react';

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  density: number;
  wind: number;
  opacity: number;
}

interface SnowEffectProps {
  enabled?: boolean;
}

export const SnowEffect: React.FC<SnowEffectProps> = ({ enabled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!enabled || reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive snowflake count (fewer on mobile for 60fps performance)
    const flakeCount = window.innerWidth < 768 ? 45 : 90;
    const flakes: Snowflake[] = [];

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        density: Math.random() * 1 + 0.5,
        wind: Math.random() * 0.4 - 0.2,
        opacity: Math.random() * 0.6 + 0.2
      });
    }

    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      angle += 0.008;

      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < flakeCount; i++) {
        const flake = flakes[i];

        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2, true);
        ctx.fillStyle = `rgba(248, 250, 252, ${flake.opacity})`;
        ctx.fill();

        // Update positions with subtle floating physics
        flake.y += Math.cos(angle + flake.density) + 0.8 + flake.radius / 2;
        flake.x += Math.sin(angle) * 0.8 + flake.wind;

        // Wrap around boundaries
        if (flake.y > height + 10) {
          flakes[i] = {
            x: Math.random() * width,
            y: -10,
            radius: flake.radius,
            density: flake.density,
            wind: flake.wind,
            opacity: flake.opacity
          };
        }

        if (flake.x > width + 10) {
          flake.x = -10;
        } else if (flake.x < -10) {
          flake.x = width + 10;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled, reducedMotion]);

  if (!enabled || reducedMotion) return null;

  return (
    <canvas
      id="snow-canvas"
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40 w-full h-full opacity-70"
      aria-hidden="true"
    />
  );
};
