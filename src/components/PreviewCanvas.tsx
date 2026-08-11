import React, { useEffect, useRef, useState } from 'react';
import type {
  Mode,
  FrameTemplateId,
  IDCardStyleId,
  PhotoAdjustments,
  IDCardData,
  CornerStyle,
  StickerId
} from '../types';
import { drawCanvas } from '../utils/canvasRenderer';
import { playSuccessSound } from '../utils/audio';
import { Download, Share2, Sparkles, Move, Maximize2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PreviewCanvasProps {
  mode: Mode;
  cornerStyle: CornerStyle;
  image: HTMLImageElement | null;
  adjustments: PhotoAdjustments;
  setAdjustments: React.Dispatch<React.SetStateAction<PhotoAdjustments>>;
  frameTemplate: FrameTemplateId;
  cardStyle: IDCardStyleId;
  cardData: IDCardData;
  selectedStickers: StickerId[];
  onShareRequested: (imageDataUrl: string) => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  mode,
  cornerStyle,
  image,
  adjustments,
  setAdjustments,
  frameTemplate,
  cardStyle,
  cardData,
  selectedStickers,
  onShareRequested,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (canvasRef.current) {
      drawCanvas(canvasRef.current, {
        mode,
        image,
        adjustments,
        frameTemplate,
        cardStyle,
        cardData,
        cornerStyle,
        selectedStickers,
      });
    }
  }, [mode, cornerStyle, image, adjustments, frameTemplate, cardStyle, cardData, selectedStickers]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - adjustments.panX, y: e.clientY - adjustments.panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !image) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setAdjustments((prev) => ({
      ...prev,
      panX: Math.round(deltaX),
      panY: Math.round(deltaY),
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    playSuccessSound();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffe500', '#ff007f', '#055a36']
    });

    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = mode === 'pfp' ? `hhgoa2026-pfp-${Date.now()}.png` : `hhgoa2026-builder-card-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleShareClick = () => {
    if (!canvasRef.current) return;
    playSuccessSound();
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onShareRequested(dataUrl);
  };

  const isSquare = cornerStyle === 'square';
  const resolutionText = mode === 'pfp' ? '2000 × 2000 px HD' : '1200 × 1800 px HD';

  return (
    <div className={`glass-panel ${isSquare ? 'square-corners' : 'rounded-corners'} tech-corners`} style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
      
      {/* Top Bar Status */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={16} color="var(--accent-yellow)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-yellow)', fontWeight: 700 }}>
            LIVE GRAPHIC PREVIEW
          </span>
        </div>

        <span className={`pill-tag ${isSquare ? 'square' : 'rounded'}`} style={{ fontSize: '0.7rem' }}>
          <Maximize2 size={12} /> {resolutionText}
        </span>
      </div>

      {/* Interactive Drag Canvas Box */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%',
          maxHeight: '620px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#022314',
          border: '2px solid rgba(255, 229, 0, 0.4)',
          borderRadius: isSquare ? '0px' : '12px',
          padding: '1rem',
          position: 'relative',
          cursor: image ? (isDragging ? 'grabbing' : 'grab') : 'default',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
        }}
      >
        {image && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(4, 62, 36, 0.85)',
            border: '1px solid var(--accent-yellow)',
            padding: '0.3rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-yellow)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            zIndex: 10,
            pointerEvents: 'none',
            fontWeight: 700
          }}>
            <Move size={12} /> Drag canvas to position photo
          </div>
        )}

        <canvas
          ref={canvasRef}
          style={{
            maxWidth: '100%',
            maxHeight: mode === 'pfp' ? '480px' : '580px',
            objectFit: 'contain',
            boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
            borderRadius: isSquare ? '0px' : (mode === 'pfp' ? '12px' : '16px')
          }}
        />
      </div>

      {/* Action Buttons: Download & Share to X */}
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
        <button
          onClick={handleDownload}
          className={`btn btn-primary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
          style={{ fontSize: '0.9rem' }}
        >
          <Download size={18} /> Download Image
        </button>

        <button
          onClick={handleShareClick}
          className={`btn btn-sunset ${isSquare ? 'btn-square' : 'btn-rounded'}`}
          style={{ fontSize: '0.9rem' }}
        >
          <Share2 size={18} /> Share to X (#FrameInGoa)
        </button>
      </div>

    </div>
  );
};
