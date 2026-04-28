import { useMemo } from 'react';

const CURSOR_SVG = (color) => `
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 2L18 8L10 10L8 18L2 2Z" fill="${color}" stroke="white" stroke-width="1.5"/>
</svg>
`;

export default function LiveCursors({ cursors, viewOffset = { x: 0, y: 0 } }) {
  const cursorEntries = useMemo(() => Object.entries(cursors), [cursors]);

  if (cursorEntries.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {cursorEntries.map(([userId, data]) => (
        <div
          key={userId}
          className="absolute transition-all duration-75 ease-out"
          style={{
            left: data.x + viewOffset.x,
            top: data.y + viewOffset.y,
            transform: 'translate(-2px, -2px)',
          }}
        >
          {/* Cursor SVG */}
          <div
            dangerouslySetInnerHTML={{ __html: CURSOR_SVG(data.color || '#E74C3C') }}
          />
          {/* Name label */}
          <div
            className="absolute top-5 left-4 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white whitespace-nowrap shadow-sm"
            style={{ backgroundColor: data.color || '#E74C3C' }}
          >
            {data.name || 'Unknown'}
          </div>
        </div>
      ))}
    </div>
  );
}
