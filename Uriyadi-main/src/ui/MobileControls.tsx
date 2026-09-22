import React, { useRef, useState } from 'react';
import { Zap } from 'lucide-react';
import { PlayerController } from '../game/PlayerController';

interface MobileControlsProps {
  player: PlayerController | null;
  onSwing: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ player, onSwing }) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSprintActive, setIsSprintActive] = useState(false);

  // Joystick touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateJoystick(e.touches[0]);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    updateJoystick(e.touches[0]);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    if (player) {
      player.moveForward = false;
      player.moveBackward = false;
      player.moveLeft = false;
      player.moveRight = false;
    }
  };

  const updateJoystick = (touch: React.Touch) => {
    if (!joystickRef.current || !player) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const distance = Math.min(45, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);

    const kx = Math.cos(angle) * distance;
    const ky = Math.sin(angle) * distance;
    setKnobPos({ x: kx, y: ky });

    // Map to player inputs
    player.moveForward = ky < -12;
    player.moveBackward = ky > 12;
    player.moveLeft = kx < -12;
    player.moveRight = kx > 12;
  };

  // Toggle sprint
  const toggleSprint = () => {
    const next = !isSprintActive;
    setIsSprintActive(next);
    if (player) player.isSprinting = next;
  };

  // Touch look zone in center/right of screen
  const lookTouchId = useRef<number | null>(null);
  const prevLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleLookTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    lookTouchId.current = touch.identifier;
    prevLookPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      if (touch.identifier === lookTouchId.current && player) {
        const dx = touch.clientX - prevLookPos.current.x;
        const dy = touch.clientY - prevLookPos.current.y;
        player.handleMouseMove(dx * 1.5, dy * 1.5);
        prevLookPos.current = { x: touch.clientX, y: touch.clientY };
        break;
      }
    }
  };

  const handleLookTouchEnd = () => {
    lookTouchId.current = null;
  };

  return (
    <>
      {/* Touch Look Pan Area (Screen upper half and right) */}
      <div
        className="mobile-look-zone"
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          bottom: 180,
          zIndex: 26,
          touchAction: 'none',
        }}
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
      />

      {/* Mobile Bottom Bar Controls */}
      <div className="mobile-control-shell" style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 35,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}>
        {/* Left: Virtual Movement Joystick */}
        <div className="mobile-left-controls" style={{ display: 'flex', alignItems: 'center', gap: '1rem', pointerEvents: 'auto' }}>
          <div
            ref={joystickRef}
            className="mobile-joystick"
            style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.25)',
              border: '3px solid #f59e0b',
              boxShadow: 'var(--shadow-hard-sm)',
              position: 'relative',
              touchAction: 'none',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Inner Knob */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--saffron)',
                border: '2px solid #1c1917',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${knobPos.x}px), calc(-50% + ${knobPos.y}px))`,
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Sprint Button */}
          <button
            className={`btn-brutal mobile-sprint-button ${isSprintActive ? 'danger' : ''}`}
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              padding: 0,
            }}
            onClick={toggleSprint}
          >
            <Zap size={22} />
          </button>
        </div>

        {/* Right: Big SWING Strike Button */}
        <div style={{ pointerEvents: 'auto' }}>
          <button
            className="btn-brutal danger mobile-swing-button"
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              fontSize: '1.4rem',
              fontWeight: 900,
              fontFamily: 'var(--font-tamil)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-hard)',
            }}
            onClick={() => {
              if ('vibrate' in navigator) navigator.vibrate(40);
              onSwing();
            }}
          >
            <div>அடி!</div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-sans)', textTransform: 'uppercase' }}>
              SWING
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
