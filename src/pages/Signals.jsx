import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Star, Trash2, Sliders, Zap } from "lucide-react";
import SignalCard from "../components/flux/SignalCard";

const TYPE_COLORS = { kinect: "purple", milkdrop: "pink", audio: "green", osc: "cyan", composite: "orange" };

export default function Signals() {
  const [presets, setPresets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "osc", osc_address: "", osc_value: "", tags: "" });

  const load = () => base44.entities.SignalPreset.list("-created_date").then(setPresets);
  useEffect(() => { load(); }, []);

  const save = async () => {
    await base44.entities.SignalPreset.create({
      ...form,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [],
    });
    setForm({ name: "", type: "osc", osc_address: "", osc_value: "", tags: "" });
    setShowForm(false);
    load();
  };

  const del = async (id) => { await base44.entities.SignalPreset.delete(id); load(); };
  const toggleFav = async (p) => { await base44.entities.SignalPreset.update(p.id, { favorite: !p.favorite }); load(); };

  const fire = (p) => {
    // In production: send OSC via WebSocket bridge
    console.log("FIRE OSC:", p.osc_address, p.osc_value);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Signal Presets</h1>
          <p className="text-sm text-gray-500 mt-0.5">Save & fire OSC commands, Kinect params, MilkDrop triggers</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all text-sm"
        >
          <Plus className="w-4 h-4" /> New Preset
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111118] border border-cyan-500/20 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-widest">New Signal Preset</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50" placeholder="Bass Drop Trigger" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50">
                {["osc", "kinect", "milkdrop", "audio", "composite"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">OSC Address</label>
              <input value={form.osc_address} onChange={e => setForm(f => ({ ...f, osc_address: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-cyan-500/50" placeholder="/composition/video/opacity" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Value</label>
              <input value={form.osc_value} onChange={e => setForm(f => ({ ...f, osc_value: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-cyan-500/50" placeholder="1.0" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50" placeholder="bass, drop, kinect" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={save} className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-all">Save Preset</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-500/10 border border-gray-500/20 text-gray-400 rounded-lg text-sm hover:bg-gray-500/20 transition-all">Cancel</button>
          </div>
        </div>
      )}

      {/* Presets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map(p => (
          <SignalCard key={p.id} title={p.type.toUpperCase()} color={TYPE_COLORS[p.type] || "cyan"} className="group">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <span className="text-white font-semibold text-sm">{p.name}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleFav(p)} className={`p-1 rounded ${p.favorite ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400"}`}>
                    <Star className="w-3.5 h-3.5" fill={p.favorite ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => del(p.id)} className="p-1 rounded text-gray-600 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {p.osc_address && (
                <div className="font-mono text-xs text-gray-500 bg-[#0a0a0f] rounded px-2 py-1">
                  {p.osc_address} <span className="text-cyan-400">{p.osc_value}</span>
                </div>
              )}
              {p.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.tags.map(t => <span key={t} className="text-xs text-gray-600 border border-gray-700/50 rounded px-1.5 py-0.5">{t}</span>)}
                </div>
              )}
              <button
                onClick={() => fire(p)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 mt-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs hover:bg-cyan-500/20 transition-all"
              >
                <Zap className="w-3 h-3" /> FIRE
              </button>
            </div>
          </SignalCard>
        ))}
        {presets.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-16 text-gray-600 gap-3">
            <Sliders className="w-10 h-10" />
            <span className="text-sm">No signal presets yet. Create your first one.</span>
          </div>
        )}
      </div>
    </div>
  );
}