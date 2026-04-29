import {
  MousePointer2, Pencil, Eraser, Type, Square, Circle,
  Minus, MoveRight, Undo2, Redo2
} from 'lucide-react';

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Select (V)' },
  { id: 'pen', icon: Pencil, label: 'Pen (P)' },
  { id: 'eraser', icon: Eraser, label: 'Eraser (E)' },
  { id: 'text', icon: Type, label: 'Text (T)' },
  { id: 'rectangle', icon: Square, label: 'Rectangle (R)' },
  { id: 'circle', icon: Circle, label: 'Circle (C)' },
  { id: 'line', icon: Minus, label: 'Line (L)' },
  { id: 'arrow', icon: MoveRight, label: 'Arrow (A)' },
];

const COLORS = [
  '#0F172A', '#FFFFFF', '#E11D48', '#BE123C', '#F59E0B',
  '#FCD34D', '#10B981', '#059669', '#0EA5E9', '#0284C7',
  '#8B5CF6', '#6D28D9', '#14B8A6', '#F97316', '#64748B',
  '#A8A29E',
];

export default function Toolbar({
  tool, setTool, color, setColor, brushSize, setBrushSize,
  brushOpacity, setBrushOpacity,
  onUndo, onRedo, canUndo, canRedo, horizontal = false
}) {

  if (horizontal) {
    return (
      <div className="space-y-4 p-2">
        <div className="flex flex-wrap gap-2 justify-center">
          {TOOLS.map(t => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`p-3 rounded-xl transition-all ${
                tool === t.id
                  ? 'bg-[#D92323] text-white shadow-md'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <t.icon className="w-5 h-5" />
            </button>
          ))}
          <div className="w-px h-10 bg-white/10 mx-1" />
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-3 rounded-xl transition-all ${canUndo ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'opacity-20'}`}
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-3 rounded-xl transition-all ${canRedo ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'opacity-20'}`}
          >
            <Redo2 className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center mt-4">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full shadow-sm transition-all ${
                color === c ? 'scale-125 ring-2 ring-[#D92323] ring-offset-2 ring-offset-[#1A1A1A] border border-transparent' : 'border border-white/10 hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2 w-full mt-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 w-6">px</span>
            <input
              type="range"
              min="1"
              max="30"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="accent-[#D92323] cursor-pointer flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 w-6">%</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={brushOpacity}
              onChange={(e) => setBrushOpacity(Number(e.target.value))}
              className="accent-[#D92323] cursor-pointer flex-1"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[96px] h-full flex flex-col items-center py-6 gap-4 bg-[#1A1A1A]/90 backdrop-blur-xl border-r-[3px] border-[#8B5A2B] z-10 overflow-y-auto relative rounded-l-2xl shadow-2xl">
      {/* Golden Corner Accents (Mock) */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#D4A373] opacity-50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#D4A373] opacity-50" />
      
      {/* Tool buttons */}
      <div className="grid grid-cols-2 gap-2 w-full px-2">
        {TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            data-tooltip={t.label}
            className={`w-full aspect-square flex items-center justify-center rounded-lg transition-all relative group ${
              tool === t.id
                ? 'bg-gradient-to-br from-[#D92323] to-[#800000] text-white shadow-lg border border-[#FF4D4D]'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <t.icon className="w-5 h-5" strokeWidth={tool === t.id ? 2.5 : 2} />
            {tool === t.id && (
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-white rounded-r-full" />
            )}
            {/* Tooltip Label */}
            <div className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-[10px] font-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-[#D4A373]/30 uppercase tracking-widest">
              {t.label}
            </div>
          </button>
        ))}
      </div>

      <div className="w-10 h-[2px] bg-[#8B5A2B]/30 my-1" />

      {/* Undo / Redo */}
      <div className="grid grid-cols-2 gap-2 w-full px-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`w-full aspect-square flex items-center justify-center rounded-lg transition-all ${
            canUndo
              ? 'text-slate-400 hover:bg-white/5 hover:text-white'
              : 'opacity-20 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`w-full aspect-square flex items-center justify-center rounded-lg transition-all ${
            canRedo
              ? 'text-slate-400 hover:bg-white/5 hover:text-white'
              : 'opacity-20 cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-5 h-5" />
        </button>
      </div>



      <div className="w-10 h-[2px] bg-[#8B5A2B]/30 my-1" />

      {/* Color Swatches */}
      <div className="flex flex-col gap-2 px-2 w-full">
        <div className="grid grid-cols-2 gap-2">
          {COLORS.slice(0, 6).map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-full aspect-square rounded-sm border transition-all ${
                color === c ? 'border-white ring-2 ring-[#D92323] ring-offset-2 ring-offset-[#1A1A1A] scale-110' : 'border-white/10 hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        
        {/* Custom picker */}
        <div className="w-full flex justify-center mt-1">
          <label className="w-full aspect-square rounded-sm cursor-pointer border-2 border-white/20 hover:border-white transition-colors overflow-hidden relative shadow-inner">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
            />
          </label>
        </div>
      </div>

      <div className="w-10 h-[2px] bg-[#8B5A2B]/30 my-2" />

      {/* Brush Size & Opacity - Compact Sliders */}
      <div className="flex flex-col gap-4 w-full px-3 py-2">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-black text-slate-500 uppercase">Size</span>
          <div className="h-20 w-full flex justify-center">
            <input
              type="range"
              min="1"
              max="30"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="accent-[#D92323] cursor-pointer"
              style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
            />
          </div>
          <span className="text-[10px] font-bold text-white">{brushSize}</span>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-black text-slate-500 uppercase">Alpha</span>
          <div className="h-20 w-full flex justify-center">
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={brushOpacity}
              onChange={(e) => setBrushOpacity(Number(e.target.value))}
              className="accent-[#D92323] cursor-pointer"
              style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
            />
          </div>
          <span className="text-[10px] font-bold text-white">{(brushOpacity * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
