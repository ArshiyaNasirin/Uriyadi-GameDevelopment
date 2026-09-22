import React from 'react';
import { ArrowLeft, Volume2, Globe, Eye, MousePointer } from 'lucide-react';
import { SettingsConfig } from '../types';
import { audioEngine } from '../audio/WebAudioEngine';

interface SettingsModalProps {
  settings: SettingsConfig;
  onUpdateSettings: (newSettings: SettingsConfig) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const handleChange = (key: keyof SettingsConfig, value: unknown) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);

    if (key.includes('Volume')) {
      audioEngine.setVolumes(
        updated.masterVolume,
        updated.musicVolume,
        updated.sfxVolume,
        updated.voiceVolume
      );
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{
        maxWidth: '640px',
        padding: 'clamp(1rem, 2.5vh, 2rem)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <span className="sticker yellow">CONFIGURATION</span>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', fontWeight: 900, marginTop: '0.2rem' }}>
              SETTINGS (அமைப்புகள்)
            </h2>
          </div>
          <button className="btn-brutal" onClick={onClose}>
            <ArrowLeft size={18} /> BACK
          </button>
        </div>

        {/* Sliders and Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Master Volume */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Volume2 size={16} /> MASTER AUDIO VOLUME
              </span>
              <span>{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => handleChange('masterVolume', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--terracotta)', marginTop: '0.4rem' }}
            />
          </div>

          {/* Music Volume (Thavil & Nadaswaram) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800 }}>
              <span>FESTIVAL MUSIC (தவில் & நாதஸ்வரம்)</span>
              <span>{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => handleChange('musicVolume', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--terracotta)', marginTop: '0.4rem' }}
            />
          </div>

          {/* Directional Voice Volume */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800 }}>
              <span>DIRECTIONAL TAMIL VOICE GUIDANCE</span>
              <span>{Math.round(settings.voiceVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.voiceVolume}
              onChange={(e) => handleChange('voiceVolume', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--terracotta)', marginTop: '0.4rem' }}
            />
          </div>

          {/* Blindfold Opacity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Eye size={16} /> BLINDFOLD FABRIC OPACITY (கண்கட்டு அடர்த்தி)
              </span>
              <span>{Math.round(settings.blindfoldOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="0.98"
              step="0.02"
              value={settings.blindfoldOpacity}
              onChange={(e) => handleChange('blindfoldOpacity', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--kumkum)', marginTop: '0.4rem' }}
            />
          </div>

          {/* Mouse Sensitivity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MousePointer size={16} /> MOUSE LOOK SENSITIVITY
              </span>
              <span>{(settings.mouseSensitivity * 1000).toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.001"
              max="0.005"
              step="0.0005"
              value={settings.mouseSensitivity}
              onChange={(e) => handleChange('mouseSensitivity', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--leaf-green)', marginTop: '0.4rem' }}
            />
          </div>

          {/* English Subtitles Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Globe size={16} /> ENGLISH SUBTITLE TOASTS
            </span>
            <input
              type="checkbox"
              checked={settings.subtitles}
              onChange={(e) => handleChange('subtitles', e.target.checked)}
              style={{ width: '22px', height: '22px', accentColor: 'var(--saffron)' }}
            />
          </div>

          {/* Graphics Quality Preset */}
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              GRAPHICS QUALITY (கிராபிக்ஸ் தரம்)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {(['LOW', 'MEDIUM', 'HIGH', 'ULTRA'] as const).map((q) => (
                <button
                  key={q}
                  className={`btn-brutal ${settings.graphicsQuality === q ? 'primary' : ''}`}
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', fontWeight: 900 }}
                  onClick={() => handleChange('graphicsQuality', q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
