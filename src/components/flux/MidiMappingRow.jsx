import { Trash2, ToggleLeft, ToggleRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const TARGET_LABELS = {
  resolume_layer_opacity: "Layer Opacity",
  resolume_layer_bypass: "Layer Bypass",
  resolume_clip_trigger: "Clip Trigger",
  resolume_bpm: "BPM",
  resolume_column: "Column Connect",
  osc_custom: "OSC Custom",
};

const TYPE_COLORS = {
  cc: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  note_on: "text-green-400 border-green-500/30 bg-green-500/10",
  note_off: "text-red-400 border-red-500/30 bg-red-500/10",
  pitchbend: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  aftertouch: "text-orange-400 border-orange-500/30 bg-orange-500/10",
};

export default function MidiMappingRow({ mapping, onToggle, onDelete, onFire }) {
  const targetLabel = TARGET_LABELS[mapping.target_type] || mapping.target_type;
  const typeColor = TYPE_COLORS[mapping.midi_type] || "text-gray-400 border-gray-500/30 bg-gray-500/10";

  const targetDetail = () => {
    if (mapping.target_type === "resolume_layer_opacity" || mapping.target_type === "resolume_layer_bypass")
      return `L${mapping.target_layer ?? "?"}`;
    if (mapping.target_type === "resolume_clip_trigger")
      return `L${mapping.target_layer ?? "?"} C${mapping.target_clip ?? "?"}`;
    if (mapping.target_type === "resolume_column")
      return `Col ${mapping.target_column ?? "?"}`;
    if (mapping.target_type === "osc_custom")
      return mapping.osc_address || "—";
    return "";
  };

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg border transition-all",
      mapping.enabled
        ? "bg-[#111118] border-[#1e1e2e] hover:border-cyan-500/20"
        : "bg-[#0d0d14] border-[#1a1a28] opacity-50"
    )}>
      {/* MIDI type badge */}
      <span className={cn("text-xs font-mono font-bold px-2 py-0.5 rounded border uppercase", typeColor)}>
        {mapping.midi_type}
      </span>

      {/* Channel + Number */}
      <div className="flex items-center gap-1 text-xs font-mono text-gray-400 min-w-[60px]">
        <span className="text-gray-600">CH</span>{mapping.midi_channel ?? 1}
        <span className="text-gray-600 ml-1">#</span>{mapping.midi_number ?? "?"}
      </div>

      {/* Arrow */}
      <span className="text-gray-600 text-sm">→</span>

      {/* Target */}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-white font-medium">{mapping.name}</span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">{targetLabel}</span>
          {targetDetail() && (
            <span className="text-xs text-cyan-400/70 font-mono">{targetDetail()}</span>
          )}
        </div>
      </div>

      {/* Value range */}
      <div className="text-xs font-mono text-gray-600 hidden sm:block">
        {mapping.value_min ?? 0}→{mapping.value_max ?? 1}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onFire(mapping)}
          className="p-1.5 text-gray-600 hover:text-cyan-400 transition-colors"
          title="Test fire"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onToggle(mapping)}
          className="p-1.5 transition-colors"
          title={mapping.enabled ? "Disable" : "Enable"}
        >
          {mapping.enabled
            ? <ToggleRight className="w-4 h-4 text-cyan-400" />
            : <ToggleLeft className="w-4 h-4 text-gray-600" />
          }
        </button>
        <button
          onClick={() => onDelete(mapping)}
          className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}