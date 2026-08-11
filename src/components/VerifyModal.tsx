import React, { useState, useEffect } from 'react';
import type { CornerStyle } from '../types';
import { verifyHackerId } from '../utils/verifier';
import type { VerificationResult } from '../utils/verifier';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  X,
  Copy,
  Check,
  Award,
  Calendar,
  MapPin,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  cornerStyle: CornerStyle;
}

export const VerifyModal: React.FC<VerifyModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  cornerStyle,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery || 'HH-GOA-2026-A89F-8842');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const q = initialQuery || 'HH-GOA-2026-A89F-8842';
      setSearchQuery(q);
      const res = verifyHackerId(q);
      setResult(res);
      if (res.isValid) {
        confetti({
          particleCount: 70,
          spread: 60,
          colors: ['#ffe500', '#ff007f', '#055a36']
        });
      }
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const isSquare = cornerStyle === 'square';

  const handleSearch = () => {
    const res = verifyHackerId(searchQuery);
    setResult(res);
    if (res.isValid) {
      confetti({
        particleCount: 70,
        spread: 60,
        colors: ['#ffe500', '#ff007f', '#055a36']
      });
    }
  };

  const handleCopyLink = () => {
    const verifyUrl = `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(searchQuery)}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
        maxWidth: '620px',
        width: '100%',
        padding: '1.5rem',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '2px solid var(--accent-yellow)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={24} color="var(--accent-yellow)" />
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--accent-yellow)' }}>
                BUILDER PASS VERIFICATION CHECKER
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                AWS Certificate-Style Credential Authentication Engine
              </p>
            </div>
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

        {/* Search Input Bar */}
        <div className="input-group" style={{ marginBottom: '1.2rem' }}>
          <label className="input-label">Enter Hacker ID or Verification Link</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className={`input-field ${isSquare ? 'square-corners' : 'rounded-corners'}`}
              placeholder="e.g. HH-GOA-2026-A89F-8842"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}
            />
            <button
              onClick={handleSearch}
              className={`btn btn-primary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
              style={{ padding: '0.75rem 1.2rem' }}
            >
              <Search size={16} /> Verify
            </button>
          </div>
        </div>

        {/* VERIFICATION RESULT CARD */}
        {result && (
          <div>
            {result.isValid ? (
              /* VALID VERIFIED CARD */
              <div style={{
                background: 'rgba(2, 38, 22, 0.95)',
                border: '2px solid var(--accent-yellow)',
                padding: '1.5rem',
                borderRadius: isSquare ? '0px' : '10px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Official Verified Ribbon Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--accent-yellow)',
                  background: 'rgba(255, 229, 0, 0.12)',
                  padding: '0.5rem 0.8rem',
                  borderLeft: '4px solid var(--accent-yellow)',
                  marginBottom: '1rem'
                }}>
                  <ShieldCheck size={22} color="var(--accent-yellow)" />
                  <div>
                    <span style={{ fontWeight: 900, fontSize: '0.95rem', fontFamily: 'var(--font-heading)' }}>
                      OFFICIAL VERIFIED BUILDER PASS
                    </span>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                      {result.message}
                    </p>
                  </div>
                </div>

                {/* Verified Builder Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-yellow)', fontFamily: 'var(--font-mono)' }}>
                      BUILDER NAME
                    </span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-serif)', color: '#fff' }}>
                      {result.cardData?.fullName}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)' }}>
                      {result.cardData?.handle}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-yellow)', fontFamily: 'var(--font-mono)' }}>
                      STATUS BADGE
                    </span>
                    <div style={{
                      background: 'var(--accent-pink)',
                      color: 'var(--accent-yellow)',
                      padding: '0.3rem 0.6rem',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      display: 'inline-block',
                      marginTop: '0.2rem',
                      border: '1px solid var(--accent-yellow)'
                    }}>
                      {result.cardData?.statusBadge}
                    </div>
                  </div>
                </div>

                {/* Meta Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.8rem',
                  background: '#021e11',
                  padding: '0.8rem',
                  border: '1px solid rgba(255, 229, 0, 0.2)',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <UserCheck size={12} /> ROLE / SPECIALTY
                    </span>
                    <strong style={{ fontSize: '0.85rem', color: '#fff' }}>
                      {result.cardData?.role}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Award size={12} /> PRIMARY TECH STACK
                    </span>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--accent-yellow)' }}>
                      {result.cardData?.stack}
                    </strong>
                  </div>
                </div>

                {/* Issuer Seal & Timestamp */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 229, 0, 0.2)',
                  paddingTop: '0.8rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} color="var(--accent-yellow)" />
                    <span>{result.issuer}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={14} color="var(--accent-pink)" />
                    <span>{result.issuedAt}</span>
                  </div>
                </div>

                {/* Action Row */}
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleCopyLink}
                    className={`btn btn-secondary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
                    style={{ flex: 1, fontSize: '0.8rem' }}
                  >
                    {copiedLink ? <Check size={14} color="var(--accent-yellow)" /> : <Copy size={14} />}
                    {copiedLink ? 'Verification Link Copied!' : 'Copy Direct Verification URL'}
                  </button>
                </div>
              </div>
            ) : (
              /* INVALID / UNVERIFIED CARD */
              <div style={{
                background: 'rgba(50, 10, 20, 0.9)',
                border: '2px solid #ff4d4d',
                padding: '1.2rem',
                borderRadius: isSquare ? '0px' : '10px',
                textAlign: 'center'
              }}>
                <ShieldAlert size={36} color="#ff4d4d" style={{ marginBottom: '0.5rem' }} />
                <h3 style={{ color: '#ff4d4d', fontWeight: 900, fontSize: '1.1rem' }}>
                  UNVERIFIED OR INVALID HACKER ID
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#ffaaaa', marginTop: '0.3rem' }}>
                  {result.message}
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
