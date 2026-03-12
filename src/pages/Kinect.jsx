import { useState } from "react";
import PointCloudCanvas from "../components/flux/PointCloudCanvas";
import SignalCard from "../components/flux/SignalCard";
import { Cpu, RefreshCw } from "lucide-react";

export default function Kinect() {
  const [enabled, setEnabled] = useState(false);
  const [settings, setSettings] = useState({
    depthMin: 0.5,
    depthMax: 4.5,
    threshold: 0.45,
    pointSize: 2,
    colorMode: "depth",
    oscBridge: "localhost:8001",
  });

  const update = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Kinect v2 + Point Cloud</h1>
          <p className="text-sm text-gray-500 mt-0.5">Depth sensor config, PDE integration & OSC bridge</p>
        </div>
        <button
          onClick={() => setEnabled(e => !e)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
            enabled
              ? "bg-purple-500/20 border-purple-500/40 text-purple-400 hover:bg-purple-500/30"
              : "bg-[#111118] border-[#1e1e2e] text-gray-400 hover:border-purple-500/30"
          }`}
        >
          <Cpu className="w-4 h-4" />
          {enabled ? "Sensor Active" : "Activate Sensor"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Point cloud preview */}
        <div className="lg:col-span-2 bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${enabled ? "bg-purple-400 animate-pulse" : "bg-gray-600"}`} />
            <span className="text-xs text-gray-500 uppercase tracking-widest">Live Preview — Point Cloud PDE</span>
          </div>
          <PointCloudCanvas active={enabled} color="#a855f7" />
          <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
            {[["Resolution", "512×424"], ["FPS", enabled ? "30" : "0"], ["Latency", enabled ? "~12ms" : "—"]].map(([k, v]) => (
              <div key={k} className="text-center">
                <div className="text-gray-600">{k}</div>
                <div className={enabled ? "text-purple-300 font-mono" : "text-gray-600 font-mono"}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <SignalCard title="Depth Range" color="purple" status={enabled}>
            <div className="space-y-3 mt-1">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Min</span><span className="text-purple-300 font-mono">{settings.depthMin}m</span></div>
                <input type="range" min="0.1" max="2" step="0.1" value={settings.depthMin}
                  onChange={e => update("depthMin", parseFloat(e.target.value))}
                  className="w-full accent-purple-500" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Max</span><span className="text-purple-300 font-mono">{settings.depthMax}m</span></div>
                <input type="range" min="1" max="8" step="0.1" value={settings.depthMax}
                  onChange={e => update("depthMax", parseFloat(e.target.value))}
                  className="w-full accent-purple-500" />
              </div>
            </div>
          </SignalCard>

          <SignalCard title="Detection Threshold" color="purple">
            <div className="mt-1">
              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Threshold</span><span className="text-purple-300 font-mono">{settings.threshold}</span></div>
              <input type="range" min="0" max="1" step="0.01" value={settings.threshold}
                onChange={e => update("threshold", parseFloat(e.target.value))}
                className="w-full accent-purple-500" />
            </div>
          </SignalCard>

          <SignalCard title="Point Size" color="purple">
            <div className="mt-1">
              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Size</span><span className="text-purple-300 font-mono">{settings.pointSize}px</span></div>
              <input type="range" min="1" max="6" step="0.5" value={settings.pointSize}
                onChange={e => update("pointSize", parseFloat(e.target.value))}
                className="w-full accent-purple-500" />
            </div>
          </SignalCard>

          <SignalCard title="Color Mode" color="purple">
            <div className="grid grid-cols-2 gap-1 mt-1">
              {["depth", "rgb", "ir", "skeleton"].map(m => (
                <button key={m} onClick={() => update("colorMode", m)}
                  className={`py-1.5 rounded text-xs font-mono transition-all ${settings.colorMode === m ? "bg-purple-500/30 text-purple-300 border border-purple-500/40" : "text-gray-500 border border-[#1e1e2e] hover:border-purple-500/20"}`}>
                  {m}
                </button>
              ))}
            </div>
          </SignalCard>

          <SignalCard title="OSC Bridge" color="cyan">
            <div className="mt-1 space-y-2">
              <input value={settings.oscBridge} onChange={e => update("oscBridge", e.target.value)}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded px-2 py-1.5 text-xs font-mono text-cyan-300 outline-none" />
              <button className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs rounded hover:bg-cyan-500/20 transition-all">
                <RefreshCw className="w-3 h-3" /> Test Connection
              </button>
            </div>
          </SignalCard>
        </div>
      </div>
    </div>
  );
}