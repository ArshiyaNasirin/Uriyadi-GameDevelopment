import React, { useState } from 'react';
import { Volume2, Play, BookOpen, Sparkles } from 'lucide-react';
import { audioEngine } from '../audio/WebAudioEngine';

interface LandingOverlayProps {
  onEnterFestival: () => void;
  onOpenStory: () => void;
}

export const LandingOverlay: React.FC<LandingOverlayProps> = ({
  onEnterFestival,
  onOpenStory,
}) => {
  const [isEntering, setIsEntering] = useState(false);

  const handleEnter = () => {
    setIsEntering(true);
    // Initialize Web Audio on user gesture
    audioEngine.init();
    audioEngine.playTempleBell(520, 0.9);
    audioEngine.startMusic('VILLAGE');

    setTimeout(() => {
      onEnterFestival();
    }, 600);
  };

  return (
    <div className="landing-overlay" style={{
      position: 'absolute',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      background: 'radial-gradient(circle at center, rgba(180, 83, 9, 0.55) 0%, rgba(28, 25, 23, 0.92) 80%, rgba(12, 10, 9, 0.96) 100%)',
      padding: 'clamp(0.6rem, 2.5vh, 1.8rem) clamp(0.6rem, 2.5vw, 1.4rem)',
      backdropFilter: 'blur(8px)',
    }}>
      <div className="landing-card" style={{
        margin: 'auto',
        maxWidth: '720px',
        width: '100%',
        background: 'linear-gradient(180deg, #fffdfa 0%, #fffbf0 60%, #fef3c7 100%)',
        border: '3px solid #b45309',
        borderRadius: '20px',
        boxShadow: '0 24px 60px rgba(69, 26, 3, 0.45), inset 0 0 0 2px #fef08a, inset 0 0 0 5px #b45309',
        padding: 'clamp(1.2rem, 2.5vh, 2rem) clamp(1.2rem, 3vw, 2.2rem)',
        position: 'relative',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(0.5rem, 1.4vh, 1.1rem)',
      }}>
        {/* Top Cultural Toranam Badge */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          width: '100%',
        }}>
          <span className="sticker yellow" style={{
            fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)',
            padding: '0.3rem 0.8rem',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #fef08a 0%, #fde047 100%)',
            border: '1.5px solid #ca8a04',
          }}>
            <Sparkles size={13} color="#b45309" /> 🌾 பொங்கல் திருவிழா சிறப்பு • 3D CULTURAL TAMIL GAME
          </span>
        </div>

        {/* Tamil Title & English Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '0.1rem 0' }}>
          <div style={{
            fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
            fontFamily: 'var(--font-tamil)',
            fontWeight: 900,
            color: '#b91c1c',
            lineHeight: 1,
            letterSpacing: '0.02em',
            textShadow: '0 2px 4px rgba(180, 83, 9, 0.3), 0 0 20px rgba(245, 158, 11, 0.4)',
          }}>
            உரியடி
          </div>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 3.8vw, 3rem)',
            fontFamily: 'var(--font-serif)',
            fontWeight: 900,
            color: '#1c1917',
            letterSpacing: '0.06em',
            lineHeight: 1,
            margin: '0.2rem 0 0.1rem 0',
          }}>
            URIYADI
          </h1>
          <p style={{
            fontSize: 'clamp(0.8rem, 1.2vw, 1.1rem)',
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            color: 'var(--terracotta)',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}>
            THE LEGACY OF TAMIL NADU
          </p>
        </div>

        {/* Traditional Kolam & Festival Storyboard Tagline */}
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '1.5px solid #f59e0b',
          borderRadius: '12px',
          padding: 'clamp(0.6rem, 1.4vh, 0.9rem) clamp(0.8rem, 2vw, 1.4rem)',
          width: 'min(100%, 620px)',
          boxShadow: '0 4px 12px rgba(180, 83, 9, 0.12), inset 0 1px 0 #ffffff',
        }}>
          <p style={{ fontSize: 'clamp(1rem, 1.6vw, 1.3rem)', fontWeight: 900, color: '#78350f', lineHeight: 1.2 }}>
            “LISTEN. MOVE. STRIKE. CELEBRATE.”
          </p>
          <p style={{ fontSize: 'clamp(0.76rem, 1vw, 0.92rem)', color: '#57534e', marginTop: '0.25rem', lineHeight: 1.45 }}>
            Step into the sacred village festival square of Kovilur! Blindfold yourself, navigate through
            spatial Tamil crowd cheers, swing your lathi, and shatter the sacred suspended clay pot!
          </p>
        </div>

        {/* Audio Notice */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          fontSize: 'clamp(0.72rem, 0.95vw, 0.84rem)',
          color: '#78350f',
          fontWeight: 700,
          width: '100%',
          textAlign: 'center',
        }}>
          <Volume2 size={16} color="#b45309" />
          <span>Equip headphones for immersive 3D spatial Tamil audio navigation</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap', width: 'min(100%, 540px)' }}>
          <button
            className="btn-brutal primary"
            style={{
              fontSize: 'clamp(0.92rem, 1.3vw, 1.12rem)',
              padding: '0.85rem 1.6rem',
              flex: '1 1 240px',
              borderRadius: '14px',
              boxShadow: '0 6px 20px rgba(217, 119, 6, 0.45)',
            }}
            onClick={handleEnter}
            disabled={isEntering}
          >
            <Play size={20} fill="#1c1917" />
            {isEntering ? 'Entering Kovilur...' : 'ENTER FESTIVAL (விழாவில் நுழை)'}
          </button>

          <button
            className="btn-brutal"
            style={{
              fontSize: 'clamp(0.88rem, 1.2vw, 1.05rem)',
              padding: '0.85rem 1.4rem',
              flex: '1 1 200px',
              borderRadius: '14px',
            }}
            onClick={onOpenStory}
          >
            <BookOpen size={18} />
            DISCOVER STORY (கதை காண்க)
          </button>
        </div>

        {/* Bottom Cultural Seal */}
        <div style={{ fontSize: 'clamp(0.7rem, 0.9vw, 0.82rem)', color: '#854d0e', fontWeight: 600, textAlign: 'center', marginTop: '0.1rem' }}>
          Traditional Dravidian Cultural Tribute • Powered by Three.js & Web Audio API
        </div>
      </div>
    </div>
  );
};
