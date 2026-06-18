import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Radio, Square, Cpu, Music, Zap, CheckCircle, AlertCircle } from "lucide-react";
import PlatformBadge from "../components/flux/PlatformBadge";
import AudioVisualizer from "../components/flux/AudioVisualizer";
import BridgeStatusBanner from "../components/flux/BridgeStatusBanner";
import { useBridgeStatus } from "@/hooks/useBridgeStatus";

const CHECKLIST = [
  { id: "bridge", label: "SyncPulse local bridge", desc: "Trusted service on this streaming computer" },
  { id: "obs", label: "OBS connected", desc: "WebSocket scenes, sources, and stream state" },
  { id: "platforms", label: "Platforms configured", desc: "At least one stream destination enabled" },
  { id: "audio", label: "Audio path ready", desc: "OBS reports an active audio input when bridge is live" },
  { id: "resolume", label: "Resolume Arena (optional)", desc: "Visual output adapter not wired yet" },
  { id: "kinect", label: "Kinect sensor (optional)", desc: "Pipeline health adapter not wired yet" },
];

export default function GoLive() {
  const { bridge, obs } = useBridgeStatus();
  const [session, setSession] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [checks, setChecks] = useState({
    bridge: false,
    obs: false,
    audio: false,
    platforms: false,
    resolume: false,
    kinect: false
  });
  const [form, setForm] = useState({ name: "", kinect_enabled: false, milkdrop_enabled: true, audio_enabled: true });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.entities.StreamSession.list("-created_date", 1).then(r => { if (r[0]) setSession(r[0]); });
    base44.entities.PlatformConfig.filter({ enabled: true }).then(r => {
      setPlatforms(r);
      setChecks(c => ({ ...c, platforms: r.length > 0 }));
    });
  }, []);

  useEffect(() => {
    const bridgeOk = bridge.available && (bridge.state === "connected" || bridge.state === "stale");
    const obsOk = bridgeOk && obs?.state === "connected" && !obs?.stale;
    const audioOk =
      obsOk &&
      Array.isArray(obs?.sources) &&
      obs.sources.some((source) => /audio|wasapi|coreaudio|pulse/i.test(source.kind));

    setChecks((current) => ({
      ...current,
      bridge: bridgeOk,
      obs: obsOk,
      audio: audioOk,
      resolume: false,
      kinect: false
    }));
  }, [bridge, obs]);

  const goLive = async () => {
    setLoading(true);
    const s = await base44.entities.StreamSession.create({
      name: form.name || `Session ${new Date().toLocaleTimeString()}`,
      status: "live",
      platforms: platforms.map(p => p.platform),
      kinect_enabled: form.kinect_enabled,
      milkdrop_enabled: form.milkdrop_enabled,
      audio_enabled: form.audio_enabled,
      started_at: new Date().toISOString(),
      // resolume_port = Web Remote HTTP API (default 8080 in Resolume). NOT OSC (often 7000 UDP).
      resolume_host: "localhost",
      resolume_port: 8080,
      osc_port: 7000,
    });
    setSession(s);
    setLoading(false);
  };

  const endStream = async () => {
    if (!session) return;
    await base44.entities.StreamSession.update(session.id, { status: "ended", ended_at: new Date().toISOString() });
    setSession(s => ({ ...s, status: "ended" }));
  };

  const isLive = session?.status === "live";
  const allGood = checks.bridge && checks.obs && checks.platforms && checks.audio;

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Go Live</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pre-flight checks and stream launch</p>
      </div>

      <BridgeStatusBanner bridge={bridge} obs={obs} />

      {/* Pre-flight */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 space-y-3">
        <h3 className="text-xs text-gray-500 uppercase tracking-widest font-medium">Pre-flight Checklist</h3>
        {CHECKLIST.map(item => {
          const ok = checks[item.id];
          return (
            <div key={item.id} className="flex items-center gap-3">
              {ok
                ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                : <AlertCircle className="w-4 h-4 text-gray-600 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${ok ? "text-white" : "text-gray-500"}`}>{item.label}</div>
                <div className="text-xs text-gray-600">{item.desc}</div>
              </div>
              {item.id === "platforms" && platforms.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {platforms.map(p => <PlatformBadge key={p.id} platform={p.platform} size="sm" />)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Session config */}
      {!isLive && (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 space-y-4">
          <h3 className="text-xs text-gray-500 uppercase tracking-widest font-medium">Session Config</h3>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Session Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={`Session ${new Date().toLocaleDateString()}`}
              className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "audio_enabled", label: "Audio", icon: Music, color: "green" },
              { key: "milkdrop_enabled", label: "MilkDrop", icon: Zap, color: "pink" },
              { key: "kinect_enabled", label: "Kinect", icon: Cpu, color: "purple" },
            ].map(({ key, label, icon: Icon, color }) => (
              <button key={key} onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${form[key]
                  ? `bg-${color}-500/10 border-${color}-500/30 text-${color}-400`
                  : "bg-[#0a0a0f] border-[#1e1e2e] text-gray-600"}`}>
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Audio preview */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Music className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs text-gray-500 uppercase tracking-widest">Audio Monitor</span>
        </div>
        <AudioVisualizer active={checks.audio} color="#22c55e" bars={40} height={60} />
      </div>

      {/* Go live / End */}
      {!isLive ? (
        <button
          onClick={goLive}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl text-lg font-bold tracking-wider transition-all border ${
            allGood
              ? "bg-gradient-to-r from-red-600/20 to-pink-600/20 border-red-500/40 text-red-400 hover:from-red-600/30 hover:to-pink-600/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
              : "bg-[#111118] border-[#1e1e2e] text-gray-600 cursor-not-allowed"
          }`}
        >
          <Radio className="w-5 h-5" />
          {loading ? "Starting..." : "GO LIVE"}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3 py-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xl font-bold tracking-widest">LIVE NOW</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {session?.platforms?.map(p => <PlatformBadge key={p} platform={p} live />)}
          </div>
          <button onClick={endStream}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-all text-sm">
            <Square className="w-4 h-4" /> End Stream
          </button>
        </div>
      )}
    </div>
  );
}