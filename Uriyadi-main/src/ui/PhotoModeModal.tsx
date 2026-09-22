import React, { useState } from 'react';
import { Camera, Download, ArrowLeft } from 'lucide-react';
import { GameWorld } from '../game/GameWorld';

interface PhotoModeModalProps {
  gameWorld: GameWorld | null;
  onClose: () => void;
}

export const PhotoModeModal: React.FC<PhotoModeModalProps> = ({ gameWorld, onClose }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const takeSnapshot = () => {
    if (!gameWorld) return;
    const dataUrl = gameWorld.captureScreenshot();
    setCapturedImage(dataUrl);
  };

  const downloadSnapshot = () => {
    if (!capturedImage) return;
    const a = document.createElement('a');
    a.href = capturedImage;
    a.download = `uriyadi-kovilur-${Date.now()}.png`;
    a.click();
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 45,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 'clamp(0.8rem, 2vh, 1.8rem)',
    }}>
      {/* Top Controls Bar */}
      <div style={{
        pointerEvents: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        border: 'var(--border-thick)',
        boxShadow: 'var(--shadow-hard)',
        padding: '0.8rem 1.4rem',
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Camera size={22} color="var(--terracotta)" />
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: '1.2rem' }}>
            PHOTO MODE // KOVILUR VILLAGE SNAPSHOT
          </span>
        </div>
        <button className="btn-brutal" onClick={onClose}>
          <ArrowLeft size={16} /> EXIT PHOTO MODE
        </button>
      </div>

      {/* Center Viewfinder crosshairs */}
      <div style={{
        margin: 'auto',
        width: '80%',
        height: '65%',
        border: '2px dashed rgba(245, 158, 11, 0.6)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: -10, left: -10, width: 24, height: 24, borderTop: '4px solid #f59e0b', borderLeft: '4px solid #f59e0b' }} />
        <div style={{ position: 'absolute', top: -10, right: -10, width: 24, height: 24, borderTop: '4px solid #f59e0b', borderRight: '4px solid #f59e0b' }} />
        <div style={{ position: 'absolute', bottom: -10, left: -10, width: 24, height: 24, borderBottom: '4px solid #f59e0b', borderLeft: '4px solid #f59e0b' }} />
        <div style={{ position: 'absolute', bottom: -10, right: -10, width: 24, height: 24, borderBottom: '4px solid #f59e0b', borderRight: '4px solid #f59e0b' }} />
      </div>

      {/* Bottom Capture Button or Download Preview */}
      <div style={{
        pointerEvents: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
      }}>
        {capturedImage ? (
          <div style={{
            background: '#ffffff',
            border: 'var(--border-thick)',
            boxShadow: 'var(--shadow-hard-lg)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.2rem',
          }}>
            <img src={capturedImage} alt="Captured preview" style={{ width: 140, height: 80, objectFit: 'cover', border: '1px solid #1c1917' }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: '1rem' }}>PHOTO READY!</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="btn-brutal primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={downloadSnapshot}>
                  <Download size={16} /> SAVE PNG
                </button>
                <button className="btn-brutal" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setCapturedImage(null)}>
                  TAKE ANOTHER
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            className="btn-brutal primary"
            style={{ fontSize: '1.2rem', padding: '1rem 2.5rem' }}
            onClick={takeSnapshot}
          >
            <Camera size={24} fill="#1c1917" />
            CAPTURE PHOTO (புகைப்படம் எடு)
          </button>
        )}
      </div>
    </div>
  );
};
