import { useState, useRef, useEffect } from 'react';
import { Users, MessageSquare, Send, X, MoreHorizontal } from 'lucide-react';

const AVATARS = {
  '1': '😎', '2': '🦊', '3': '⚡', '4': '⚓', '5': '🌊', '6': '🚀'
};

const REACTIONS = ['👍', '🔥', '🚀', '❤️', '👀', '🎉'];

export default function RightPanel({
  tab, setTab, users, messages, isCaptain, currentUserId,
  onKick, onSendMessage, onReaction
}) {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  const [showReactionsFor, setShowReactionsFor] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    onSendMessage(messageText);
    setMessageText('');
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-80 h-full flex flex-col bg-[#1A1A1A]/95 backdrop-blur-xl z-10 font-body border-l border-[#8B5A2B]">
      {/* Tabs */}
      <div className="flex px-4 pt-2 gap-2 border-b border-[#8B5A2B]/30">
        <button
          onClick={() => setTab('crew')}
          className={`flex-1 pb-3 text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all relative ${
            tab === 'crew' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Crew Members
          {tab === 'crew' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D92323] rounded-t-full shadow-[0_0_8px_rgba(217,35,35,0.5)]" />
          )}
        </button>
        <button
          onClick={() => setTab('chat')}
          className={`flex-1 pb-3 text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all relative ${
            tab === 'chat' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Battle Chat
          {tab === 'chat' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D92323] rounded-t-full shadow-[0_0_8px_rgba(217,35,35,0.5)]" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'crew' ? (
          <div className="p-3 space-y-1">
            {users.map((user) => (
              <div
                key={user.id}
                className="group flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-lg shadow-sm border border-white/10">
                      {AVATARS[user.avatar] || '👤'}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#1A1A1A]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm truncate text-white">
                        {user.name}
                      </span>
                      {user.id === currentUserId && (
                        <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400 font-black tracking-widest">YOU</span>
                      )}
                    </div>
                    {user.isCaptain && (
                      <span className="text-[10px] text-[#D4A373] font-black uppercase tracking-wide flex items-center gap-1">
                        Workspace Captain
                      </span>
                    )}
                  </div>
                </div>

                {isCaptain && user.id !== currentUserId && (
                  <button
                    onClick={() => onKick(user.id)}
                    className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 text-slate-400 hover:bg-red-900/30 hover:text-red-500 transition-all"
                    title="Remove user"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
                  <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest">No signals yet.</p>
                  <p className="text-[10px] mt-1 opacity-60">Start the conversation, pirate!</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className="group relative">
                  <div className={`p-3 rounded-xl border border-white/5 ${
                    msg.userId === currentUserId 
                      ? 'bg-[#D92323]/10 ml-6 rounded-tr-sm border-l-[#D92323]' 
                      : 'bg-white/5 mr-6 rounded-tl-sm'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-black text-[10px] uppercase tracking-wide ${msg.userId === currentUserId ? 'text-[#D92323]' : 'text-[#D4A373]'}`}>
                        {msg.name}
                      </span>
                      <span className="text-[9px] text-white/30">{formatTime(msg.timestamp)}</span>
                    </div>
                    <p className="text-sm text-white/90 break-words leading-relaxed font-medium">
                      {msg.text}
                    </p>

                    {/* Active Reactions */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(msg.reactions).map(([emoji, names]) => (
                          <span
                            key={emoji}
                            title={names.join(', ')}
                            className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80"
                          >
                            {emoji} {names.length}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reaction Button */}
                  <div className={`absolute top-2 w-max ${msg.userId === currentUserId ? '-left-6' : '-right-6'}`}>
                    <button
                      onClick={() => setShowReactionsFor(showReactionsFor === msg.id ? null : msg.id)}
                      className="p-1 rounded-full bg-[#1A1A1A] shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 text-slate-400 hover:text-white"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </button>
                    
                    {/* Reaction popover */}
                    {showReactionsFor === msg.id && (
                      <div className="absolute top-0 mt-6 z-20 flex gap-1 p-1.5 rounded-lg shadow-2xl bg-[#1A1A1A] border border-[#D4A373]/30">
                        {REACTIONS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => { onReaction(msg.id, emoji); setShowReactionsFor(null); }}
                            className="text-base hover:scale-125 transition-transform p-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      {tab === 'chat' && (
        <form onSubmit={handleSend} className="p-4 bg-[#1A1A1A] border-t border-[#8B5A2B]/30">
          <div className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-lg bg-white/5 border border-white/10 focus-within:border-[#D4A373]/50 transition-all shadow-inner">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Broadcast to crew..."
              className="flex-1 bg-transparent text-sm text-white outline-none font-medium placeholder:text-white/20 py-2"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className={`p-2 rounded transition-all ${
                messageText.trim()
                  ? 'bg-[#D92323] text-white shadow-lg'
                  : 'text-white/10 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
