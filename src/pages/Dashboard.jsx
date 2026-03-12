import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Radio, Zap, Clock, Activity } from "lucide-react";
import SignalCard from "../components/flux/SignalCard";
import AudioVisualizer from "../components/flux/AudioVisualizer";
import PointCloudCanvas from "../components/flux/PointCloudCanvas";
import OSCConsole from "../components/flux/OSCConsole";
import PlatformBadge from "../components/flux/PlatformBadge";
import ResolumePanel from "../components/flux/ResolumePanel";

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [uptime, setUptime] = useState(0);
  const [bpm, setBpm] = useState(128);
  const [audioLevel, setAudioLevel] = useState(0.72);

  useEffect(() => {
    base44.entities.StreamSession.list("-created_date", 1).then(r => {
      if (r[0]) setSession(r[0]);
    });
  }, []);

  useEffect(() => {
    if (session?.status !== "live") return;
    const i = setInterval(() => setUptime(u => u + 1), 1000);
    return () => clearInterval(i);
  }, [session?.status]);

  // Simulate BPM drift
  useEffect(() => {
    const i = setInterval(() => {
      setBpm(b => Math.round(b + (Math.random() - 0.5) * 2));
      setAudioLevel(Math.random() * 0.4 + 0.5);
    }, 800);
    return () => clearInterval(i);
  }, []);

  const isLive = session?.status === "live";
  const formatUptime = (s) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Command Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">{session?.name || "No active session"}</p>
        </div>
        <div className="flex items-center gap-3">
          {isLive ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 font-bold text-sm tracking-widest">LIVE</span>
              <span className="text-gray-500 text-xs font-mono">{formatUptime(uptime)}</span>
            </div>
          ) : (
            <Link to={createPageUrl("GoLive")}>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all text-sm font-medium">
                <Radio className="w-4 h-4" />
                Go Live
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Active platforms */}
      {isLive && session?.platforms?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Streaming to:</span>
          {session.platforms.map(p => <PlatformBadge key={p} platform={p} live size="sm" />)}
        </div>
      )}

      {/* Signal grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SignalCard title="BPM" value={bpm} status={isLive} color="cyan">
          <div className="w-full h-1 bg-gray-800 rounded-full mt-1">
            <div className="h-1 bg-cyan-400 rounded-full transition-all" style={{ width: `${(bpm / 200) * 100}%` }} />
          </div>
        </SignalCard>

        <SignalCard title="Audio Level" value={Math.round(audioLevel * 100)} unit="%" status={isLive} color="green">
          <div className="w-full h-1 bg-gray-800 rounded-full mt-1">
            <div className="h-1 bg-green-400 rounded-full transition-all duration-100" style={{ width: `${audioLevel * 100}%` }} />
          </div>
        </SignalCard>

        <SignalCard title="Kinect" status={session?.kinect_enabled} color="purple">
          <span className="text-xs text-gray-500">{session?.kinect_enabled ? "Depth stream active" : "Sensor offline"}</span>
        </SignalCard>

        <SignalCard title="MilkDrop" status={session?.milkdrop_enabled} color="pink">
          <span className="text-xs text-gray-500">{session?.milkdrop_enabled ? "Preset rendering" : "Visualizer off"}</span>
        </SignalCard>
      </div>

      {/* Main panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Audio viz */}
        <div className="lg:col-span-1 bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">Audio / MilkDrop</span>
          </div>
          <AudioVisualizer active={isLive || session?.audio_enabled} color="#22c55e" bars={28} height={80} />
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-500">Bass <span className="text-green-400 ml-1">▮▮▮▮▮░░</span></div>
            <div className="text-gray-500">Mid <span className="text-green-400 ml-1">▮▮▮░░░░</span></div>
            <div className="text-gray-500">High <span className="text-green-400 ml-1">▮▮░░░░░</span></div>
            <div className="text-gray-500">Peak <span className="text-yellow-400 ml-1">-6.2 dB</span></div>
          </div>
        </div>

        {/* Point cloud */}
        <div className="lg:col-span-1 bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">Kinect Point Cloud</span>
          </div>
          <PointCloudCanvas active={session?.kinect_enabled} color="#a855f7" />
          <div className="mt-2 flex justify-between text-xs text-gray-600">
            <span>Depth: 0.5–4.5m</span>
            <span>Points: 512×424</span>
          </div>
        </div>

        {/* OSC Console */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <OSCConsole resolumeHost={session?.resolume_host} resolumePort={session?.resolume_port} />
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">Resolume</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Host</span>
                <span className="text-cyan-300">{session?.resolume_host || "localhost"}:{session?.resolume_port || 7000}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">OSC In</span>
                <span className="text-cyan-300">:{session?.osc_port || 8000}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Composition</span>
                <span className={isLive ? "text-green-400" : "text-gray-600"}>{isLive ? "Connected" : "Standby"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}