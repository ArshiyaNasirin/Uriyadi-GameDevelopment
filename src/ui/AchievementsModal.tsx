import React from 'react';
import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementsModalProps {
  achievements: Achievement[];
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ achievements, onClose }) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{
        maxWidth: '800px',
        maxHeight: '92vh',
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
            <span className="sticker yellow">FESTIVAL HONORS (சாதனைகள்)</span>
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', fontWeight: 900, marginTop: '0.3rem' }}>
              UNLOCKED: {unlockedCount} / {achievements.length}
            </h2>
          </div>
          <button className="btn-brutal" onClick={onClose}>
            <ArrowLeft size={18} /> BACK
          </button>
        </div>

        {/* List of achievements */}
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
        }}>
          {achievements.map((ach) => (
            <div
              key={ach.id}
              style={{
                padding: '1.2rem',
                border: 'var(--border-thin)',
                background: ach.unlocked ? '#ffffff' : '#f5f5f4',
                boxShadow: ach.unlocked ? 'var(--shadow-hard-sm)' : 'none',
                opacity: ach.unlocked ? 1 : 0.65,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div style={{ fontSize: '2.4rem' }}>{ach.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-tamil)',
                    fontWeight: 800,
                    color: 'var(--terracotta)',
                  }}>
                    {ach.tamilTitle}
                  </div>
                  {ach.unlocked ? (
                    <CheckCircle2 size={18} color="var(--leaf-green)" />
                  ) : (
                    <Lock size={16} color="#a8a29e" />
                  )}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1c1917' }}>{ach.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#57534e', marginTop: '0.2rem' }}>
                  {ach.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
