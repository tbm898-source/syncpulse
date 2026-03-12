import { useState } from "react";
import { RefreshCw, Wifi, WifiOff, ChevronDown, ChevronRight, Play, EyeOff, Layers } from "lucide-react";
import { useResolume } from "./useResolume";

export default function ResolumePanel({ host = "localhost", port = 8080 }) {
  const {
    composition, layers, connected, error, loading,
    triggerClip, setLayerOpacity, setLayerBypass, refreshNow,
  } = useResolume(host, port, 2000);

  const [expandedLayers, setExpandedLayers] = useState({});
  const [opacityDraft, setOpacityDraft] = useState({});

  const toggleLayer = (id) => setExpandedLayers(s => ({ ...s, [id]: !s[id] }));

  const handleOpacityCommit = (layerIndex, val) => {
    setLayerOpacity(layerIndex, parseFloat(val));
  };

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e2e]">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">Resolume Arena</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection badge */}
          <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${
            connected
              ? "border-green-500/30 text-green-400 bg-green-500/10"
              : "border-red-500/30 text-red-400 bg-red-500/10"
          }`}>
            {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {connected ? "Connected" : error ? "Offline" : "Connecting…"}
          </div>
          <button onClick={refreshNow} className={`text-gray-600 hover:text-cyan-400 transition-colors ${loading ? "animate-spin" : ""}`}>
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Composition meta */}
      {connected && composition && (
        <div className="px-4 py-2 border-b border-[#1e1e2e] grid grid-cols-3 gap-2 text-xs font-mono">
          <div>
            <span className="text-gray-600">Name </span>
            <span className="text-cyan-300">{composition.name?.value ?? "—"}</span>
          </div>
          <div>
            <span className="text-gray-600">BPM </span>
            <span className="text-cyan-300">{composition.tempocontroller?.tempo?.value?.toFixed(1) ?? "—"}</span>
          </div>
          <div>
            <span className="text-gray-600">FPS </span>
            <span className="text-cyan-300">{composition.fps?.value ?? "—"}</span>
          </div>
        </div>
      )}

      {/* Layers list */}
      <div className="max-h-80 overflow-y-auto">
        {!connected && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-600 gap-2 text-xs">
            <WifiOff className="w-6 h-6" />
            <span>Cannot reach {host}:{port}</span>
            {error && <span className="text-red-500/60 font-mono">{error}</span>}
          </div>
        )}

        {connected && layers.length === 0 && (
          <div className="flex items-center justify-center py-6 text-xs text-gray-600">No layers found</div>
        )}

        {connected && layers.map((layer, li) => (
          <div key={layer.id} className="border-b border-[#1e1e2e] last:border-0">
            {/* Layer header */}
            <div className="flex items-center gap-2 px-4 py-2 hover:bg-white/[0.02] cursor-pointer select-none"
              onClick={() => toggleLayer(layer.id)}>
              {expandedLayers[layer.id]
                ? <ChevronDown className="w-3 h-3 text-gray-600 flex-shrink-0" />
                : <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />}

              <span className={`text-xs font-medium flex-1 truncate ${layer.bypassed ? "text-gray-600 line-through" : "text-white"}`}>
                {layer.name}
              </span>

              {/* Opacity slider */}
              <div className="flex items-center gap-2 mr-2" onClick={e => e.stopPropagation()}>
                <input
                  type="range" min="0" max="1" step="0.01"
                  value={opacityDraft[layer.id] ?? layer.opacity}
                  onChange={e => setOpacityDraft(s => ({ ...s, [layer.id]: e.target.value }))}
                  onMouseUp={e => handleOpacityCommit(li + 1, e.target.value)}
                  onTouchEnd={e => handleOpacityCommit(li + 1, opacityDraft[layer.id] ?? layer.opacity)}
                  className="w-20 accent-cyan-500"
                />
                <span className="text-xs font-mono text-gray-500 w-8 text-right">
                  {Math.round((opacityDraft[layer.id] ?? layer.opacity) * 100)}%
                </span>
              </div>

              {/* Bypass toggle */}
              <button
                onClick={e => { e.stopPropagation(); setLayerBypass(li + 1, !layer.bypassed); }}
                className={`p-1 rounded transition-colors ${layer.bypassed ? "text-orange-400" : "text-gray-600 hover:text-orange-400"}`}
                title="Bypass layer"
              >
                <EyeOff className="w-3 h-3" />
              </button>

              {/* Clip count */}
              <span className="text-xs text-gray-600 ml-1 font-mono">{layer.clips.length}c</span>
            </div>

            {/* Clips */}
            {expandedLayers[layer.id] && layer.clips.length > 0 && (
              <div className="px-4 pb-2 grid grid-cols-2 gap-1.5 bg-black/20">
                {layer.clips.map((clip, ci) => (
                  <button
                    key={clip.id}
                    onClick={() => triggerClip(li + 1, ci + 1)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs text-left transition-all border ${
                      clip.playing
                        ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                        : "border-[#1e1e2e] text-gray-400 hover:border-cyan-500/20 hover:text-white"
                    }`}
                  >
                    <Play className={`w-2.5 h-2.5 flex-shrink-0 ${clip.playing ? "text-cyan-400" : "text-gray-600"}`} />
                    <span className="truncate">{clip.name || `Clip ${ci + 1}`}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}