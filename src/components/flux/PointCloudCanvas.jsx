import { useEffect, useRef } from "react";

export default function PointCloudCanvas({ active, color = "#00f5ff" }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const pointsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    // Init points
    pointsRef.current = Array.from({ length: 180 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: Math.random(),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      base: { x: W / 2 + (Math.random() - 0.5) * W * 0.6, y: H / 2 + (Math.random() - 0.5) * H * 0.6 },
    }));

    const draw = () => {
      ctx.fillStyle = "rgba(10,10,15,0.25)";
      ctx.fillRect(0, 0, W, H);

      const t = Date.now() / 1000;
      pointsRef.current.forEach((p) => {
        if (active) {
          const wave = Math.sin(t * 1.5 + p.z * 10) * 1.5;
          p.x += p.vx + wave;
          p.y += p.vy + Math.cos(t + p.z * 8) * 0.8;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }

        const size = p.z * 2.5 + 0.5;
        const alpha = active ? (0.3 + p.z * 0.7) : 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });

      // Draw connections
      if (active) {
        ctx.strokeStyle = color + "18";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < pointsRef.current.length; i++) {
          for (let j = i + 1; j < pointsRef.current.length; j++) {
            const a = pointsRef.current[i];
            const b = pointsRef.current[j];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist < 50) {
              ctx.globalAlpha = (1 - dist / 50) * 0.4;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active, color]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={220}
      className="w-full rounded-lg"
      style={{ height: 220 }}
    />
  );
}