import { Server, Wifi, WifiOff } from "lucide-react";

const STATE_STYLES = {
  connected: "border-green-500/30 bg-green-500/10 text-green-400",
  connecting: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  stale: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  unavailable: "border-gray-700 bg-[#111118] text-gray-500"
};

export default function BridgeStatusBanner({ bridge, obs }) {
  const style = bridge.available
    ? STATE_STYLES[bridge.state] || STATE_STYLES.unavailable
    : STATE_STYLES.unavailable;

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${style}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4" />
          <span className="text-sm font-semibold">Local Bridge</span>
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest">
          {bridge.available ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {bridge.label}
        </div>
      </div>

      <div className="text-xs opacity-80 space-y-1">
        <div>Endpoint: {bridge.baseUrl}</div>
        {bridge.error && <div>Error: {bridge.error}</div>}
        {!bridge.available && (
          <div>
            Start the bridge on this streaming computer: <code className="text-[11px]">cd bridge && npm run dev</code>
          </div>
        )}
        {obs && bridge.available && (
          <div className="pt-1 border-t border-current/10">
            OBS {obs.version ? `· ${obs.version}` : ""}
            {obs.currentProgramScene ? ` · Scene: ${obs.currentProgramScene}` : ""}
            {obs.streaming ? " · Streaming" : ""}
            {obs.recording ? " · Recording" : ""}
            {obs.stream ? ` · ${obs.stream.droppedFrames} dropped frames` : ""}
          </div>
        )}
      </div>
    </div>
  );
}
