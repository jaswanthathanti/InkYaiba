import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Hash, Palette, Dices, HelpCircle, Anchor, Ship, Plus, ArrowRight } from 'lucide-react';

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

export default function JoinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultAction = searchParams.get('action') || 'create';

  const [mode, setMode] = useState(defaultAction);
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('1');
  const [roomCode, setRoomCode] = useState(searchParams.get('code') || '');
  const [canvasTheme, setCanvasTheme] = useState('white');
  const [error, setError] = useState('');

  const handleRandomName = () => {
    const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setNickname(`${name} ${Math.floor(Math.random() * 1000)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!nickname.trim()) { setError('Nickname is required to sail!'); return; }
    if (nickname.trim().length > 20) { setError('Name too long (max 20 chars)'); return; }
    if (mode === 'join' && !roomCode.trim()) { setError('Room Code is required to join a crew!'); return; }

    const userData = {
      nickname: nickname.trim(),
      avatar,
      mode,
      roomCode: mode === 'join' ? roomCode.trim().toUpperCase() : null,
      canvasTheme: mode === 'create' ? canvasTheme : 'white',
    };
    sessionStorage.setItem('inkyaiba-user', JSON.stringify(userData));
    navigate('/board');
  };

  return (
    <div className="relative min-h-screen bg-sky-200 overflow-x-hidden font-body text-slate-800 flex flex-col selection:bg-[#A50000] selection:text-white">
      
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

      {/* Navigation Header */}
      <header className="relative z-50 w-full bg-[#FDF6E3] border-b-4 border-[#D4A373] shadow-md px-6 lg:px-12 py-3 flex items-center justify-between">
        <div className="flex flex-col items-center cursor-pointer group" onClick={() => navigate('/')}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#A50000] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
              <span className="text-white text-sm font-black">☠</span>
            </div>
            <span className="font-['Permanent_Marker'] pt-1 text-3xl tracking-tight">
              <span className="text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">INK</span>
              <span className="text-[#A50000]">YAIBA</span>
            </span>
          </div>
          <span className="text-[10px] tracking-[0.3em] font-black text-slate-800 -mt-1 ml-8">インクヤイバ</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="hidden sm:flex items-center gap-2 bg-[#EADCB6] border-2 border-[#D4A373] px-4 py-2 rounded-full text-[#5C4033] font-bold text-sm hover:bg-[#D4A373] hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> BACK TO PORT
          </button>
          <button className="w-10 h-10 rounded-full bg-[#EADCB6] border-2 border-[#D4A373] flex items-center justify-center text-[#5C4033] font-bold shadow-sm hover:bg-[#D4A373] hover:text-white transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 pb-20">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Form Card */}
          <div className="bg-[#FDF6E3] p-8 md:p-10 relative rounded-sm shadow-[12px_12px_0px_rgba(0,0,0,0.3)] border-[3px] border-[#8B5A2B] transform rotate-1">
            
            <div className="absolute -top-6 -right-6 w-14 h-14 bg-black rounded-full flex items-center justify-center transform rotate-12 shadow-lg border-[3px] border-white">
               <span className="text-white font-bold text-lg">☠️</span>
            </div>

            <div className="text-center mb-8">
               <h2 className="font-['Permanent_Marker'] text-3xl text-black mb-2 -rotate-2 inline-block border-b-4 border-black/10 uppercase">
                 {mode === 'create' ? 'Launch New Map' : 'Join Existing Crew'}
               </h2>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-black/5 p-1 rounded-lg mb-8 border-2 border-transparent">
              <button
                onClick={() => { setMode('create'); setError(''); }}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded transition-all ${
                  mode === 'create' ? 'bg-[#A50000] text-white shadow-md' : 'text-[#5C4033] hover:bg-black/10'
                }`}
              >
                Create
              </button>
              <button
                onClick={() => { setMode('join'); setError(''); }}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded transition-all ${
                  mode === 'join' ? 'bg-[#A50000] text-white shadow-md' : 'text-[#5C4033] hover:bg-black/10'
                }`}
              >
                Join
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Display Name */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#5C4033] tracking-widest uppercase">PIRATE ALIAS (NICKNAME)</label>
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
                    placeholder="Enter your name..."
                    autoFocus
                    className="w-full pl-14 pr-4 py-3.5 bg-white/80 border-2 border-[#D4A373] text-black font-bold outline-none focus:border-[#A50000] focus:bg-white shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Avatar Badge */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#5C4033] tracking-widest uppercase">CHOOSE YOUR AVATAR</label>
                <div className="flex gap-2 justify-between bg-black/5 p-2 rounded-lg">
                  {AVATARS.map(av => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatar(av.id)}
                      className={`flex-1 aspect-square rounded-md text-xl flex items-center justify-center transition-all ${
                        avatar === av.id
                          ? 'bg-[#A50000] text-white shadow-md transform scale-110'
                          : 'hover:bg-black/10'
                      }`}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                {/* Room Code */}
                {mode === 'join' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 pt-2"
                  >
                    <label className="text-xs font-black text-[#5C4033] tracking-widest uppercase flex justify-between">
                      <span>ROOM CODE</span>
                      <Hash className="w-4 h-4" />
                    </label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="e.g. GRANDLINE"
                      className="w-full px-4 py-3.5 bg-white/80 border-2 border-[#D4A373] text-black font-bold uppercase tracking-widest outline-none focus:border-[#A50000] focus:bg-white shadow-sm transition-all text-center"
                    />
                  </motion.div>
                )}

                {/* Canvas Theme */}
                {mode === 'create' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 pt-2"
                  >
                    <label className="text-xs font-black text-[#5C4033] tracking-widest uppercase flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5" /> MAP STYLE
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {THEMES.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setCanvasTheme(t.id)}
                          className={`relative rounded border-2 p-2 transition-all flex flex-col items-center ${
                            canvasTheme === t.id ? 'border-[#A50000] bg-white shadow-md' : 'border-[#D4A373]/50 bg-white/50 hover:bg-white'
                          }`}
                        >
                          <div className={`w-full h-8 rounded-sm ${t.preview} border border-black/10 mb-2`} />
                          <span className="text-[10px] font-black uppercase text-[#5C4033]">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[#A50000] text-sm font-bold bg-red-100 p-2 rounded text-center border border-red-200"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-[#A50000] py-4 text-white font-black text-xl uppercase tracking-wider rounded-md border-b-[6px] border-[rgba(0,0,0,0.4)] shadow-lg flex items-center justify-between px-6 hover:translate-y-1 hover:border-b-2 active:border-b-0 transition-all active:translate-y-[6px]"
              >
                {mode === 'create' ? <Plus className="w-6 h-6" /> : <Ship className="w-6 h-6" />}
                <span>{mode === 'create' ? 'SET SAIL' : 'JOIN CREW'}</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      {/* Footer edge decoration */}
      <div className="w-full h-8 bg-repeat-x opacity-20 pointer-events-none mt-auto" style={{ backgroundImage: "linear-gradient(135deg, transparent 50%, #D4A373 50%), linear-gradient(45deg, #D4A373 50%, transparent 50%)", backgroundSize: "20px 10px" }} />
    </div>
  );
}
