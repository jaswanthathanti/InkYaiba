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
  viewOffset = { x: 0, y: 0 },
  onViewOffsetChange,
  scale = 1,
  onScaleChange,
}, ref) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const viewportRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [remoteActiveStrokes, setRemoteActiveStrokes] = useState({});
  const panOffset = useRef({ x: viewOffset.x, y: viewOffset.y });
  const lastPanPos = useRef(null);
  const lastTouchDist = useRef(null);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [startPos, setStartPos] = useState(null);
  const [currentPos, setCurrentPos] = useState(null);
  const [textInput, setTextInput] = useState(null);
  const lastCursorEmit = useRef(0);

  // Expose canvas ref to parent
  useImperativeHandle(ref, () => canvasRef.current);

  // Reset state on tool change to prevent glitches
  useEffect(() => {
    setIsDrawing(false);
    setIsPanning(false);
    setCurrentPoints([]);
    setStartPos(null);
    setCurrentPos(null);
    setTextInput(null);
    lastPanPos.current = null;
  }, [tool]);

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

    // Set initial CSS offset
    if (viewportRef.current) {
      viewportRef.current.style.setProperty('--pan-x', `${viewOffset.x}px`);
      viewportRef.current.style.setProperty('--pan-y', `${viewOffset.y}px`);
    }

    return () => observer.disconnect();
  }, [strokes, theme]);

  // Sync prop changes (e.g. from Undo/Redo that might affect view?)
  useEffect(() => {
    panOffset.current = { x: viewOffset.x, y: viewOffset.y };
    if (viewportRef.current) {
      viewportRef.current.style.setProperty('--pan-x', `${viewOffset.x}px`);
      viewportRef.current.style.setProperty('--pan-y', `${viewOffset.y}px`);
    }
  }, [viewOffset.x, viewOffset.y]);

  // Redraw all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    
    // Apply panning & scaling
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(panOffset.current.x, panOffset.current.y);

    // Draw grid/background pattern if needed
    if (theme === 'grid') {
       drawGrid(ctx, canvas.width / dpr, canvas.height / dpr);
    }

    // Draw strokes
    for (const stroke of strokes) {
      drawStroke(ctx, stroke);
    }
    ctx.restore();
  }, [strokes, theme, scale]);

  function drawGrid(ctx, w, h) {
    const size = 40;
    const offsetX = panOffset.current.x % size;
    const offsetY = panOffset.current.y % size;
    
    ctx.strokeStyle = 'rgba(212, 163, 115, 0.2)';
    ctx.lineWidth = 0.5;
    
    for (let x = offsetX - size; x < w / scale + size; x += size) {
      ctx.beginPath(); ctx.moveTo(x, -panOffset.current.y); ctx.lineTo(x, (h / scale) - panOffset.current.y); ctx.stroke();
    }
    for (let y = offsetY - size; y < h / scale + size; y += size) {
      ctx.beginPath(); ctx.moveTo(-panOffset.current.x, y); ctx.lineTo((w / scale) - panOffset.current.x, y); ctx.stroke();
    }
  }

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Live drawing from remote users
  useEffect(() => {
    if (!socket) return;

    const handleRemoteDrawActive = (data) => {
      setRemoteActiveStrokes(prev => ({
        ...prev,
        [data.userId]: data
      }));
    };

    const handleRemoteStrokeDrawn = () => {
      // When any stroke is committed, we can clear the remote active state for that user
      // Or we can rely on a timer/event. 
      // For now, let's keep it simple: the next draw-active or the final stroke-drawn will sync it.
    };

    socket.on('draw-active', handleRemoteDrawActive);
    return () => {
      socket.off('draw-active', handleRemoteDrawActive);
    };
  }, [socket]);

  // Handle clearing remote active stroke when it's committed to the main list
  useEffect(() => {
     // If the length of strokes changes, some remote stroke might have finished.
     // However, we don't know which user. 
     // A better way is to listen for 'stroke-drawn' and clear that specific user.
     if (!socket) return;
     const onStrokeDrawn = (stroke) => {
        setRemoteActiveStrokes(prev => {
          const next = { ...prev };
          delete next[stroke.userId];
          return next;
        });
     };
     socket.on('stroke-drawn', onStrokeDrawn);
     return () => socket.off('stroke-drawn', onStrokeDrawn);
  }, [socket]);

  // Separate effect for overlay rendering to handle both local and remote active strokes
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const renderOverlay = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, overlay.width / dpr, overlay.height / dpr);
      
      ctx.save();
      ctx.scale(scale, scale);
      ctx.translate(panOffset.current.x, panOffset.current.y);

      // 1. Draw Remote Active Strokes
      Object.values(remoteActiveStrokes).forEach(data => {
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
            ctx.quadraticCurveTo(p0.x, p0.y, (p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
          }
          ctx.stroke();
        }
      });

      // 2. Draw Local Active Stroke
      if (isDrawing) {
        ctx.strokeStyle = tool === 'eraser' ? 'rgba(156, 163, 175, 0.5)' : color;
        ctx.globalAlpha = brushOpacity;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (tool === 'pen' || tool === 'eraser') {
          if (currentPoints.length > 1) {
            ctx.beginPath();
            ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
            for (let i = 1; i < currentPoints.length; i++) {
              const p0 = currentPoints[i - 1];
              const p1 = currentPoints[i];
              ctx.quadraticCurveTo(p0.x, p0.y, (p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
            }
            ctx.stroke();
          }
        } else if (startPos && currentPos) {
           // Draw shape previews...
           if (tool === 'rectangle') {
            ctx.strokeRect(Math.min(startPos.x, currentPos.x), Math.min(startPos.y, currentPos.y), Math.abs(currentPos.x - startPos.x), Math.abs(currentPos.y - startPos.y));
          } else if (tool === 'circle') {
            const cx = (startPos.x + currentPos.x) / 2;
            const cy = (startPos.y + currentPos.y) / 2;
            const rx = Math.abs(currentPos.x - startPos.x) / 2;
            const ry = Math.abs(currentPos.y - startPos.y) / 2;
            ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
          } else if (tool === 'line') {
            ctx.beginPath(); ctx.moveTo(startPos.x, startPos.y); ctx.lineTo(currentPos.x, currentPos.y); ctx.stroke();
          } else if (tool === 'arrow') {
            const angle = Math.atan2(currentPos.y - startPos.y, currentPos.x - startPos.x);
            const headLen = 15;
            ctx.beginPath(); ctx.moveTo(startPos.x, startPos.y); ctx.lineTo(currentPos.x, currentPos.y); ctx.stroke();
            ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(currentPos.x, currentPos.y);
            ctx.lineTo(currentPos.x - headLen * Math.cos(angle - Math.PI / 6), currentPos.y - headLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(currentPos.x - headLen * Math.cos(angle + Math.PI / 6), currentPos.y - headLen * Math.sin(angle + Math.PI / 6));
            ctx.closePath(); ctx.fill();
          }
        }
      }

      ctx.restore();
    };

    renderOverlay();
  }, [remoteActiveStrokes, isDrawing, currentPoints, currentPos, startPos, tool, color, brushSize, brushOpacity, scale, theme]);

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
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: ((clientX - rect.left) / scale) - panOffset.current.x,
      y: ((clientY - rect.top) / scale) - panOffset.current.y,
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

    if (e.touches && e.touches.length === 2 && onScaleChange) {
      setIsPanning(false);
      setIsDrawing(false);
      setIsZooming(true);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDist.current = dist;
      return;
    }

    if (tool === 'pan') {
      setIsPanning(true);
      lastPanPos.current = { x: e.touches ? e.touches[0].clientX : e.clientX, y: e.touches ? e.touches[0].clientY : e.clientY };
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

    if (isZooming && e.touches && e.touches.length === 2 && onScaleChange) {
       // ... existing zoom logic ...
       onScaleChange(prev => Math.min(Math.max(prev * delta, 0.5), 5));
       lastTouchDist.current = dist;
       redrawCanvas();
       return;
    }

    if (isPanning) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = (clientX - lastPanPos.current.x) / scale;
      const dy = (clientY - lastPanPos.current.y) / scale;
      
      panOffset.current.x += dx;
      panOffset.current.y += dy;
      
      lastPanPos.current = { x: clientX, y: clientY };
      redrawCanvas(); // Immediate redraw for smoothness
      return;
    }

    if (!isDrawing || !canDraw) return;
    e.preventDefault();

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentPoints(prev => [...prev, pos]);

      const now = Date.now();
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
    }
  };

  const handleEnd = (e) => {
    if (isPanning && onViewOffsetChange) {
      onViewOffsetChange({ x: panOffset.current.x, y: panOffset.current.y });
    }

    // Capture final position before finishing
    const pos = getPos(e);
    if (isDrawing && tool !== 'pen' && tool !== 'eraser') {
      setCurrentPos(pos);
    }

    setIsDrawing(false);
    setIsPanning(false);
    setIsZooming(false);
    lastPanPos.current = null;
    lastTouchDist.current = null;

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
      style={{ 
        cursor: tool === 'text' ? 'text' : tool === 'eraser' ? 'cell' : 'crosshair',
        backgroundPosition: `${panOffset.current.x * scale}px ${panOffset.current.y * scale}px`
      }}
    >
      <div 
        ref={viewportRef}
        className="absolute inset-0"
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
      </div>

      {/* Text input popup */}
      {textInput && (
        <div
          className="absolute z-20"
          style={{ left: (textInput.x + panOffset.current.x) * scale, top: (textInput.y + panOffset.current.y) * scale }}
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
