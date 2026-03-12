import { cn } from "@/lib/utils";

const PLATFORM_STYLES = {
  twitch: { label: "Twitch", color: "text-purple-400 border-purple-500/40 bg-purple-500/10" },
  tiktok: { label: "TikTok", color: "text-pink-400 border-pink-500/40 bg-pink-500/10" },
  youtube: { label: "YouTube", color: "text-red-400 border-red-500/40 bg-red-500/10" },
  kick: { label: "Kick", color: "text-green-400 border-green-500/40 bg-green-500/10" },
  x: { label: "X", color: "text-gray-300 border-gray-500/40 bg-gray-500/10" },
};

export default function PlatformBadge({ platform, live = false, size = "md" }) {
  const style = PLATFORM_STYLES[platform] || { label: platform, color: "text-gray-400 border-gray-500/40 bg-gray-500/10" };
  return (
    <div className={cn(
      "flex items-center gap-1.5 border rounded-full font-medium",
      style.color,
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
    )}>
      {live && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {style.label}
    </div>
  );
}