import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Map, Hash, Search, ArrowRight,
  Anchor, Ship, Plus, Navigation, 
  HelpCircle, User
} from 'lucide-react';

const AVATARS = [
  { id: '1', emoji: '😎', label: 'Cool' },
  { id: '2', emoji: '🦊', label: 'Fox' },
  { id: '3', emoji: '⚡', label: 'Lightning' },
  { id: '4', emoji: '⚓', label: 'Anchor' },
  { id: '5', emoji: '🌊', label: 'Wave' },
  { id: '6', emoji: '🚀', label: 'Rocket' },
];

const THEMES = [
  { id: 'white', label: 'Blank Map', preview: 'bg-white' },
  { id: 'grid', label: 'Nautical Grid', preview: 'bg-[#FDF6E3] border-dashed border border-[#D4A373]' },
];

const RANDOM_NAMES = [
  'Silent Corsair', 'Crimson Voyager', 'Ocean Drifter',
  'Grand Navigator', 'Jolly Rover', 'Storm Chaser',
  'Tidal Ghost', 'Horizon Seeker', 'Iron Captain',
  'Wave Rider', 'Starboard Sage', 'Pearl Diver'
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('1');
  const [roomCode, setRoomCode] = useState('');
  const [canvasTheme, setCanvasTheme] = useState('white');
  const [error, setError] = useState('');

  const handleRandomName = () => {
    const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setNickname(`${name} ${Math.floor(Math.random() * 1000)}`);
  };

  const handleSubmit = (actionType) => {
    setError('');
    if (!nickname.trim()) { setError('Nickname is required to sail!'); return; }
    if (nickname.trim().length > 20) { setError('Name too long (max 20 chars)'); return; }
    
    if (actionType === 'join' && !roomCode.trim()) { 
      setError('Room Code is required to join a crew!'); 
      return; 
    }

    const userData = {
      nickname: nickname.trim(),
      avatar,
      mode: actionType,
      roomCode: actionType === 'join' ? roomCode.trim().toUpperCase() : null,
      canvasTheme: actionType === 'create' ? canvasTheme : 'white',
    };
    sessionStorage.setItem('inkyaiba-user', JSON.stringify(userData));
    navigate('/board');
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-sky-200 overflow-y-auto font-body text-slate-800 flex flex-col items-center justify-center selection:bg-[#A50000] selection:text-white py-10">
      
      {/* Background Ambience Layer */}
      <div className="fixed inset-0 z-0 bg-sky-300 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-full h-[60vh] bg-gradient-to-t from-sky-500/30 to-transparent pointer-events-none z-0" />
      <div 
        className="fixed inset-0 z-0 opacity-10 pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.5) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />
      {/* Fake clouds via CSS */}
      <div className="fixed top-20 left-20 w-64 h-24 bg-white/40 blur-3xl rounded-full z-0 pointer-events-none" />
      <div className="fixed top-40 right-20 w-96 h-32 bg-white/40 blur-3xl rounded-full z-0 pointer-events-none" />

      {/* Main Single Section Container */}
      <main className="relative z-10 w-full max-w-[1200px] mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
        
        {/* Left Section: Branding & Identity */}
        <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          
          {/* Main Logo & Title */}
          <div className="flex flex-col items-center lg:items-start group cursor-default">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-[#A50000] flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-white text-xl font-black">☠</span>
              </div>
              <h1 className="font-['Permanent_Marker'] text-6xl md:text-8xl uppercase tracking-tight leading-none">
                <span className="text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">INK</span>
                <span className="text-[#A50000] drop-shadow-[4px_4px_0px_rgba(255,255,255,0.4)]">YAIBA</span>
              </h1>
            </div>
            <span className="text-sm tracking-[0.4em] font-black text-slate-800/60 uppercase ml-14 lg:ml-16">インクヤイバ</span>
          </div>

          {/* Ribbon Subtitle */}
          <div className="relative bg-[#FDF6E3] border-[3px] border-[#D4A373] px-6 py-2 shadow-[8px_8px_0px_rgba(0,0,0,0.1)] inline-block">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-[110%] bg-[#D4A373] -z-10 skew-y-12" />
            <span className="font-bold tracking-[0.1em] text-[#5C4033] text-sm md:text-base whitespace-nowrap uppercase">
              Real-Time Collaborative Whiteboard
            </span>
          </div>

          {/* Motto */}
          <p className="text-slate-800 text-lg md:text-xl font-medium max-w-lg leading-relaxed bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-inner">
            Gather your crew! Call your <span className="text-[#A50000] font-black underline decoration-[#D4A373] decoration-4 underline-offset-4">Nakama</span> and map out your next big <span className="text-[#A50000] font-black underline decoration-[#D4A373] decoration-4 underline-offset-4">adventures</span> together!
          </p>

          {/* Quick Features */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {[
              { label: 'Live Drawing', icon: <Ship className="w-4 h-4"/> },
              { label: 'Room Chat', icon: <Navigation className="w-4 h-4"/> },
              { label: 'Team Crew', icon: <Users className="w-4 h-4"/> },
              { label: 'Map Export', icon: <Map className="w-4 h-4"/> }
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#FDF6E3]/60 border border-[#D4A373]/30 rounded-lg text-[11px] font-black uppercase text-[#5C4033]">
                <span className="text-[#A50000]">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: The Portal Card */}
        <div className="w-full max-w-md shrink-0">
          <div className="bg-[#FDF6E3] p-8 md:p-10 relative rounded-sm shadow-[16px_16px_0px_rgba(0,0,0,0.2)] border-[4px] border-[#8B5A2B] transform rotate-1 hover:rotate-0 transition-transform duration-500">
            
            {/* Jolly Roger Pin */}
            <div className="absolute -top-7 -right-7 w-16 h-16 bg-black rounded-full flex items-center justify-center transform rotate-12 shadow-xl border-[4px] border-white z-20">
               <span className="text-white font-bold text-2xl animate-pulse">☠️</span>
            </div>

            <div className="text-center mb-8">
               <h2 className="font-['Permanent_Marker'] text-3xl text-black mb-1 -rotate-1 inline-block border-b-4 border-black/5 uppercase">Join The Crew</h2>
               <p className="text-[10px] font-black text-[#8B5A2B] tracking-[0.2em] uppercase">No Seas Can Bound Our Dreams</p>
            </div>

            <form className="space-y-6">
              <div className="space-y-4">
                {/* Avatar */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#5C4033] tracking-widest uppercase opacity-60">Pick Your Flag (Avatar)</label>
                  <div className="flex gap-2 justify-between bg-black/5 p-2 rounded-lg border-2 border-transparent">
                    {AVATARS.map(av => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setAvatar(av.id)}
                        className={`flex-1 aspect-square rounded text-xl flex items-center justify-center transition-all ${
                          avatar === av.id ? 'bg-[#A50000] text-white shadow-md transform scale-110' : 'hover:bg-black/5'
                        }`}
                      >
                        {av.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nickname */}
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-[#5C4033] tracking-widest uppercase opacity-60">Your Pirate Name</label>
                  <div className="relative flex items-center">
                    <button 
                      type="button"
                      onClick={handleRandomName}
                      className="absolute left-3 w-8 h-8 flex items-center justify-center bg-[#EADCB6] rounded text-[#5C4033] hover:bg-[#D4A373] hover:text-white transition-colors z-10 shadow-sm"
                    >
                      🎲
                    </button>
                    <input 
                      type="text" 
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Alias..." 
                      className="w-full pl-14 pr-10 py-4 bg-white/80 border-2 border-[#D4A373] text-black font-bold outline-none focus:border-[#A50000] focus:bg-white shadow-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Room Code */}
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-[#5C4033] tracking-widest uppercase opacity-60 flex justify-between">
                  <span>Room Charter (Code)</span>
                  <span className="normal-case opacity-50 font-medium tracking-normal text-[9px]">Optional</span>
                </label>
                <div className="relative flex items-center mb-1">
                  <div className="absolute left-4 opacity-50"><Hash className="w-5 h-5 text-black" /></div>
                  <input 
                    type="text" 
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="GRANDLINE" 
                    className="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-[#D4A373] text-black font-bold uppercase tracking-[0.3em] outline-none focus:border-[#A50000] focus:bg-white shadow-sm transition-all"
                  />
                </div>
                
                {/* Theme Selection if Create */}
                {roomCode.length === 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                     <div className="grid grid-cols-2 gap-3">
                       {THEMES.map(t => (
                         <button
                           key={t.id}
                           type="button"
                           onClick={() => setCanvasTheme(t.id)}
                           className={`relative rounded border-2 p-2 transition-all flex flex-col items-center ${canvasTheme === t.id ? 'border-[#A50000] bg-white shadow-md' : 'border-[#D4A373]/30 bg-white/50'}`}
                         >
                           <div className={`w-full h-8 rounded-sm ${t.preview} border border-black/5 mb-1`} />
                           <span className="text-[9px] font-black uppercase text-[#5C4033] opacity-60">{t.label}</span>
                         </button>
                       ))}
                     </div>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-3">
                <button 
                  type="button"
                  onClick={() => handleSubmit('join')}
                  className="w-full bg-[#A50000] py-4 text-white font-black text-xl uppercase tracking-wider rounded border-b-[6px] border-[#7A0000] shadow-lg flex items-center justify-between px-6 hover:translate-y-1 hover:border-b-2 active:border-b-0 transition-all active:translate-y-[6px]"
                >
                  <Ship className="w-7 h-7" />
                  <span>Join Crew</span>
                  <ArrowRight className="w-7 h-7" />
                </button>
                
                <button 
                  type="button"
                  onClick={() => handleSubmit('create')}
                  className="w-full py-3.5 text-[#A50000] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:underline decoration-2 underline-offset-4"
                >
                  <Plus className="w-5 h-5 stroke-[3]" /> Create New Voyage
                </button>
              </div>
            </form>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -bottom-16 left-0 right-0 bg-[#A50000] text-white text-xs font-bold p-3 rounded-lg shadow-xl text-center border-b-4 border-[#7A0000]">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Decorative Quote Overlay */}
      <div className="absolute bottom-8 text-center opacity-30 select-none pointer-events-none">
        <p className="font-['Permanent_Marker'] text-[#5C4033] text-xl tracking-wide">
          "Inherited Will, The Tide of the Times, and The Dreams of the People."
        </p>
      </div>

    </div>
  );
}
