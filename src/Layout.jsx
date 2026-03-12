import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Radio, Sliders, Cpu, Tv2, LayoutDashboard, ChevronLeft, ChevronRight, Zap } from "lucide-react";

const navItems = [
  { label: "Command", page: "Dashboard", icon: LayoutDashboard },
  { label: "Signals", page: "Signals", icon: Sliders },
  { label: "Kinect", page: "Kinect", icon: Cpu },
  { label: "Platforms", page: "Platforms", icon: Tv2 },
  { label: "Go Live", page: "GoLive", icon: Radio },
];

export default function Layout({ children, currentPageName }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden" style={{fontFamily: "'Inter', sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        :root {
          --flux-cyan: #00f5ff;
          --flux-purple: #7c3aed;
          --flux-pink: #ff0080;
          --flux-dark: #0a0a0f;
          --flux-card: #111118;
          --flux-border: #1e1e2e;
        }
        .flux-glow { box-shadow: 0 0 20px rgba(0, 245, 255, 0.15); }
        .flux-glow-pink { box-shadow: 0 0 20px rgba(255, 0, 128, 0.2); }
        .nav-active { background: linear-gradient(90deg, rgba(0,245,255,0.1), transparent); border-left: 2px solid var(--flux-cyan); }
        .nav-item:hover { background: rgba(0,245,255,0.05); }
        .pulse-dot { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .scanline { background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.015) 2px, rgba(0,245,255,0.015) 4px); }
      `}</style>

      {/* Sidebar */}
      <div className={`flex flex-col border-r border-[#1e1e2e] bg-[#0d0d14] transition-all duration-300 ${collapsed ? "w-16" : "w-52"}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1e1e2e]">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && <span className="text-lg font-bold tracking-widest text-cyan-400">FLUX</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ label, page, icon: Icon }) => {
            const active = currentPageName === page;
            return (
              <Link
                key={page}
                to={createPageUrl(page)}
                className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${active ? "nav-active text-cyan-400" : "text-gray-400 hover:text-white"}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center py-4 border-t border-[#1e1e2e] text-gray-500 hover:text-cyan-400 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto scanline">
        {children}
      </div>
    </div>
  );
}