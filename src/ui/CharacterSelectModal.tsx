import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { CHARACTERS, OUTFITS, STICKS } from '../data/characterData';
import { CharacterConfig, OutfitConfig, StickConfig } from '../types';

interface CharacterSelectModalProps {
  selectedCharacter: CharacterConfig;
  selectedOutfit: OutfitConfig;
  selectedStick: StickConfig;
  onConfirm: (character: CharacterConfig, outfit: OutfitConfig, stick: StickConfig) => void;
  onBack: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  selectedCharacter: initialChar,
  selectedOutfit: initialOutfit,
  selectedStick: initialStick,
  onConfirm,
  onBack,
}) => {
  const [currentChar, setCurrentChar] = useState<CharacterConfig>(initialChar);
  const [currentOutfit, setCurrentOutfit] = useState<OutfitConfig>(initialOutfit);
  const [currentStick, setCurrentStick] = useState<StickConfig>(initialStick);

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{
        maxWidth: '1080px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.8rem',
          borderBottom: 'var(--border-thick)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--saffron-light)',
        }}>
          <div>
            <span className="sticker yellow">KOVILUR DRESSING ROOM (வீரர் & ஆடைத் தேர்வு)</span>
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', fontWeight: 900, marginTop: '0.2rem' }}>
              CHOOSE HERO, FESTIVE ATTIRE & LATHI
            </h2>
          </div>
          <button className="btn-brutal" onClick={onBack}>
            <ArrowLeft size={16} /> BACK
          </button>
        </div>

        {/* Modal Body: Two Columns */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Column: Character Lineup */}
          <div style={{
            width: '42%',
            borderRight: 'var(--border-thick)',
            overflowY: 'auto',
            padding: '1.2rem',
            background: '#fafaf9',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.8rem' }}>
              SELECT VILLAGE HERO:
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {CHARACTERS.map((char) => {
                const isSelected = char.id === currentChar.id;
                return (
                  <div
                    key={char.id}
                    onClick={() => setCurrentChar(char)}
                    style={{
                      padding: '1rem',
                      background: isSelected ? '#ffffff' : '#f5f5f4',
                      border: isSelected ? '2px solid var(--terracotta)' : 'var(--border-thin)',
                      boxShadow: isSelected ? 'var(--shadow-hard-sm)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span style={{ fontSize: '2.4rem' }}>{char.avatarIcon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{char.name}</span>
                          <span style={{ fontFamily: 'var(--font-tamil)', fontWeight: 800, color: 'var(--kumkum)' }}>
                            {char.tamilName}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--terracotta)' }}>
                          {char.title}
                        </div>
                      </div>
                    </div>

                    {/* Stats Bar */}
                    <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 800 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '65px' }}>SPEED</span>
                        <div style={{ flex: 1, height: '6px', background: '#e7e5e4', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${char.speed}%`, height: '100%', background: 'var(--leaf-green)' }} />
                        </div>
                        <span>{char.speed}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '65px' }}>POWER</span>
                        <div style={{ flex: 1, height: '6px', background: '#e7e5e4', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${char.strength}%`, height: '100%', background: 'var(--kumkum)' }} />
                        </div>
                        <span>{char.strength}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '65px' }}>AUDIO SENSE</span>
                        <div style={{ flex: 1, height: '6px', background: '#e7e5e4', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${char.audioSense}%`, height: '100%', background: 'var(--saffron)' }} />
                        </div>
                        <span>{char.audioSense}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Outfits & Stick customization */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#ffffff' }}>
            {/* Outfits Section */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                TRADITIONAL FESTIVAL ATTIRE (பாரம்பரிய ஆடை):
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
                {OUTFITS.map((outfit) => {
                  const isSelected = outfit.id === currentOutfit.id;
                  return (
                    <div
                      key={outfit.id}
                      onClick={() => setCurrentOutfit(outfit)}
                      style={{
                        padding: '0.8rem',
                        border: isSelected ? '2px solid var(--terracotta)' : 'var(--border-thin)',
                        background: isSelected ? 'var(--saffron-light)' : '#ffffff',
                        boxShadow: isSelected ? 'var(--shadow-hard-sm)' : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: outfit.colorHex,
                            border: '1.5px solid #1c1917',
                          }}
                        />
                        <span style={{ fontSize: '0.85rem', fontWeight: 900 }}>{outfit.name}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#57534e' }}>{outfit.tamilName}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sticks Section */}
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                URIYADI LATHI / STICK (உரியடித் தடி):
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {STICKS.map((stick) => {
                  const isSelected = stick.id === currentStick.id;
                  return (
                    <div
                      key={stick.id}
                      onClick={() => setCurrentStick(stick)}
                      style={{
                        padding: '0.8rem 1rem',
                        border: isSelected ? '2px solid var(--terracotta)' : 'var(--border-thin)',
                        background: isSelected ? 'var(--saffron-light)' : '#ffffff',
                        boxShadow: isSelected ? 'var(--shadow-hard-sm)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 900, fontSize: '0.95rem' }}>{stick.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#57534e' }}>{stick.material}</div>
                      </div>
                      <span className="sticker yellow" style={{ fontSize: '0.75rem' }}>
                        POWER: {stick.powerMultiplier}x
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirmation summary */}
            <div style={{
              marginTop: '1.8rem',
              background: '#1c1917',
              color: '#ffffff',
              padding: '1rem',
              border: 'var(--border-thin)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--saffron)', fontWeight: 800 }}>ACTIVE SELECTION:</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>
                  {currentChar.name} • {currentOutfit.name}
                </div>
              </div>
              <button
                className="btn-brutal primary"
                style={{ padding: '0.8rem 1.6rem' }}
                onClick={() => onConfirm(currentChar, currentOutfit, currentStick)}
              >
                <Check size={18} /> CONFIRM SELECTION
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
