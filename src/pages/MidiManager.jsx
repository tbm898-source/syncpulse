import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Music2, Send, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import MidiMappingRow from "../components/flux/MidiMappingRow";

const EMPTY_MAPPING = {
  name: "",
  midi_channel: 1,
  midi_type: "cc",
  midi_number: 0,
  target_type: "resolume_layer_opacity",
  target_layer: 1,
  target_clip: 1,
  target_column: 1,
  osc_address: "",
  value_min: 0,
  value_max: 1,
  enabled: true,
  notes: "",
};

const TARGET_TYPES = [
  { value: "resolume_layer_opacity", label: "Layer Opacity" },
  { value: "resolume_layer_bypass", label: "Layer Bypass" },
  { value: "resolume_clip_trigger", label: "Clip Trigger" },
  { value: "resolume_bpm", label: "BPM" },
  { value: "resolume_column", label: "Column Connect" },
  { value: "osc_custom", label: "OSC Custom" },
];

export default function MidiManager() {
  const [mappings, setMappings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_MAPPING);
  const [saving, setSaving] = useState(false);
  const [pushLog, setPushLog] = useState([]);
  const [pushing, setPushing] = useState(false);
  const [resolumeHost, setResolumeHost] = useState("localhost");
  const [resolumePort, setResolumePort] = useState(8080);

  const load = () => base44.entities.MidiMapping.list("-created_date").then(setMappings);

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name || form.midi_number === "") return;
    setSaving(true);
    await base44.entities.MidiMapping.create(form);
    setForm(EMPTY_MAPPING);
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleToggle = async (m) => {
    await base44.entities.MidiMapping.update(m.id, { enabled: !m.enabled });
    load();
  };

  const handleDelete = async (m) => {
    await base44.entities.MidiMapping.delete(m.id);
    load();
  };

  // Send directly to Resolume REST API from the browser
  const sendToResolume = async (address, value) => {
    const base = `http://${resolumeHost}:${resolumePort}/api/v1`;
    const isConnect = address.endsWith("/connect");
    const method = isConnect ? "POST" : "PUT";
    const body = isConnect ? null : JSON.stringify({ value: Number(value) });
    const res = await fetch(`${base}${address}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body,
    });
    return res.ok;
  };

  // Test-fire a single mapping directly from browser → Resolume
  const handleFire = async (m) => {
    const oscAddress = buildOscAddress(m);
    const logEntry = { id: Date.now(), address: oscAddress, mapping: m.name, ok: null };
    setPushLog(prev => [logEntry, ...prev.slice(0, 19)]);
    const ok = await sendToResolume(oscAddress, m.value_max).catch(() => false);
    setPushLog(prev => prev.map(e => e.id === logEntry.id ? { ...e, ok } : e));
  };

  // Push all enabled mappings directly from browser → Resolume
  const handlePushAll = async () => {
    setPushing(true);
    const enabled = mappings.filter(m => m.enabled);
    for (const m of enabled) {
      const oscAddress = buildOscAddress(m);
      const logEntry = { id: Date.now() + Math.random(), address: oscAddress, mapping: m.name, ok: null };
      setPushLog(prev => [logEntry, ...prev].slice(0, 20));
      const ok = await sendToResolume(oscAddress, m.value_min).catch(() => false);
      setPushLog(prev => prev.map(e => e.id === logEntry.id ? { ...e, ok } : e));
    }
    setPushing(false);
  };

  const buildOscAddress = (m) => {
    if (m.target_type === "osc_custom") return m.osc_address || "/custom";
    if (m.target_type === "resolume_layer_opacity") return `/composition/layers/${m.target_layer}/video/opacity`;
    if (m.target_type === "resolume_layer_bypass") return `/composition/layers/${m.target_layer}/bypassed`;
    if (m.target_type === "resolume_clip_trigger") return `/composition/layers/${m.target_layer}/clips/${m.target_clip}/connect`;
    if (m.target_type === "resolume_bpm") return `/composition/tempocontroller/tempo`;
    if (m.target_type === "resolume_column") return `/composition/columns/${m.target_column}/connect`;
    return `/midi/${m.midi_number}`;
  };

  const needsLayer = ["resolume_layer_opacity", "resolume_layer_bypass", "resolume_clip_trigger"].includes(form.target_type);
  const needsClip = form.target_type === "resolume_clip_trigger";
  const needsColumn = form.target_type === "resolume_column";
  const needsOsc = form.target_type === "osc_custom";
  const needsRange = ["resolume_layer_opacity", "resolume_bpm", "osc_custom"].includes(form.target_type);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Music2 className="w-6 h-6 text-cyan-400" />
            MIDI Mappings
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{mappings.length} mapping{mappings.length !== 1 ? "s" : ""} · {mappings.filter(m => m.enabled).length} active</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePushAll}
            disabled={pushing || mappings.filter(m => m.enabled).length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-all text-sm disabled:opacity-40"
          >
            {pushing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Push All to OSC
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            New Mapping
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#111118] border border-cyan-500/20 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-widest">New Mapping</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Label</label>
              <input
                className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="e.g. Filter Cutoff"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">MIDI Type</label>
              <select
                className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                value={form.midi_type}
                onChange={e => setForm(f => ({ ...f, midi_type: e.target.value }))}
              >
                <option value="cc">CC</option>
                <option value="note_on">Note On</option>
                <option value="note_off">Note Off</option>
                <option value="pitchbend">Pitch Bend</option>
                <option value="aftertouch">Aftertouch</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Channel</label>
              <input
                type="number" min={1} max={16}
                className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                value={form.midi_channel}
                onChange={e => setForm(f => ({ ...f, midi_channel: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">MIDI # (0–127)</label>
              <input
                type="number" min={0} max={127}
                className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                value={form.midi_number}
                onChange={e => setForm(f => ({ ...f, midi_number: Number(e.target.value) }))}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Target</label>
              <select
                className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                value={form.target_type}
                onChange={e => setForm(f => ({ ...f, target_type: e.target.value }))}
              >
                {TARGET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            {needsLayer && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Layer #</label>
                <input
                  type="number" min={1}
                  className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                  value={form.target_layer}
                  onChange={e => setForm(f => ({ ...f, target_layer: Number(e.target.value) }))}
                />
              </div>
            )}
            {needsClip && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Clip #</label>
                <input
                  type="number" min={1}
                  className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                  value={form.target_clip}
                  onChange={e => setForm(f => ({ ...f, target_clip: Number(e.target.value) }))}
                />
              </div>
            )}
            {needsColumn && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Column #</label>
                <input
                  type="number" min={1}
                  className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                  value={form.target_column}
                  onChange={e => setForm(f => ({ ...f, target_column: Number(e.target.value) }))}
                />
              </div>
            )}
            {needsOsc && (
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">OSC Address</label>
                <input
                  className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-500/50 focus:outline-none"
                  placeholder="/my/custom/address"
                  value={form.osc_address}
                  onChange={e => setForm(f => ({ ...f, osc_address: e.target.value }))}
                />
              </div>
            )}
            {needsRange && (
              <>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Value Min</label>
                  <input
                    type="number" step="0.01"
                    className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                    value={form.value_min}
                    onChange={e => setForm(f => ({ ...f, value_min: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Value Max</label>
                  <input
                    type="number" step="0.01"
                    className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                    value={form.value_max}
                    onChange={e => setForm(f => ({ ...f, value_max: Number(e.target.value) }))}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowForm(false); setForm(EMPTY_MAPPING); }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-white transition-colors"
            >Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name}
              className="px-4 py-2 text-sm bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save Mapping"}
            </button>
          </div>
        </div>
      )}

      {/* Mappings list */}
      <div className="space-y-2">
        {mappings.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            <Music2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No mappings yet — add your first MIDI mapping above.</p>
          </div>
        )}
        {mappings.map(m => (
          <MidiMappingRow
            key={m.id}
            mapping={m}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onFire={handleFire}
          />
        ))}
      </div>

      {/* OSC Push Log */}
      {pushLog.length > 0 && (
        <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4">
          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">OSC Bridge Log</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {pushLog.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 text-xs font-mono">
                {entry.ok === null && <RefreshCw className="w-3 h-3 text-gray-500 animate-spin flex-shrink-0" />}
                {entry.ok === true && <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />}
                {entry.ok === false && <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />}
                <span className="text-gray-400">{entry.mapping}</span>
                <span className="text-cyan-400/60">{entry.address}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}