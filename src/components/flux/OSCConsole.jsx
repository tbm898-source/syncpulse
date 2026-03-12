import { useState } from "react";
import { Terminal, Send } from "lucide-react";

export default function OSCConsole({ resolumeHost = "localhost", resolumePort = 7000 }) {
  const [log, setLog] = useState([
    { t: "12:00:01", msg: "/composition/video/opacity → 1.0", ok: true },
    { t: "12:00:02", msg: "/layer1/video/effect/opacity → 0.8", ok: true },
    { t: "12:00:04", msg: "/kinect/depth/threshold → 0.45", ok: true },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLog(l => [...l.slice(-49), { t: now, msg: input, ok: Math.random() > 0.1 }]);
    setInput("");
  };

  return (
    <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1e1e2e] bg-[#111118]">
        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">OSC Console</span>
        <span className="ml-auto text-xs text-gray-600 font-mono">{resolumeHost}:{resolumePort}</span>
      </div>
      <div className="h-40 overflow-y-auto p-3 space-y-1 font-mono text-xs">
        {log.map((l, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-gray-600 flex-shrink-0">{l.t}</span>
            <span className={l.ok ? "text-cyan-300" : "text-red-400"}>{l.msg}</span>
          </div>
        ))}
      </div>
      <div className="flex border-t border-[#1e1e2e]">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="/osc/address value"
          className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-cyan-300 placeholder-gray-600 outline-none"
        />
        <button onClick={send} className="px-3 py-2 text-cyan-400 hover:text-cyan-300 border-l border-[#1e1e2e]">
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}