import React from 'react';
import { Play, BookOpen, Award, Settings, Compass, Flame, Clock, Camera, User, Sparkles } from 'lucide-react';
import { GameMode } from '../types';

interface MainMenuProps {
  onSelectMode: (mode: GameMode) => void;
  onOpenCharacterSelect: () => void;
  onOpenHeritage: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  onOpenPhotoMode: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onSelectMode,
  onOpenCharacterSelect,
  onOpenHeritage,
  onOpenAchievements,
  onOpenSettings,
  onOpenPhotoMode,
}) => {
  return (
    <div className="main-menu-shell" style={{
      position: 'absolute',
      inset: 0,
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 'clamp(0.6rem, 2vh, 1.4rem)',
      overflowY: 'auto',
      pointerEvents: 'none', // Allow background 3D scene interaction
    }}>
      {/* Top Header Bar */}
      <header className="main-menu-header" style={{
        pointerEvents: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(180deg, #ffffff 0%, #fffdf5 100%)',
        border: '2px solid #d97706',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(180, 83, 9, 0.2), inset 0 1px 0 #ffffff',
        padding: '0.65rem 1.4rem',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
            fontFamily: 'var(--font-tamil)',
            fontWeight: 900,
            color: '#b91c1c',
            lineHeight: 1,
            textShadow: '0 2px 4px rgba(180, 83, 9, 0.25)',
          }}>
            உரியடி
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)', lineHeight: 1, color: '#1c1917' }}>
              URIYADI
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309', letterSpacing: '0.1em' }}>
              THE LEGACY OF TAMIL NADU
            </div>
          </div>
        </div>

        <div className="main-menu-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn-brutal primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', borderRadius: '10px' }} onClick={onOpenCharacterSelect}>
            <User size={15} /> HERO & OUTFITS
          </button>
          <button className="btn-brutal" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderRadius: '10px' }} onClick={onOpenPhotoMode}>
            <Camera size={15} /> PHOTO
          </button>
          <button className="btn-brutal" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderRadius: '10px' }} onClick={onOpenAchievements}>
            <Award size={15} /> TROPHIES
          </button>
          <button className="btn-brutal" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderRadius: '10px' }} onClick={onOpenHeritage}>
            <BookOpen size={15} /> HERITAGE
          </button>
          <button className="btn-brutal" style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem', borderRadius: '10px' }} onClick={onOpenSettings}>
            <Settings size={15} />
          </button>
        </div>
      </header>

      {/* Main Menu Center Panel */}
      <div className="main-menu-panel" style={{
        pointerEvents: 'auto',
        alignSelf: 'flex-start',
        maxWidth: '430px',
        width: '100%',
        background: 'linear-gradient(180deg, #ffffff 0%, #fffdf5 100%)',
        border: '2.5px solid #d97706',
        borderRadius: '18px',
        boxShadow: '0 16px 36px rgba(120, 53, 15, 0.28), inset 0 1px 0 #ffffff',
        padding: '1.4rem',
        marginTop: 'auto',
        marginBottom: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
          <span className="sticker yellow" style={{ borderRadius: '14px', fontSize: '0.75rem' }}>
            <Sparkles size={12} color="#b45309" /> SELECT ARENA CHALLENGE
          </span>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#92400e' }}>SEASON 2026</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {/* Hero & Outfits Dressing Room */}
          <button
            className="btn-brutal"
            style={{
              justifyContent: 'flex-start',
              padding: '0.75rem 1.1rem',
              textAlign: 'left',
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              borderColor: '#f59e0b',
              borderRadius: '12px',
            }}
            onClick={onOpenCharacterSelect}
          >
            <User size={22} color="#b45309" />
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#78350f' }}>HERO & OUTFITS (வீரர்கள் & ஆடைகள்)</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309' }}>
                Kathir, Maran, Selvi, Murugan & Festive Veshtis
              </div>
            </div>
          </button>

          {/* Story Mode */}
          <button
            className="btn-brutal primary"
            style={{
              justifyContent: 'flex-start',
              padding: '0.8rem 1.1rem',
              textAlign: 'left',
              borderRadius: '12px',
            }}
            onClick={() => onSelectMode('STORY')}
          >
            <Play size={20} fill="#1c1917" />
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900 }}>STORY MODE (கதை முறை)</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.9 }}>
                Follow Kathir across 4 festival stages against Periya Chinna
              </div>
            </div>
          </button>

          {/* Festival Tournament */}
          <button
            className="btn-brutal"
            style={{
              justifyContent: 'flex-start',
              padding: '0.75rem 1.1rem',
              textAlign: 'left',
              borderRadius: '12px',
            }}
            onClick={() => onSelectMode('FESTIVAL')}
          >
            <Flame size={20} color="#dc2626" />
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#1c1917' }}>FESTIVAL TOURNAMENT</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#57534e' }}>
                Classic blindfold Uriyadi with full crowd guidance
              </div>
            </div>
          </button>

          {/* Practice Mode */}
          <button
            className="btn-brutal"
            style={{
              justifyContent: 'flex-start',
              padding: '0.75rem 1.1rem',
              textAlign: 'left',
              borderRadius: '12px',
            }}
            onClick={() => onSelectMode('PRACTICE')}
          >
            <Compass size={20} color="#15803d" />
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#1c1917' }}>PRACTICE (பயிற்சி முறை)</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#57534e' }}>
                No blindfold • Calibrate swing timing & audio orientation
              </div>
            </div>
          </button>

          {/* Time Trial */}
          <button
            className="btn-brutal"
            style={{
              justifyContent: 'flex-start',
              padding: '0.75rem 1.1rem',
              textAlign: 'left',
              borderRadius: '12px',
            }}
            onClick={() => onSelectMode('TIME_TRIAL')}
          >
            <Clock size={20} color="#b45309" />
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#1c1917' }}>TIME TRIAL (மின்னல் வேகம்)</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#57534e' }}>
                Smash the pot in record time for high leaderboard ranks
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Footer Controls Tip */}
      <footer className="main-menu-footer" style={{
        pointerEvents: 'auto',
        background: 'linear-gradient(135deg, rgba(28, 25, 23, 0.9) 0%, rgba(69, 26, 3, 0.92) 100%)',
        backdropFilter: 'blur(6px)',
        color: '#fef3c7',
        border: '1.5px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '14px',
        padding: '0.5rem 1.2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        fontWeight: 700,
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}>
        <span>WASD: Move • MOUSE: Look • LEFT CLICK: Swing Stick • SHIFT: Sprint</span>
        <span style={{ color: '#facc15' }}>🌾 உரியடி திருவிழா களம் தயாராக உள்ளது!</span>
      </footer>
    </div>
  );
};
