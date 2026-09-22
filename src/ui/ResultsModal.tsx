import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, ArrowRight, Menu } from 'lucide-react';
import { HitQuality } from '../types';

interface ResultsModalProps {
  isVictory: boolean;
  score: number;
  bestScore: number;
  timeElapsed: number;
  accuracy: number;
  hitQuality: HitQuality;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRetry: () => void;
  onHome: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isVictory,
  score,
  bestScore,
  timeElapsed,
  accuracy,
  hitQuality,
  hasNextLevel,
  onNextLevel,
  onRetry,
  onHome,
}) => {
  useEffect(() => {
    if (isVictory) {
      // Celebratory multi-color confetti burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#dc2626', '#16a34a', '#fbbf24', '#ec4899'],
      });
    }
  }, [isVictory]);

  const getRank = () => {
    if (!isVictory) return { rank: 'D', title: 'CHALLENGER', color: '#78716c' };
    if (accuracy >= 80 && timeElapsed < 25) return { rank: 'S', title: 'VILLAGE CHAMPION', color: 'var(--kumkum)' };
    if (accuracy >= 60 || timeElapsed < 35) return { rank: 'A', title: 'TEMPLE HERO', color: 'var(--saffron)' };
    return { rank: 'B', title: 'AGILE RUNNER', color: 'var(--leaf-green)' };
  };

  const rankInfo = getRank();

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{
        maxWidth: '640px',
        padding: 'clamp(1.2rem, 2.5vh, 2.2rem) clamp(1rem, 2.5vw, 2rem)',
        textAlign: 'center',
      }}>
        {/* Banner */}
        <div style={{ display: 'inline-block', marginBottom: '0.8rem' }}>
          <span className={`sticker ${isVictory ? 'green' : 'red'}`} style={{ fontSize: '1rem' }}>
            {isVictory ? 'MISSION ACCOMPLISHED // VICTORY' : 'TIME EXPIRED // TRY AGAIN'}
          </span>
        </div>

        {/* Tamil & English Victory Heading */}
        <div style={{
          fontSize: '3.2rem',
          fontFamily: 'var(--font-tamil)',
          fontWeight: 900,
          color: isVictory ? 'var(--leaf-green)' : 'var(--kumkum)',
          lineHeight: 1.1,
        }}>
          {isVictory ? 'வெற்றி!' : 'தோல்வி!'}
        </div>
        <h2 style={{
          fontSize: '2.4rem',
          fontFamily: 'var(--font-serif)',
          fontWeight: 900,
          color: '#1c1917',
          marginTop: '0.2rem',
        }}>
          {isVictory ? 'THE POT HAS SHATTERED!' : 'THE FESTIVAL POT SURVIVED!'}
        </h2>

        {/* Rank Badge */}
        <div style={{
          margin: '1.5rem auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1rem',
          background: '#1c1917',
          color: '#ffffff',
          border: 'var(--border-thick)',
          padding: '0.8rem 1.8rem',
          boxShadow: 'var(--shadow-hard)',
        }}>
          <div style={{ fontSize: '2.8rem', fontWeight: 900, color: rankInfo.color, lineHeight: 1 }}>
            {rankInfo.rank}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', color: '#a8a29e', fontWeight: 800 }}>FESTIVAL STATUS</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fef3c7' }}>{rankInfo.title}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.8rem',
          margin: '1.5rem 0',
          textAlign: 'left',
        }}>
          <div style={{ background: '#f5f5f4', border: 'var(--border-thin)', padding: '0.8rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#78716c' }}>ROUND SCORE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--leaf-green)' }}>{score} PTS</div>
          </div>
          <div style={{ background: '#f5f5f4', border: 'var(--border-thin)', padding: '0.8rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#78716c' }}>BEST SCORE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--saffron)' }}>{Math.max(bestScore, score)} PTS</div>
          </div>
          <div style={{ background: '#f5f5f4', border: 'var(--border-thin)', padding: '0.8rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#78716c' }}>TIME TAKEN</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1c1917' }}>{timeElapsed.toFixed(1)}s</div>
          </div>
          <div style={{ background: '#f5f5f4', border: 'var(--border-thin)', padding: '0.8rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#78716c' }}>ACCURACY</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1c1917' }}>{accuracy}%</div>
          </div>
          <div style={{ background: '#f5f5f4', border: 'var(--border-thin)', padding: '0.8rem 1rem', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#78716c' }}>STRIKE QUALITY</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: hitQuality === 'PERFECT' ? 'var(--kumkum)' : 'var(--saffron)' }}>{hitQuality}</div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-brutal" onClick={onHome}>
            <Menu size={18} /> MENU
          </button>
          <button className="btn-brutal" onClick={onRetry}>
            <RotateCcw size={18} /> RETRY
          </button>
          {isVictory && hasNextLevel && (
            <button className="btn-brutal primary" onClick={onNextLevel}>
              NEXT LEVEL <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
