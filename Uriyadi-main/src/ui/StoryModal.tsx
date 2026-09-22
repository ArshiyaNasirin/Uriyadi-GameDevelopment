import React from 'react';
import { LevelConfig } from '../types';
import { Play, ArrowLeft, CheckSquare, Square, ShieldAlert } from 'lucide-react';

interface StoryModalProps {
  level: LevelConfig;
  onStartLevel: () => void;
  onBack: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ level, onStartLevel, onBack }) => {
  return (
    <div className="modal-backdrop" style={{ zIndex: 40 }}>
      <div className="modal-card" style={{
        maxWidth: '700px',
        padding: 'clamp(1rem, 2.5vh, 2rem)',
      }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="sticker red">MISSION BRIEFING // LEVEL {level.id}</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--terracotta)' }}>
            {level.subtitle}
          </span>
        </div>

        {/* Titles */}
        <div style={{
          fontSize: '2rem',
          fontFamily: 'var(--font-tamil)',
          fontWeight: 900,
          color: 'var(--kumkum)',
        }}>
          {level.tamilTitle}
        </div>
        <h2 style={{
          fontSize: '2.4rem',
          fontFamily: 'var(--font-serif)',
          fontWeight: 900,
          color: '#1c1917',
          marginTop: '0.2rem',
        }}>
          {level.title}
        </h2>

        {/* Narrative Description */}
        <p style={{
          fontSize: '1.1rem',
          color: '#44403c',
          lineHeight: 1.5,
          marginTop: '1rem',
          background: 'var(--saffron-light)',
          border: 'var(--border-thin)',
          padding: '1rem',
          boxShadow: 'var(--shadow-hard-sm)',
        }}>
          {level.description}
        </p>

        {/* Mission Checklist */}
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            TACTICAL OBJECTIVES:
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>
              <CheckSquare size={18} color="var(--leaf-green)" />
              <span>Step into Kovilur Arena</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>
              <CheckSquare size={18} color="var(--leaf-green)" />
              <span>Grip the carved wooden lathi</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>
              <Square size={18} color="var(--terracotta)" />
              <span>Locate pot via spatial crowd shouts</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>
              <Square size={18} color="var(--kumkum)" />
              <span>Time stick swing & shatter pot</span>
            </div>
          </div>
        </div>

        {/* Warning if pulley active */}
        {level.pulleyActive && (
          <div style={{
            background: 'var(--kumkum)',
            color: '#ffffff',
            border: 'var(--border-thin)',
            padding: '0.6rem 1rem',
            marginTop: '1.2rem',
            fontSize: '0.9rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}>
            <ShieldAlert size={20} />
            <span>
              ⚠️ BOSS CHALLENGE: Rope Master Periya Chinna will jerk the pot upward!
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <button className="btn-brutal" onClick={onBack}>
            <ArrowLeft size={18} /> BACK
          </button>
          <button className="btn-brutal primary" style={{ fontSize: '1.2rem', padding: '0.9rem 2rem' }} onClick={onStartLevel}>
            <Play size={20} fill="#1c1917" />
            START LEVEL →
          </button>
        </div>
      </div>
    </div>
  );
};
