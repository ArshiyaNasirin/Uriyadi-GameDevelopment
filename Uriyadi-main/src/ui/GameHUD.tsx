import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Crosshair,
  Pause,
  Volume2,
  Eye,
  EyeOff,
  Navigation,
} from 'lucide-react';
import { DirectionalVoiceCue, HitQuality, LevelConfig, NavigationMetrics, PlayerStats, SettingsConfig } from '../types';
import { PlayerController } from '../game/PlayerController';

interface GameHUDProps {
  level: LevelConfig;
  stats: PlayerStats;
  settings: SettingsConfig;
  timeRemaining: number;
  currentVoiceCue: DirectionalVoiceCue | null;
  navMetrics: NavigationMetrics;
  player: PlayerController | null;
  onPause: () => void;
  onSwing: () => void;
  onToggleBlindfoldPeek: () => void;
  isBlindfoldPeekActive: boolean;
  hitFeedback?: { quality: HitQuality; points: number } | null;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  level,
  stats,
  settings,
  timeRemaining,
  currentVoiceCue,
  navMetrics,
  player: _player,
  onPause,
  onSwing,
  onToggleBlindfoldPeek,
  isBlindfoldPeekActive,
  hitFeedback,
}) => {
  const renderVoiceIcon = (target?: string) => {
    switch (target) {
      case 'LEFT':
        return <ArrowLeft size={32} color="#ffffff" />;
      case 'RIGHT':
        return <ArrowRight size={32} color="#ffffff" />;
      case 'FORWARD':
      case 'CLOSE':
        return <ArrowUp size={32} color="#ffffff" />;
      case 'STRIKE':
      case 'NOW':
        return <Crosshair size={36} color="var(--saffron)" />;
      default:
        return <Volume2 size={28} color="#ffffff" />;
    }
  };

  const compassAngle = -navMetrics.bearingToPot;

  return (
    <div className="game-hud-shell" style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 25,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 'clamp(0.6rem, 1.5vh, 1.2rem)',
    }}>
      {/* 1. BLINDFOLD CLOTH OVERLAY */}
      {level.blindfoldRequired && !isBlindfoldPeekActive && (
        <div
          className="blindfold-overlay"
          style={{ opacity: settings.blindfoldOpacity }}
        >
          <div className="blindfold-fabric" />
          <div style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#fef3c7',
            pointerEvents: 'none',
          }}>
            <div style={{
              fontSize: 'clamp(1.4rem, 3.5vw, 2.4rem)',
              fontFamily: 'var(--font-tamil)',
              fontWeight: 900,
              color: 'var(--saffron)',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            }}>
              கண் கட்டப்பட்டுள்ளது
            </div>
            <div style={{
              fontSize: 'clamp(0.75rem, 1.3vw, 1.1rem)',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: '0.2rem',
            }}>
              BLINDFOLDED • LISTEN TO TAMIL CROWD GUIDANCE
            </div>
          </div>
        </div>
      )}

      {/* 2. SLEEK COMPACT TOP HUD BAR */}
      <header className="hud-topbar" style={{
        pointerEvents: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(180deg, #ffffff 0%, #fffdf5 100%)',
        border: '2px solid #d97706',
        boxShadow: '0 8px 24px rgba(180, 83, 9, 0.22), inset 0 1px 0 #ffffff',
        padding: '0.5rem 1.2rem',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        zIndex: 30,
        borderRadius: '16px',
        position: 'relative',
      }}>
        {/* Level & Objective */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="sticker yellow" style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                {level.title}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#78350f', marginTop: '0.15rem' }}>
              🎯 {level.tamilTitle}
            </div>
          </div>
        </div>

        {/* Dynamic Compact Radar & Distance Indicator */}
        <div className="hud-radar" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          background: navMetrics.isInStrikingRange ? '#fee2e2' : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: navMetrics.isInStrikingRange ? '2.5px solid #dc2626' : '1.5px solid #d97706',
          padding: '0.35rem 0.9rem',
          borderRadius: '24px',
          boxShadow: navMetrics.isInStrikingRange ? '0 0 18px rgba(220, 38, 38, 0.55)' : '0 2px 8px rgba(180, 83, 9, 0.15)',
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: navMetrics.isInStrikingRange ? '#dc2626' : '#78350f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `rotate(${compassAngle}deg)`,
            transition: 'transform 0.1s ease',
          }}>
            <Navigation size={16} color="#ffffff" fill="#ffffff" />
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontSize: '0.95rem',
              fontWeight: 900,
              color: navMetrics.isInStrikingRange ? '#b91c1c' : '#78350f',
              lineHeight: 1,
            }}>
              {navMetrics.isInStrikingRange ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  🔥 IN RANGE! <span style={{ fontFamily: 'var(--font-tamil)', fontSize: '1.05rem' }}>அடி!</span>
                </span>
              ) : (
                <span>{navMetrics.distanceToPot}m TO POT</span>
              )}
            </div>
          </div>
        </div>

        {/* Metrics: Timer, Combo, Score, Peek, Pause */}
        <div className="hud-metrics" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.6rem, 1.2vw, 1.2rem)' }}>
          {level.blindfoldRequired && (
            <button
              className="btn-brutal"
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                borderRadius: '10px',
                background: isBlindfoldPeekActive ? 'var(--saffron)' : '#ffffff',
              }}
              onClick={onToggleBlindfoldPeek}
            >
              {isBlindfoldPeekActive ? <EyeOff size={14} /> : <Eye size={14} />}
              {isBlindfoldPeekActive ? 'HIDE' : 'PEEK'}
            </button>
          )}

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#78716c' }}>TIME</div>
            <div style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
              fontWeight: 900,
              fontFamily: 'monospace',
              color: timeRemaining <= 10 ? 'var(--kumkum)' : '#1c1917',
              lineHeight: 1,
            }}>
              {Math.max(0, Math.ceil(timeRemaining))}s
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#78716c' }}>COMBO</div>
            <div style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', fontWeight: 900, color: 'var(--saffron)', lineHeight: 1 }}>
              {stats.combo > 1 ? `${stats.combo}x` : '1x'}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#78716c' }}>SCORE</div>
            <div style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', fontWeight: 900, color: 'var(--leaf-green)', lineHeight: 1 }}>
              {stats.score}
            </div>
          </div>

          <button
            className="btn-brutal"
            style={{ padding: '0.35rem 0.6rem' }}
            onClick={onPause}
            title="Pause Festival (ESC)"
          >
            <Pause size={16} />
          </button>
        </div>

        {/* Sugarcane-themed Stamina Progress Line along bottom edge of top bar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '5px',
          background: '#fef3c7',
          overflow: 'hidden',
          borderRadius: '0 0 14px 14px',
        }}>
          <div style={{
            width: `${Math.max(0, Math.min(100, stats.stamina ?? 100))}%`,
            height: '100%',
            background: (stats.stamina ?? 100) > 30 ? 'linear-gradient(90deg, #16a34a, #f59e0b)' : 'linear-gradient(90deg, #dc2626, #b91c1c)',
            transition: 'width 0.15s ease',
          }} />
        </div>
      </header>

      {/* 3. DIRECTIONAL TAMIL VOICE CUE POPUP WITH AI SPECTATOR CAPTIONS (DOCKED TO THE SIDE) */}
      {currentVoiceCue && (
        <aside
          className="voice-cue-banner"
          aria-live="polite"
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            right: 'clamp(1rem, 2.5vw, 2.5rem)',
            top: '45%',
            transform: 'translateY(-50%)',
            background: currentVoiceCue.urgency === 'CLIMAX' || currentVoiceCue.angleTarget === 'STRIKE'
              ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
              : currentVoiceCue.angleTarget === 'MISSED'
              ? 'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)'
              : 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
            color: '#ffffff',
            border: '2.5px solid #fde047',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(250, 204, 21, 0.4)',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            animation: 'fadeInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            zIndex: 32,
            borderRadius: '18px',
            width: 'clamp(260px, 25vw, 340px)',
            maxWidth: 'calc(100vw - 2rem)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Speaker Persona Chip + Audio Waveform EQ Bars */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 900,
              color: '#fef08a',
              letterSpacing: '0.03em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(0,0,0,0.35)',
              padding: '0.2rem 0.55rem',
              borderRadius: '12px',
            }}>
              <span>{currentVoiceCue.speakerAvatar || '🗣️'}</span>
              <span>{currentVoiceCue.speakerName || 'கூட்டம் (Audience)'}</span>
            </span>

            {/* Animated Soundwave EQ Bars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span className="eq-bar eq-bar-1" />
              <span className="eq-bar eq-bar-2" />
              <span className="eq-bar eq-bar-3" />
              <span className="eq-bar eq-bar-4" />
            </div>
          </div>

          {/* Directional Icon + Tamil Call Text */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '12px',
              padding: '0.55rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {renderVoiceIcon(currentVoiceCue.angleTarget)}
            </div>

            <div style={{
              fontSize: 'clamp(1.2rem, 1.8vw, 1.55rem)',
              fontFamily: 'var(--font-tamil)',
              fontWeight: 900,
              lineHeight: 1.2,
              letterSpacing: '0.01em',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
              textAlign: 'left',
            }}>
              {currentVoiceCue.tamilText}
            </div>
          </div>

          {/* English Guidance & Phonetics */}
          <div style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#fef08a',
            lineHeight: 1.35,
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            paddingTop: '0.45rem',
            textAlign: 'left',
          }}>
            <div>{currentVoiceCue.englishText}</div>
            {currentVoiceCue.phoneticText && (
              <div style={{ opacity: 0.85, fontStyle: 'italic', fontSize: '0.76rem', marginTop: '0.15rem' }}>
                ({currentVoiceCue.phoneticText})
              </div>
            )}
          </div>
        </aside>
      )}

      {/* 5. HIT FEEDBACK FLOATING POPUP */}
      {hitFeedback && (
        <div style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 40,
          animation: 'feedbackPop 0.8s ease-out forwards',
          textAlign: 'center',
        }}>
          <div style={{
            background: hitFeedback.quality === 'PERFECT' ? 'var(--kumkum)' : 'var(--saffron)',
            color: '#ffffff',
            border: 'var(--border-thick)',
            boxShadow: 'var(--shadow-hard)',
            padding: '0.6rem 1.6rem',
            fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
            fontWeight: 900,
            fontFamily: 'var(--font-tamil)',
            textShadow: '2px 2px 0px #1c1917',
          }}>
            {hitFeedback.quality === 'PERFECT' && 'அற்புதம்! PERFECT HIT!'}
            {hitFeedback.quality === 'GREAT' && 'நன்று! GREAT HIT!'}
            {hitFeedback.quality === 'GOOD' && 'நல்ல அடி! GOOD HIT!'}
          </div>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 900,
            color: '#fef08a',
            marginTop: '0.2rem',
            textShadow: '1px 1px 2px #000000',
          }}>
            +{hitFeedback.points} PTS
          </div>
        </div>
      )}

      {/* 6. DESKTOP HELPER HINT & SWING BUTTON (SLEEK & UNOBTRUSIVE) */}
      <footer className="hud-desktop-hint" style={{
        alignSelf: 'center',
        pointerEvents: 'auto',
        background: 'rgba(28, 25, 23, 0.82)',
        backdropFilter: 'blur(6px)',
        color: '#fef3c7',
        border: '1.5px solid rgba(255,255,255,0.25)',
        borderRadius: '24px',
        padding: '0.4rem 1.4rem',
        fontSize: '0.8rem',
        fontWeight: 700,
        zIndex: 28,
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
      }}>
        <span>WASD: Move</span>
        <span>•</span>
        <span>Mouse: Look</span>
        <span>•</span>
        <span>Shift: Sprint</span>
        <span>•</span>
        <button
          className={`btn-brutal ${navMetrics.isInStrikingRange ? 'danger' : 'primary'}`}
          style={{
            padding: '0.25rem 0.85rem',
            fontSize: '0.82rem',
            borderRadius: '16px',
            boxShadow: navMetrics.isInStrikingRange ? '0 0 14px rgba(220, 38, 38, 0.8)' : 'var(--shadow-hard-sm)',
            cursor: 'pointer',
          }}
          onClick={onSwing}
          title="Swing Lathi Stick (Space / Left Click)"
        >
          <Crosshair size={14} /> அடி! SWING (SPACE)
        </button>
      </footer>
    </div>
  );
};
