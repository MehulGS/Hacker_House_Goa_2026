import React, { useState, useEffect } from 'react';
import type { Mode, CornerStyle } from '../types';
import {
  getStoredCloudinaryCredentials,
  saveCloudinaryCredentials,
  uploadToCloudinary,
  DEFAULT_CLOUD_NAME
} from '../utils/cloudinary';
import {
  X,
  Copy,
  Download,
  Check,
  Sparkles,
  ExternalLink,
  Share2,
  CloudUpload,
  HelpCircle,
  Link,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string;
  mode: Mode;
  cornerStyle: CornerStyle;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  imageDataUrl,
  mode,
  cornerStyle,
}) => {
  const [cloudName, setCloudName] = useState(DEFAULT_CLOUD_NAME);
  const [uploadPreset, setUploadPreset] = useState('');
  const [uploading, setUploading] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');
  const [uploadError, setUploadError] = useState('');

  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedCloudUrl, setCopiedCloudUrl] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredCloudinaryCredentials();
      setCloudName(stored.cloudName || DEFAULT_CLOUD_NAME);
      setUploadPreset(stored.uploadPreset || '');
      setCloudinaryUrl('');
      setUploadError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isSquare = cornerStyle === 'square';

  const defaultCaption = mode === 'pfp'
    ? `Just generated my official @HHGoa2026 PFP! 🌴⚡ Excited for Hacker House Goa by 2:47 PM Studio (28-31 Oct 2026)! #FrameInGoa ${cloudinaryUrl ? cloudinaryUrl : ''}`
    : `Check out my official @HHGoa2026 Builder Pass! 🌊💻 Ready to hack alongside top builders in Goa! #FrameInGoa ${cloudinaryUrl ? cloudinaryUrl : ''}`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    defaultCaption
  )}`;

  const handleSaveCredentials = () => {
    saveCloudinaryCredentials(cloudName, uploadPreset);
  };

  const handleCloudinaryUpload = async () => {
    const finalCloud = cloudName.trim() || DEFAULT_CLOUD_NAME;
    const finalPreset = uploadPreset.trim();

    setUploading(true);
    setUploadError('');
    if (finalPreset) saveCloudinaryCredentials(finalCloud, finalPreset);

    try {
      const hostedUrl = await uploadToCloudinary(imageDataUrl, finalCloud, finalPreset);
      setCloudinaryUrl(hostedUrl);
      setUploading(false);

      confetti({
        particleCount: 90,
        spread: 80,
        colors: ['#ffe500', '#ff007f', '#055a36']
      });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload. Check your internet connection.');
      setUploading(false);
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(defaultCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleCopyCloudUrl = () => {
    if (cloudinaryUrl) {
      navigator.clipboard.writeText(cloudinaryUrl);
      setCopiedCloudUrl(true);
      setTimeout(() => setCopiedCloudUrl(false), 2000);
    }
  };

  const handleCopyImageToClipboard = async () => {
    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch (err) {
      handleDownload();
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const response = await fetch(imageDataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'hhgoa2026-builder.png', { type: 'image/png' });
        await navigator.share({
          title: 'HH Goa 2026 Builder Card',
          text: defaultCaption,
          files: [file],
        });
      } catch (err) {
        window.open(twitterShareUrl, '_blank');
      }
    } else {
      window.open(twitterShareUrl, '_blank');
    }
  };

  const handleDownload = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      colors: ['#ffe500', '#ff007f', '#055a36']
    });

    const link = document.createElement('a');
    link.download = mode === 'pfp' ? `hhgoa2026-pfp-${Date.now()}.png` : `hhgoa2026-builder-card-${Date.now()}.png`;
    link.href = imageDataUrl;
    link.click();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(4, 30, 18, 0.92)',
      backdropFilter: 'blur(14px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div className={`glass-panel ${isSquare ? 'square-corners' : 'rounded-corners'}`} style={{
        maxWidth: '580px',
        width: '100%',
        padding: '1.5rem',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '2px solid var(--accent-yellow)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="var(--accent-yellow)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--accent-yellow)' }}>
              SHARE TO X (#FrameInGoa)
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: isSquare ? '0px' : '50%',
              display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Image Preview Thumbnail */}
        <div style={{
          textAlign: 'center',
          marginBottom: '1rem',
          background: '#022314',
          padding: '0.75rem',
          borderRadius: isSquare ? '0px' : '8px',
          border: '1px solid rgba(255, 229, 0, 0.3)'
        }}>
          <img
            src={imageDataUrl}
            alt="HH Goa Graphic"
            style={{
              maxHeight: '220px',
              maxWidth: '100%',
              objectFit: 'contain',
              borderRadius: isSquare ? '0px' : '6px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
            }}
          />
        </div>

        {/* CLOUDINARY DIRECT UPLOADER SECTION */}
        <div style={{
          background: 'rgba(2, 38, 22, 0.9)',
          border: '1px solid var(--accent-yellow)',
          padding: '1rem',
          borderRadius: isSquare ? '0px' : '8px',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-mono)' }}>
              <CloudUpload size={18} /> CLOUDINARY DIRECT IMAGE HOSTING
            </span>
            <button
              onClick={() => setShowGuide(!showGuide)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-yellow)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <HelpCircle size={13} /> {showGuide ? 'Hide Preset Help' : 'How to get Upload Preset?'}
            </button>
          </div>

          {/* Setup Instructions Box based on user screenshot */}
          {showGuide && (
            <div style={{
              background: 'rgba(255, 229, 0, 0.12)',
              borderLeft: '4px solid var(--accent-yellow)',
              padding: '0.7rem 0.85rem',
              fontSize: '0.78rem',
              marginBottom: '0.8rem',
              color: 'var(--text-main)',
              lineHeight: 1.5
            }}>
              <strong>How to get your Upload Preset (2 Steps):</strong>
              <ol style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                <li>On the left sidebar menu of your Cloudinary dashboard, click <strong>Upload</strong> (right under <i>API Keys</i>).</li>
                <li>Scroll to <strong>Upload presets</strong> → Click <strong>Add upload preset</strong> → Set Signing Mode to <strong>Unsigned</strong> → Copy the preset name!</li>
              </ol>
            </div>
          )}

          {/* Credentials Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-yellow)', display: 'block', marginBottom: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                Cloud Name
              </span>
              <input
                type="text"
                placeholder="Cloud Name (e.g. dhyds3low)"
                className={`input-field ${isSquare ? 'square-corners' : 'rounded-corners'}`}
                value={cloudName}
                onChange={(e) => { setCloudName(e.target.value); handleSaveCredentials(); }}
                style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
              />
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-yellow)', display: 'block', marginBottom: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                Upload Preset (Unsigned)
              </span>
              <input
                type="text"
                placeholder="Preset Name (e.g. ml_default)"
                className={`input-field ${isSquare ? 'square-corners' : 'rounded-corners'}`}
                value={uploadPreset}
                onChange={(e) => { setUploadPreset(e.target.value); handleSaveCredentials(); }}
                style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
              />
              {/* Quick Preset Selector Pills */}
              <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Quick Try:</span>
                {['ml_default', 'unsigned_preset', 'hhgoa2026_preset'].map((p) => (
                  <button
                    key={p}
                    onClick={() => { setUploadPreset(p); handleSaveCredentials(); }}
                    style={{
                      background: uploadPreset === p ? 'var(--accent-yellow)' : 'rgba(255, 229, 0, 0.1)',
                      color: uploadPreset === p ? '#043e24' : 'var(--accent-yellow)',
                      border: '1px solid var(--accent-yellow)',
                      padding: '0.1rem 0.35rem',
                      fontSize: '0.65rem',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {uploadError && (
            <p style={{ fontSize: '0.75rem', color: '#ff4d4d', marginBottom: '0.5rem', fontWeight: 600 }}>
              ⚠️ {uploadError}
            </p>
          )}

          {/* Upload Action Button */}
          <button
            onClick={handleCloudinaryUpload}
            disabled={uploading}
            className={`btn btn-primary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
            style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
          >
            {uploading ? <Loader2 size={16} className="glow-animation" /> : <CloudUpload size={16} />}
            {uploading ? 'Uploading graphic to Cloudinary...' : 'Upload to Cloudinary & Generate Live URL'}
          </button>

          {/* Cloudinary Live URL Output */}
          {cloudinaryUrl && (
            <div style={{ marginTop: '0.6rem', background: 'rgba(255, 229, 0, 0.15)', padding: '0.5rem', border: '1px solid var(--accent-yellow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Link size={12} /> LIVE CLOUDINARY URL:
                </span>
                <button
                  onClick={handleCopyCloudUrl}
                  style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                >
                  {copiedCloudUrl ? 'Copied!' : 'Copy URL'}
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={cloudinaryUrl}
                className="input-field"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem', marginTop: '0.2rem', background: '#021a0f' }}
              />
            </div>
          )}
        </div>

        {/* Pre-filled Caption Box */}
        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label">Pre-filled Tweet Caption</label>
            <button
              onClick={handleCopyCaption}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-yellow)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700
              }}
            >
              {copiedCaption ? <Check size={12} color="var(--text-yellow)" /> : <Copy size={12} />}
              {copiedCaption ? 'Copied Caption!' : 'Copy Caption'}
            </button>
          </div>
          <textarea
            readOnly
            className={`input-field ${isSquare ? 'square-corners' : 'rounded-corners'}`}
            rows={3}
            value={defaultCaption}
            style={{ fontSize: '0.85rem', resize: 'none', fontFamily: 'var(--font-main)' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button
            onClick={handleNativeShare}
            className={`btn btn-sunset ${isSquare ? 'btn-square' : 'btn-rounded'}`}
            style={{ fontSize: '0.95rem' }}
          >
            <Share2 size={18} /> Share Pre-filled Post on X (#FrameInGoa) <ExternalLink size={14} />
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <button
              onClick={handleCopyImageToClipboard}
              className={`btn btn-secondary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
              style={{ fontSize: '0.8rem' }}
            >
              {copiedImage ? <Check size={16} color="var(--accent-yellow)" /> : <Copy size={16} />}
              {copiedImage ? 'Image Copied!' : 'Copy Image'}
            </button>

            <button
              onClick={handleDownload}
              className={`btn btn-primary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
              style={{ fontSize: '0.8rem' }}
            >
              <Download size={16} /> Save PNG
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
