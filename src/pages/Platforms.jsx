import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tv2, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import PlatformBadge from "../components/flux/PlatformBadge";

const PLATFORMS = [
  { id: "twitch", label: "Twitch", rtmp: "rtmp://live.twitch.tv/live/" },
  { id: "tiktok", label: "TikTok", rtmp: "rtmp://push.tiktokv.com/live/" },
  { id: "youtube", label: "YouTube", rtmp: "rtmp://a.rtmp.youtube.com/live2/" },
  { id: "kick", label: "Kick", rtmp: "rtmp://fa723fc1b171.global-contribute.live-video.net/app/" },
  { id: "x", label: "X (Twitter)", rtmp: "rtmps://ingest.pscp.tv:443/x/" },
];

export default function Platforms() {
  const [configs, setConfigs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ platform: "twitch", stream_key: "", rtmp_url: "", enabled: true });
  const [showKey, setShowKey] = useState({});

  const load = () => base44.entities.PlatformConfig.list().then(setConfigs);
  useEffect(() => { load(); }, []);

  const save = async () => {
    const p = PLATFORMS.find(x => x.id === form.platform);
    await base44.entities.PlatformConfig.create({
      ...form,
      rtmp_url: form.rtmp_url || p?.rtmp || "",
    });
    setForm({ platform: "twitch", stream_key: "", rtmp_url: "", enabled: true });
    setShowForm(false);
    load();
  };

  const del = async (id) => { await base44.entities.PlatformConfig.delete(id); load(); };
  const toggle = async (c) => { await base44.entities.PlatformConfig.update(c.id, { enabled: !c.enabled }); load(); };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Stream Platforms</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure RTMP destinations for Twitch, TikTok, YouTube & more</p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all text-sm">
          <Plus className="w-4 h-4" /> Add Platform
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#111118] border border-cyan-500/20 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-widest">New Platform</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Platform</label>
              <select value={form.platform} onChange={e => {
                const p = PLATFORMS.find(x => x.id === e.target.value);
                setForm(f => ({ ...f, platform: e.target.value, rtmp_url: p?.rtmp || "" }));
              }}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50">
                {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Stream Key</label>
              <input type="password" value={form.stream_key} onChange={e => setForm(f => ({ ...f, stream_key: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-cyan-500/50" placeholder="••••••••••••" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">RTMP URL</label>
              <input value={form.rtmp_url} onChange={e => setForm(f => ({ ...f, rtmp_url: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-cyan-500/50" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={save} className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-all">Save</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-500/10 border border-gray-500/20 text-gray-400 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Platform cards */}
      <div className="space-y-3">
        {configs.map(c => (
          <div key={c.id} className={`flex items-center gap-4 p-4 bg-[#111118] border rounded-xl transition-all ${c.enabled ? "border-[#1e1e2e]" : "border-[#1a1a1a] opacity-50"}`}>
            <PlatformBadge platform={c.platform} size="md" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 font-mono truncate">{c.rtmp_url}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-600">Stream key:</span>
                <span className="text-xs font-mono text-gray-400">
                  {showKey[c.id] ? c.stream_key : "••••••••••••••••"}
                </span>
                <button onClick={() => setShowKey(s => ({ ...s, [c.id]: !s[c.id] }))} className="text-gray-600 hover:text-gray-400">
                  {showKey[c.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggle(c)}
                className={`px-3 py-1 rounded text-xs border transition-all ${c.enabled ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-gray-700 text-gray-600"}`}>
                {c.enabled ? "Enabled" : "Disabled"}
              </button>
              <button onClick={() => del(c.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {configs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-600 gap-3">
            <Tv2 className="w-10 h-10" />
            <span className="text-sm">No platforms configured yet.</span>
          </div>
        )}
      </div>
    </div>
  );
}