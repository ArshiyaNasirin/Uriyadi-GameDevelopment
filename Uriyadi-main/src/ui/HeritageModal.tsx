import React, { useState } from 'react';
import { HERITAGE_ITEMS } from '../data/heritageData';
import { ArrowLeft } from 'lucide-react';
import { HeritageItem } from '../types';

interface HeritageModalProps {
  onClose: () => void;
}

export const HeritageModal: React.FC<HeritageModalProps> = ({ onClose }) => {
  const [selectedItem, setSelectedItem] = useState<HeritageItem>(HERITAGE_ITEMS[0]);

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{
        maxWidth: '1080px',
        maxHeight: '92vh',
        height: '90%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.2rem 1.8rem',
          borderBottom: 'var(--border-thick)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--saffron-light)',
        }}>
          <div>
            <span className="sticker red">HERITAGE ARCHIVE (தமிழ் மரபுப் பெட்டகம்)</span>
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', fontWeight: 900, marginTop: '0.3rem' }}>
              THE CULTURAL SOUL OF TAMIL NADU
            </h2>
          </div>
          <button className="btn-brutal" onClick={onClose}>
            <ArrowLeft size={18} /> BACK TO MENU
          </button>
        </div>

        {/* Content Layout: Left list, Right detail */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left: Card Categories */}
          <div style={{
            width: '320px',
            borderRight: 'var(--border-thick)',
            overflowY: 'auto',
            background: '#fafaf9',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
          }}>
            {HERITAGE_ITEMS.map((item) => {
              const isSelected = item.id === selectedItem.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    padding: '0.9rem 1rem',
                    background: isSelected ? 'var(--saffron)' : '#ffffff',
                    border: 'var(--border-thin)',
                    boxShadow: isSelected ? 'var(--shadow-hard-sm)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isSelected ? '#1c1917' : 'var(--terracotta)' }}>
                        {item.tag}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: '#1c1917' }}>
                        {item.title}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Card Presentation */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem',
            background: '#ffffff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '3rem' }}>{selectedItem.icon}</span>
              <div>
                <div style={{
                  fontSize: '1.4rem',
                  fontFamily: 'var(--font-tamil)',
                  fontWeight: 900,
                  color: 'var(--kumkum)',
                }}>
                  {selectedItem.tamilTitle}
                </div>
                <h3 style={{
                  fontSize: '2.4rem',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 900,
                  color: '#1c1917',
                }}>
                  {selectedItem.title}
                </h3>
              </div>
            </div>

            {/* Summary */}
            <p style={{
              fontSize: '1.15rem',
              lineHeight: 1.6,
              color: '#292524',
              background: 'var(--saffron-light)',
              border: 'var(--border-thin)',
              padding: '1.2rem',
              boxShadow: 'var(--shadow-hard-sm)',
              marginBottom: '1.5rem',
            }}>
              {selectedItem.summary}
            </p>

            {/* Key Cultural Details */}
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.8rem' }}>
              HISTORICAL & RITUAL DETAILS:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
              {selectedItem.details.map((detail, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.8rem 1rem',
                    background: '#f5f5f4',
                    borderLeft: '4px solid var(--terracotta)',
                    fontSize: '1rem',
                    lineHeight: 1.5,
                  }}
                >
                  {detail}
                </div>
              ))}
            </div>

            {/* Cultural Significance Box */}
            <div style={{
              background: 'var(--temple-stone)',
              color: '#fef3c7',
              border: 'var(--border-thick)',
              padding: '1.2rem 1.5rem',
              boxShadow: 'var(--shadow-hard-sm)',
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--saffron)', letterSpacing: '0.08em' }}>
                CULTURAL SIGNIFICANCE // ஆன்மீக மற்றும் வாழ்வியல் தத்துவம்
              </div>
              <p style={{ fontSize: '1.05rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
                {selectedItem.culturalSignificance}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
