import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportPNG, exportSVG } from '../utils/exportCanvas';
import {
  Copy, Users, Share2, Download, LogOut, Lock, Unlock,
  Trash2, Check, ChevronDown
} from 'lucide-react';

const AVATARS = {
  '1': '😎', '2': '🦊', '3': '⚡', '4': '⚓', '5': '🌊', '6': '🚀'
};

export default function TopBar({
  roomCode, isCaptain, users = [], userCount, isLocked, canvasRef, strokes,
  onLeave, onClear, onToggleLock
}) {
  const [copied, setCopied] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPNG = () => { exportPNG(canvasRef, roomCode); setShowExport(false); };
  const handleExportSVG = () => {
    const canvas = canvasRef.current;
    if (canvas) exportSVG(strokes, canvas.width, canvas.height, roomCode);
    setShowExport(false);
  };

  const shareRoom = () => {
    const url = `${window.location.origin}/join?action=join&code=${roomCode}`;
    if (navigator.share) {
      navigator.share({ title: 'Workspace Invite', text: `Join workspace: ${roomCode}`, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Invite link copied to clipboard!');
    }
  };

  return (
    <div className="h-16 flex items-center justify-between px-6 shrink-0 z-20 bg-[#FDF6E3]/80 backdrop-blur-md border-b-[3px] border-[#D4A373] shadow-sm relative">
      {/* Decorative Deckle Edge */}
      <div className="absolute -bottom-[3px] left-0 w-full h-1 bg-repeat-x opacity-40 mix-blend-multiply pointer-events-none" style={{ backgroundImage: "linear-gradient(135deg, transparent 50%, #D4A373 50%), linear-gradient(45deg, #D4A373 50%, transparent 50%)", backgroundSize: "6px 4px" }} />

      {/* Left: Logo + Room Info */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate && navigate('/')}>
          <div className="w-10 h-10 rounded-full bg-[#A50000] flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform border-2 border-white/20">
            <span className="text-white text-base font-black">☠</span>
          </div>
          <div className="flex flex-col">
            <span className="font-['Permanent_Marker'] font-bold text-2xl tracking-tight leading-none mb-0.5 uppercase">
              <span className="text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">INK</span>
              <span className="text-[#A50000] drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)]">YAIBA</span>
            </span>
            <span className="text-[9px] font-black text-[#5C4033]/60 tracking-[0.3em] uppercase leading-none">
              The Grand Line Room
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#D4A373] hidden md:block" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/50 border-2 border-[#D4A373] shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm" />
            <span className="font-mono font-black text-sm tracking-widest text-slate-800 uppercase">{roomCode}</span>
            <button
              onClick={copyCode}
              className="p-1 rounded bg-[#EADCB6] transition-colors text-[#5C4033] hover:bg-[#D4A373] hover:text-white"
              title="Copy Room Charter"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="flex -space-x-2">
               {users.slice(0, 4).map((u, i) => (
                 <div
                   key={u.id}
                   data-tooltip={u.name}
                   className="w-8 h-8 rounded-full bg-white border-2 border-[#D4A373] flex items-center justify-center text-sm shadow-sm relative"
                   style={{ zIndex: 10 - i }}
                 >
                   {AVATARS[u.avatar] || '😎'}
                   {u.isCaptain && (
                     <div className="absolute -bottom-1.5 -right-1.5 text-[10px] bg-white border border-[#D4A373] rounded-full w-4 h-4 flex items-center justify-center shadow-sm">👑</div>
                   )}
                 </div>
               ))}
               {users.length > 4 && (
                 <div className="w-8 h-8 rounded-full bg-[#EADCB6] border-2 border-[#D4A373] flex items-center justify-center text-xs font-black text-[#5C4033] shadow-sm relative" style={{ zIndex: 0 }}>
                   +{users.length - 4}
                 </div>
               )}
            </div>
            <span className="text-[#5C4033] text-xs font-black border-l-2 border-[#D4A373] pl-2 ml-1 tracking-wide">
              {userCount} PIRATES
            </span>
          </div>

          {isCaptain && (
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#A50000] bg-[#A50000]/10 text-[#A50000] text-[10px] font-black tracking-widest uppercase">
              CAPTAIN
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={shareRoom}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-black tracking-wide rounded border-2 border-[#D4A373] bg-transparent text-[#5C4033] hover:bg-[#EADCB6] transition-colors"
        >
          <Share2 className="w-4 h-4" />
          INVITE
        </button>

        {isCaptain && (
          <div className="flex items-center gap-1 ml-1 pl-3 border-l-2 border-[#D4A373]">
            <button
              onClick={onToggleLock}
              data-tooltip={isLocked ? 'Unlock Workspace' : 'Lock Workspace'}
              className={`p-1.5 rounded-md border-2 border-transparent transition-colors ${
                isLocked
                  ? 'bg-amber-100 text-amber-600 border-amber-300'
                  : 'text-[#5C4033] border-[#5C4033]/20 hover:bg-[#EADCB6]'
              }`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
            <button
              onClick={onClear}
              data-tooltip="Clean Deck (Clear Board)"
              className="p-1.5 rounded-md text-[#5C4033] border-2 border-[#5C4033]/20 hover:bg-[#A50000] hover:text-white hover:border-[#A50000] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Export */}
        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="p-2 rounded-md text-[#5C4033] border-2 border-[#5C4033]/20 hover:bg-[#EADCB6] transition-colors flex items-center gap-1 ml-1"
            title="Export Map"
          >
            <Download className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </button>
          {showExport && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowExport(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 rounded-md shadow-lg border-[3px] border-[#D4A373] bg-[#FDF6E3] overflow-hidden min-w-[140px]">
                <button onClick={handleExportPNG} className="w-full px-4 py-2.5 text-left text-xs font-black tracking-wide text-[#5C4033] hover:bg-[#D4A373] hover:text-white transition-colors border-b-2 border-[#D4A373]/50">
                   EXPORT AS PNG
                </button>
                <button onClick={handleExportSVG} className="w-full px-4 py-2.5 text-left text-xs font-black tracking-wide text-[#5C4033] hover:bg-[#D4A373] hover:text-white transition-colors">
                   EXPORT AS SVG
                </button>
              </div>
            </>
          )}
        </div>

        {/* Leave Room Button */}
        <button
          onClick={onLeave}
          className="ml-2 px-4 py-2 bg-[#D92323] text-white text-xs font-black uppercase tracking-widest rounded-sm border-b-[4px] border-[#7A0000] shadow-md flex items-center gap-2 hover:translate-y-0.5 hover:border-b-2 active:border-b-0 active:translate-y-1 transition-all"
        >
           <LogOut className="w-4 h-4" />
           LEAVE ROOM
        </button>
      </div>
    </div>
  );
}
