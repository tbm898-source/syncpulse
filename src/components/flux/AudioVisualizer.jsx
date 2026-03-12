import { useEffect, useRef } from "react";

export default function AudioVisualizer({ active, color = "#00f5ff", bars = 32, height = 60 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const dataRef = useRef(Array(bars).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const barW = w / bars - 1;

      dataRef.current = dataRef.current.map((v, i) => {
        if (!active) return v * 0.9;
        const target = Math.random() * h * (0.2 + 0.6 * Math.sin(Date.now() / 300 + i * 0.5) ** 2);
        return v * 0.7 + target * 0.3;
      });

      dataRef.current.forEach((v, i) => {
        const x = i * (barW + 1);
        const barH = Math.max(2, v);
        const gradient = ctx.createLinearGradient(0, h, 0, h - barH);
        gradient.addColorStop(0, color + "aa");
        gradient.addColorStop(1, color);
        ctx.fillStyle = gradient;
        ctx.fillRect(x, h - barH, barW, barH);
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active, color, bars]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={height}
      className="w-full rounded"
      style={{ height }}
    />
  );
}