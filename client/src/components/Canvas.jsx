import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

const Canvas = forwardRef(function Canvas({
  tool,
  color,
  brushSize,
  brushOpacity,
  theme,
  strokes,
  canDraw,
  onStrokeComplete,
  onDrawActive,
  onCursorMove,
  socket,
}, ref) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [startPos, setStartPos] = useState(null);
  const [currentPos, setCurrentPos] = useState(null);
  const [textInput, setTextInput] = useState(null);
  const lastCursorEmit = useRef(0);

  // Expose canvas ref to parent
  useImperativeHandle(ref, () => canvasRef.current);

  // Resize handler
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!container || !canvas || !overlay) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      overlay.width = rect.width * dpr;
      overlay.height = rect.height * dpr;
      overlay.style.width = rect.width + 'px';
      overlay.style.height = rect.height + 'px';
      redrawCanvas();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    return () => observer.disconnect();
  }, [strokes, theme]);

  // Redraw all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);



    // Draw strokes
    for (const stroke of strokes) {
      drawStroke(ctx, stroke);
    }
  }, [strokes, theme]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Live drawing from remote users
  useEffect(() => {
    if (!socket) return;

    const handleRemoteDrawActive = (data) => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      const ctx = overlay.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      if (data.points && data.points.length > 1) {
        ctx.strokeStyle = data.color || '#000';
        ctx.globalAlpha = data.opacity !== undefined ? data.opacity : 1;
        ctx.lineWidth = data.size || 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(data.points[0].x, data.points[0].y);
        for (let i = 1; i < data.points.length; i++) {
          const p0 = data.points[i - 1];
          const p1 = data.points[i];
          const mx = (p0.x + p1.x) / 2;
          const my = (p0.y + p1.y) / 2;
          ctx.quadraticCurveTo(p0.x, p0.y, mx, my);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    };

    socket.on('draw-active', handleRemoteDrawActive);
    return () => socket.off('draw-active', handleRemoteDrawActive);
  }, [socket]);

  function drawStroke(ctx, stroke) {
    if (!stroke) return;

    ctx.save();
    ctx.globalAlpha = stroke.opacity !== undefined ? stroke.opacity : 1;

    if (stroke.tool === 'pen' || stroke.tool === 'eraser') {
      const points = stroke.points;
      if (!points || points.length < 2) {
        if (points && points.length === 1) {
          ctx.fillStyle = stroke.tool === 'eraser' ? 'rgba(0,0,0,1)' : (stroke.color || '#000');
          ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
          ctx.beginPath();
          ctx.arc(points[0].x, points[0].y, (stroke.size || 3) / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return;
      }

      ctx.strokeStyle = stroke.tool === 'eraser'
        ? 'rgba(0,0,0,1)'
        : (stroke.color || '#000');
      ctx.lineWidth = stroke.size || 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const mx = (p0.x + p1.x) / 2;
        const my = (p0.y + p1.y) / 2;
        ctx.quadraticCurveTo(p0.x, p0.y, mx, my);
      }
      ctx.stroke();
    } else if (stroke.tool === 'rectangle') {
      ctx.strokeStyle = stroke.color || '#000';
      ctx.lineWidth = stroke.size || 3;
      ctx.lineCap = 'round';
      const x = Math.min(stroke.startX, stroke.endX);
      const y = Math.min(stroke.startY, stroke.endY);
      const w = Math.abs(stroke.endX - stroke.startX);
      const h = Math.abs(stroke.endY - stroke.startY);
      ctx.strokeRect(x, y, w, h);
    } else if (stroke.tool === 'circle') {
      ctx.strokeStyle = stroke.color || '#000';
      ctx.lineWidth = stroke.size || 3;
      const cx = (stroke.startX + stroke.endX) / 2;
      const cy = (stroke.startY + stroke.endY) / 2;
      const rx = Math.abs(stroke.endX - stroke.startX) / 2;
      const ry = Math.abs(stroke.endY - stroke.startY) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (stroke.tool === 'line') {
      ctx.strokeStyle = stroke.color || '#000';
      ctx.lineWidth = stroke.size || 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.startX, stroke.startY);
      ctx.lineTo(stroke.endX, stroke.endY);
      ctx.stroke();
    } else if (stroke.tool === 'arrow') {
      ctx.strokeStyle = stroke.color || '#000';
      ctx.fillStyle = stroke.color || '#000';
      ctx.lineWidth = stroke.size || 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.startX, stroke.startY);
      ctx.lineTo(stroke.endX, stroke.endY);
      ctx.stroke();
      // Arrowhead
      const angle = Math.atan2(stroke.endY - stroke.startY, stroke.endX - stroke.startX);
      const headLen = 15;
      ctx.beginPath();
      ctx.moveTo(stroke.endX, stroke.endY);
      ctx.lineTo(
        stroke.endX - headLen * Math.cos(angle - Math.PI / 6),
        stroke.endY - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        stroke.endX - headLen * Math.cos(angle + Math.PI / 6),
        stroke.endY - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    } else if (stroke.tool === 'text') {
      ctx.fillStyle = stroke.color || '#000';
      ctx.font = `${stroke.fontSize || 16}px Inter, sans-serif`;
      ctx.fillText(stroke.text || '', stroke.x, stroke.y);
    }

    ctx.restore();
  }

  // Get position from event
  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Mouse/Touch handlers
  const handleStart = (e) => {
    if (!canDraw) return;
    e.preventDefault();
    const pos = getPos(e);

    if (tool === 'text') {
      setTextInput({ x: pos.x, y: pos.y });
      return;
    }

    setIsDrawing(true);

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentPoints([pos]);
    } else {
      setStartPos(pos);
      setCurrentPos(pos);
    }
  };

  const handleMove = (e) => {
    const pos = getPos(e);

    // Emit cursor position (throttled)
    const now = Date.now();
    if (now - lastCursorEmit.current > 50) {
      onCursorMove(pos.x, pos.y);
      lastCursorEmit.current = now;
    }

    if (!isDrawing || !canDraw) return;
    e.preventDefault();

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentPoints(prev => [...prev, pos]);

      // Draw live preview on overlay
      const overlay = overlayRef.current;
      if (overlay) {
        const ctx = overlay.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, overlay.width, overlay.height);

        const pts = [...currentPoints, pos];
        if (pts.length > 1) {
          ctx.strokeStyle = tool === 'eraser'
            ? 'rgba(156, 163, 175, 0.5)'
            : color;
          ctx.globalAlpha = brushOpacity;
          ctx.lineWidth = brushSize;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            const p0 = pts[i - 1];
            const p1 = pts[i];
            ctx.quadraticCurveTo(p0.x, p0.y, (p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // Throttled broadcast
      if (now - lastCursorEmit.current > 30) {
        onDrawActive({
          points: [...currentPoints, pos],
          color: tool === 'eraser' ? '#000000' : color,
          size: brushSize,
          opacity: tool === 'eraser' ? 1 : brushOpacity,
          tool,
        });
      }
    } else {
      setCurrentPos(pos);

      // Draw shape preview on overlay
      const overlay = overlayRef.current;
      if (overlay && startPos) {
        const ctx = overlay.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, overlay.width, overlay.height);

        ctx.strokeStyle = color;
        ctx.globalAlpha = brushOpacity;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';

        if (tool === 'rectangle') {
          const x = Math.min(startPos.x, pos.x);
          const y = Math.min(startPos.y, pos.y);
          ctx.strokeRect(x, y, Math.abs(pos.x - startPos.x), Math.abs(pos.y - startPos.y));
        } else if (tool === 'circle') {
          const cx = (startPos.x + pos.x) / 2;
          const cy = (startPos.y + pos.y) / 2;
          const rx = Math.abs(pos.x - startPos.x) / 2;
          const ry = Math.abs(pos.y - startPos.y) / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (tool === 'line') {
          ctx.beginPath();
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        } else if (tool === 'arrow') {
          ctx.beginPath();
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
          const angle = Math.atan2(pos.y - startPos.y, pos.x - startPos.x);
          const headLen = 15;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          ctx.lineTo(pos.x - headLen * Math.cos(angle - Math.PI / 6), pos.y - headLen * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(pos.x - headLen * Math.cos(angle + Math.PI / 6), pos.y - headLen * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }
  };

  const handleEnd = (e) => {
    if (!isDrawing || !canDraw) return;
    setIsDrawing(false);

    // Clear overlay
    const overlay = overlayRef.current;
    if (overlay) {
      const ctx = overlay.getContext('2d');
      ctx.clearRect(0, 0, overlay.width, overlay.height);
    }

    if (tool === 'pen' || tool === 'eraser') {
      if (currentPoints.length > 0) {
        onStrokeComplete({
          tool,
          points: currentPoints,
          color: tool === 'eraser' ? '#000000' : color,
          size: brushSize,
          opacity: tool === 'eraser' ? 1 : brushOpacity,
        });
      }
      setCurrentPoints([]);
    } else if (startPos && currentPos) {
      onStrokeComplete({
        tool,
        startX: startPos.x,
        startY: startPos.y,
        endX: currentPos.x,
        endY: currentPos.y,
        color,
        size: brushSize,
        opacity: brushOpacity,
      });
      setStartPos(null);
      setCurrentPos(null);
    }
  };

  const handleTextSubmit = (text) => {
    if (!text.trim() || !textInput) return;
    onStrokeComplete({
      tool: 'text',
      x: textInput.x,
      y: textInput.y,
      text: text.trim(),
      color,
      fontSize: brushSize * 6,
      opacity: brushOpacity,
    });
    setTextInput(null);
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden bg-white ${theme === 'grid' ? 'canvas-grid' : ''}`}
      style={{ cursor: tool === 'text' ? 'text' : tool === 'eraser' ? 'cell' : 'crosshair' }}
    >
      {/* Main canvas (renders committed strokes) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />

      {/* Overlay canvas (live preview) */}
      <canvas
        ref={overlayRef}
        className="absolute inset-0"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        style={{ touchAction: 'none' }}
      />

      {/* Text input popup */}
      {textInput && (
        <div
          className="absolute z-20"
          style={{ left: textInput.x, top: textInput.y }}
        >
          <input
            type="text"
            autoFocus
            placeholder="Type text..."
            className="px-2 py-1 border-2 border-ocean-500 rounded text-sm bg-white text-gray-900 outline-none min-w-[120px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTextSubmit(e.target.value);
              }
              if (e.key === 'Escape') {
                setTextInput(null);
              }
            }}
            onBlur={(e) => handleTextSubmit(e.target.value)}
          />
        </div>
      )}

      {/* Locked indicator */}
      {!canDraw && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/60 text-white px-6 py-3 rounded-xl font-semibold text-sm backdrop-blur-sm">
            🔒 Drawing is locked by the Captain
          </div>
        </div>
      )}
    </div>
  );
});

export default Canvas;
