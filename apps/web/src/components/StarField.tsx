import { useEffect, useRef } from 'react';
import './StarField.css';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkleSpeed: number;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create stars
    const starCount = 180;
    starsRef.current = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      starsRef.current.forEach((star) => {
        // Parallax effect: stars move opposite to mouse, proportional to size
        const parallaxX = (mx - canvas.width / 2) * star.speed * 0.02;
        const parallaxY = (my - canvas.height / 2) * star.speed * 0.02;
        const drawX = star.x - parallaxX;
        const drawY = star.y - parallaxY;

        // Twinkle
        const twinkle = Math.sin(time * star.twinkleSpeed * 100 + star.x) * 0.3 + 0.7;
        const alpha = star.opacity * twinkle;

        // Draw star
        ctx.beginPath();
        ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.size > 1.5
          ? `rgba(167, 139, 250, ${alpha})`
          : `rgba(241, 245, 249, ${alpha})`;
        ctx.fill();

        // Add glow for larger stars
        if (star.size > 1.8) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, star.size * 3, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, star.size * 3);
          gradient.addColorStop(0, `rgba(124, 58, 237, ${alpha * 0.3})`);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      // Draw a few connecting lines between close stars
      for (let i = 0; i < starsRef.current.length; i++) {
        for (let j = i + 1; j < starsRef.current.length; j++) {
          const a = starsRef.current[i];
          const b = starsRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && a.size > 1 && b.size > 1) {
            ctx.beginPath();
            ctx.moveTo(a.x - (mx - canvas.width / 2) * a.speed * 0.02, a.y - (my - canvas.height / 2) * a.speed * 0.02);
            ctx.lineTo(b.x - (mx - canvas.width / 2) * b.speed * 0.02, b.y - (my - canvas.height / 2) * b.speed * 0.02);
            ctx.strokeStyle = `rgba(124, 58, 237, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="star-field" />;
}
