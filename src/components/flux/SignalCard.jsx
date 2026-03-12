import { cn } from "@/lib/utils";

export default function SignalCard({ title, value, unit, status, color = "cyan", children, className }) {
  const colors = {
    cyan: "border-cyan-500/30 text-cyan-400",
    purple: "border-purple-500/30 text-purple-400",
    pink: "border-pink-500/30 text-pink-400",
    green: "border-green-500/30 text-green-400",
    orange: "border-orange-500/30 text-orange-400",
  };

  const glows = {
    cyan: "shadow-[0_0_15px_rgba(0,245,255,0.1)]",
    purple: "shadow-[0_0_15px_rgba(124,58,237,0.15)]",
    pink: "shadow-[0_0_15px_rgba(255,0,128,0.15)]",
    green: "shadow-[0_0_15px_rgba(34,197,94,0.1)]",
    orange: "shadow-[0_0_15px_rgba(249,115,22,0.1)]",
  };

  const dotColors = {
    cyan: "bg-cyan-400",
    purple: "bg-purple-400",
    pink: "bg-pink-400",
    green: "bg-green-400",
    orange: "bg-orange-400",
  };

  return (
    <div className={cn(
      "bg-[#111118] border rounded-xl p-4",
      colors[color],
      glows[color],
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">{title}</span>
        {status !== undefined && (
          <div className="flex items-center gap-1.5">
            <div className={cn("w-1.5 h-1.5 rounded-full", status ? dotColors[color] : "bg-gray-600", status && "animate-pulse")} />
            <span className={cn("text-xs", status ? colors[color] : "text-gray-600")}>{status ? "ACTIVE" : "OFF"}</span>
          </div>
        )}
      </div>
      {value !== undefined && (
        <div className="flex items-baseline gap-1 mb-3">
          <span className={cn("text-3xl font-bold", colors[color])}>{value}</span>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>
      )}
      {children}
    </div>
  );
}