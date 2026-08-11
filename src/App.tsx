import React, { useState, useEffect } from 'react';
import type {
  Mode,
  CornerStyle,
  FrameTemplateId,
  IDCardStyleId,
  PhotoAdjustments,
  IDCardData,
  StickerId
} from './types';
import { Header } from './components/Header';
import { PhotoUploader } from './components/PhotoUploader';
import { DEMO_AVATARS } from './constants/avatars';
import { ControlsPanel } from './components/ControlsPanel';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ShareModal } from './components/ShareModal';
import { VerifyModal } from './components/VerifyModal';
import { Flame, ShieldCheck, Zap } from 'lucide-react';

export const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('pfp');
  const [cornerStyle, setCornerStyle] = useState<CornerStyle>('square');

  const [image, setImage] = useState<HTMLImageElement | null>(null);

  // Preload default sample photo on initial mount so canvas is never blank!
  useEffect(() => {
    const defaultUrl = DEMO_AVATARS[0].url;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.src = defaultUrl;
  }, []);

  const [adjustments, setAdjustments] = useState<PhotoAdjustments>({
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
    filter: 'none',
    brightness: 100,
    contrast: 100,
    saturation: 100,
  });

  const [frameTemplate, setFrameTemplate] = useState<FrameTemplateId>('studio-emerald');
  const [cardStyle, setCardStyle] = useState<IDCardStyleId>('studio-emerald');

  const [cardData, setCardData] = useState<IDCardData>({
    fullName: 'Alex Rivera',
    handle: '@alex_goa',
    role: 'Full-Stack & Systems Eng',
    stack: 'Rust • TS • Solana',
    builderTitle: '2:47 PM SHIPPER ⚡',
    statusBadge: 'SHORTLISTED',
    location: 'Goa, India',
    edition: '2026',
    hackerId: 'ID: HH-GOA-2026-8890',
  });

  const [selectedStickers, setSelectedStickers] = useState<StickerId[]>(['goa-hacker']);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareImageDataUrl, setShareImageDataUrl] = useState('');

  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyQuery, setVerifyQuery] = useState('');

  // Check URL query string for ?verify=... on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyParam = params.get('verify');
    if (verifyParam) {
      const fullUrl = window.location.href;
      setVerifyQuery(fullUrl.includes('data=') ? fullUrl : verifyParam);
      setVerifyModalOpen(true);
    }
  }, []);

  const handleToggleSticker = (id: StickerId) => {
    setSelectedStickers((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleShareRequested = (dataUrl: string) => {
    setShareImageDataUrl(dataUrl);
    setShareModalOpen(true);
  };

  const isSquare = cornerStyle === 'square';

  return (
    <div className="app-container">
      {/* Navbar Header */}
      <Header
        mode={mode}
        setMode={setMode}
        cornerStyle={cornerStyle}
        setCornerStyle={setCornerStyle}
        onOpenVerify={() => {
          setVerifyQuery('HH-GOA-2026-A89F-8842');
          setVerifyModalOpen(true);
        }}
      />

      {/* Main App Grid */}
      <main className="main-grid">
        {/* Left Column: Photo Upload & Tuning Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <PhotoUploader
            onImageSelected={(img) => setImage(img)}
            cornerStyle={cornerStyle}
            hasPhoto={!!image}
          />

          <ControlsPanel
            mode={mode}
            cornerStyle={cornerStyle}
            frameTemplate={frameTemplate}
            setFrameTemplate={setFrameTemplate}
            cardStyle={cardStyle}
            setCardStyle={setCardStyle}
            adjustments={adjustments}
            setAdjustments={setAdjustments}
            cardData={cardData}
            setCardData={setCardData}
            selectedStickers={selectedStickers}
            onToggleSticker={handleToggleSticker}
          />
        </div>

        {/* Right Column: Live Interactive Preview & Export Actions */}
        <div>
          <PreviewCanvas
            mode={mode}
            cornerStyle={cornerStyle}
            image={image}
            adjustments={adjustments}
            setAdjustments={setAdjustments}
            frameTemplate={frameTemplate}
            cardStyle={cardStyle}
            cardData={cardData}
            selectedStickers={selectedStickers}
            onShareRequested={handleShareRequested}
          />
        </div>
      </main>

      {/* Footer Info & Verification Bar */}
      <footer
        className={`glass-panel ${isSquare ? 'square-corners' : 'rounded-corners'}`}
        style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={16} color="var(--accent-yellow)" />
          <span>2:47 PM STUDIO x HACKER HOUSE GOA 2026 — Official Builder Generator</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <button
            onClick={() => {
              setVerifyQuery('HH-GOA-2026-A89F-8842');
              setVerifyModalOpen(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-yellow)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700
            }}
          >
            <ShieldCheck size={14} color="var(--accent-yellow)" /> Verify Pass Authenticity
          </button>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Flame size={14} color="var(--accent-pink)" /> Hashtag: <strong>#FrameInGoa</strong>
          </span>
        </div>
      </footer>

      {/* X (Twitter) & Cloudinary Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        imageDataUrl={shareImageDataUrl}
        mode={mode}
        cornerStyle={cornerStyle}
      />

      {/* AWS Certificate Style Verification Checker Modal */}
      <VerifyModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        initialQuery={verifyQuery}
        cornerStyle={cornerStyle}
      />
    </div>
  );
};

export default App;
