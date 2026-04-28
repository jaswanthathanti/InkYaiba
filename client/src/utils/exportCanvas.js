/**
 * Export the canvas to PNG or SVG
 */

export function exportPNG(canvasRef, roomCode = 'InkYaiba') {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const ctx = tempCanvas.getContext('2d');
  
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  ctx.drawImage(canvas, 0, 0);

  const link = document.createElement('a');
  link.download = `${roomCode}-board.png`;
  link.href = tempCanvas.toDataURL('image/png');
  link.click();
}

export function exportSVG(strokes, canvasWidth, canvasHeight, roomCode = 'InkYaiba') {
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}">`;
  svgContent += `<rect width="100%" height="100%" fill="white"/>`;

  for (const stroke of strokes) {
    const opacityAttr = stroke.opacity !== undefined ? ` opacity="${stroke.opacity}"` : ' opacity="1"';
    if (stroke.tool === 'pen' || stroke.tool === 'eraser') {
      if (stroke.points && stroke.points.length > 1) {
        let d = `M ${stroke.points[0].x} ${stroke.points[0].y}`;
        for (let i = 1; i < stroke.points.length; i++) {
          d += ` L ${stroke.points[i].x} ${stroke.points[i].y}`;
        }
        const color = stroke.tool === 'eraser' ? 'white' : (stroke.color || '#000');
        svgContent += `<path d="${d}" stroke="${color}" stroke-width="${stroke.size || 3}" fill="none" stroke-linecap="round" stroke-linejoin="round"${opacityAttr}/>`;
      }
    } else if (stroke.tool === 'rectangle') {
      const x = Math.min(stroke.startX, stroke.endX);
      const y = Math.min(stroke.startY, stroke.endY);
      const w = Math.abs(stroke.endX - stroke.startX);
      const h = Math.abs(stroke.endY - stroke.startY);
      svgContent += `<rect x="${x}" y="${y}" width="${w}" height="${h}" stroke="${stroke.color || '#000'}" stroke-width="${stroke.size || 3}" fill="none"${opacityAttr}/>`;
    } else if (stroke.tool === 'circle') {
      const cx = (stroke.startX + stroke.endX) / 2;
      const cy = (stroke.startY + stroke.endY) / 2;
      const rx = Math.abs(stroke.endX - stroke.startX) / 2;
      const ry = Math.abs(stroke.endY - stroke.startY) / 2;
      svgContent += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" stroke="${stroke.color || '#000'}" stroke-width="${stroke.size || 3}" fill="none"${opacityAttr}/>`;
    } else if (stroke.tool === 'line') {
      svgContent += `<line x1="${stroke.startX}" y1="${stroke.startY}" x2="${stroke.endX}" y2="${stroke.endY}" stroke="${stroke.color || '#000'}" stroke-width="${stroke.size || 3}" stroke-linecap="round"${opacityAttr}/>`;
    } else if (stroke.tool === 'arrow') {
      svgContent += `<g${opacityAttr}>`;
      svgContent += `<line x1="${stroke.startX}" y1="${stroke.startY}" x2="${stroke.endX}" y2="${stroke.endY}" stroke="${stroke.color || '#000'}" stroke-width="${stroke.size || 3}" stroke-linecap="round"/>`;
      // Arrowhead
      const angle = Math.atan2(stroke.endY - stroke.startY, stroke.endX - stroke.startX);
      const headLen = 15;
      const x1 = stroke.endX - headLen * Math.cos(angle - Math.PI / 6);
      const y1 = stroke.endY - headLen * Math.sin(angle - Math.PI / 6);
      const x2 = stroke.endX - headLen * Math.cos(angle + Math.PI / 6);
      const y2 = stroke.endY - headLen * Math.sin(angle + Math.PI / 6);
      svgContent += `<polygon points="${stroke.endX},${stroke.endY} ${x1},${y1} ${x2},${y2}" fill="${stroke.color || '#000'}"/>`;
      svgContent += `</g>`;
    } else if (stroke.tool === 'text') {
      svgContent += `<text x="${stroke.x}" y="${stroke.y}" font-family="Inter, sans-serif" font-size="${stroke.fontSize || 16}" fill="${stroke.color || '#000'}"${opacityAttr}>${escapeXml(stroke.text || '')}</text>`;
    }
  }

  svgContent += '</svg>';

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${roomCode}-board.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
