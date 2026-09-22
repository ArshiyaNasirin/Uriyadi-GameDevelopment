import React, { useEffect, useRef, useState } from 'react';
import { GameWorld } from './game/GameWorld';
import { LandingOverlay } from './ui/LandingOverlay';
import { MainMenu } from './ui/MainMenu';
import { GameHUD } from './ui/GameHUD';
import { MobileControls } from './ui/MobileControls';
import { StoryModal } from './ui/StoryModal';
import { ResultsModal } from './ui/ResultsModal';
import { HeritageModal } from './ui/HeritageModal';
import { AchievementsModal } from './ui/AchievementsModal';
import { SettingsModal } from './ui/SettingsModal';
import { PhotoModeModal } from './ui/PhotoModeModal';
import { CharacterSelectModal } from './ui/CharacterSelectModal';

import { STORY_LEVELS } from './data/storyLevels';
import { INITIAL_ACHIEVEMENTS } from './data/achievementsData';
import { CHARACTERS, OUTFITS, STICKS } from './data/characterData';
import { audioEngine } from './audio/WebAudioEngine';
import {
  Achievement,
  CharacterConfig,
  DirectionalVoiceCue,
  GameMode,
  GameState,
  HitQuality,
  LevelConfig,
  NavigationMetrics,
  OutfitConfig,
  PlayerStats,
  SettingsConfig,
  StickConfig,
} from './types';

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameWorldRef = useRef<GameWorld | null>(null);

  // Application state
  const [gameState, setGameState] = useState<GameState>('LANDING');
  const [, setCurrentMode] = useState<GameMode>('STORY');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  // Character & Customization state
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterConfig>(CHARACTERS[0]);
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitConfig>(OUTFITS[0]);
  const [selectedStick, setSelectedStick] = useState<StickConfig>(STICKS[0]);

  // Navigation & Aiming state
  const [navMetrics, setNavMetrics] = useState<NavigationMetrics>({
    distanceToPot: 3.5,
    bearingToPot: 0,
    isInStrikingRange: false,
    isFacingPot: true,
  });
  const [isBlindfoldPeekActive, setIsBlindfoldPeekActive] = useState(false);

  // Gameplay session state
  const [currentVoiceCue, setCurrentVoiceCue] = useState<DirectionalVoiceCue | null>(null);
  const voiceCueTimeoutRef = useRef<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [lastHitQuality, setLastHitQuality] = useState<HitQuality>('GOOD');
  const [hitFeedback, setHitFeedback] = useState<{ quality: HitQuality; points: number } | null>(null);
  const [isRoundVictory, setIsRoundVictory] = useState(false);

  // Stats & Progress
  const [stats, setStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('uriyadi_stats_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      score: 0,
      bestScore: 0,
      accuracy: 100,
      swings: 0,
      hits: 0,
      combo: 1,
      highestCombo: 1,
      timeElapsed: 0,
      level: 1,
      completedLevels: [],
      unlockedModes: ['STORY', 'PRACTICE', 'FESTIVAL', 'TIME_TRIAL', 'ENDLESS'],
    };
  });

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('uriyadi_achievements_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_ACHIEVEMENTS;
  });

  // Settings
  const [settings, setSettings] = useState<SettingsConfig>(() => {
    const saved = localStorage.getItem('uriyadi_settings_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      masterVolume: 0.9,
      musicVolume: 0.7,
      sfxVolume: 0.85,
      voiceVolume: 1.0,
      language: 'TA',
      blindfoldOpacity: 0.88,
      mouseSensitivity: 0.0022,
      cameraShake: true,
      subtitles: true,
      graphicsQuality: 'HIGH',
      haptics: true,
    };
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('uriyadi_stats_v1', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('uriyadi_achievements_v1', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('uriyadi_settings_v1', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (gameWorldRef.current) {
      gameWorldRef.current.setGraphicsQuality(settings.graphicsQuality);
    }
  }, [settings.graphicsQuality]);

  // Apply character/outfit/stick customization whenever changed
  useEffect(() => {
    if (gameWorldRef.current) {
      gameWorldRef.current.player.applyCustomization(selectedCharacter, selectedOutfit, selectedStick);
    }
  }, [selectedCharacter, selectedOutfit, selectedStick]);

  // Initialize GameWorld once
  useEffect(() => {
    if (!containerRef.current) return;

    const gw = new GameWorld(containerRef.current);
    gameWorldRef.current = gw;

    gw.callbacks = {
      onPotHit: (quality: HitQuality, points: number) => {
        setLastHitQuality(quality);
        setHitFeedback({ quality, points });
        setTimeout(() => {
          setHitFeedback(null);
        }, 1200);
        unlockAchievement('first_strike');
        if (quality === 'PERFECT') unlockAchievement('perfect_hit');

        setStats((prev) => {
          const newCombo = prev.combo + 1;
          if (newCombo >= 5) unlockAchievement('combo_king');
          return {
            ...prev,
            hits: prev.hits + 1,
            combo: newCombo,
            highestCombo: Math.max(prev.highestCombo, newCombo),
            score: prev.score + points * prev.combo,
          };
        });
      },

      onPotShatter: (roundStats) => {
        unlockAchievement('pot_shattered');
        if (STORY_LEVELS[currentLevelIndex].blindfoldRequired) {
          unlockAchievement('blindfolded_master');
        }
        if (roundStats.time < 15) {
          unlockAchievement('speed_demon');
        }
        if (currentLevelIndex === 3) {
          unlockAchievement('champion_periya');
        }

        setIsRoundVictory(true);
        setStats((prev) => ({
          ...prev,
          bestScore: Math.max(prev.bestScore, prev.score),
          timeElapsed: roundStats.time,
          accuracy: roundStats.accuracy,
          completedLevels: Array.from(new Set([...prev.completedLevels, STORY_LEVELS[currentLevelIndex].id])),
        }));

        setTimeout(() => {
          setGameState('RESULTS');
        }, 1200);
      },

      onVoiceCue: (cue: DirectionalVoiceCue) => {
        setCurrentVoiceCue(cue);
        if (voiceCueTimeoutRef.current !== null) {
          clearTimeout(voiceCueTimeoutRef.current);
        }
        voiceCueTimeoutRef.current = window.setTimeout(() => {
          setCurrentVoiceCue(null);
        }, 2200);
      },

      onNavigationUpdate: (metrics: NavigationMetrics) => {
        setNavMetrics(metrics);
      },
    };

    // Load initial scene for main menu backdrop
    gw.loadLevel(STORY_LEVELS[0]);
    gw.player.applyCustomization(selectedCharacter, selectedOutfit, selectedStick);
    gw.start();

    return () => {
      gw.destroy();
    };
  }, []);

  const unlockAchievement = (id: string) => {
    setAchievements((prev) =>
      prev.map((a) => (a.id === id && !a.unlocked ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a))
    );
  };

  // Keyboard & Mouse controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const gw = gameWorldRef.current;
      if (!gw) return;

      if (e.code === 'KeyW' || e.code === 'ArrowUp') gw.player.moveForward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') gw.player.moveBackward = true;
      if (e.code === 'KeyA') gw.player.moveLeft = true;
      if (e.code === 'KeyD') gw.player.moveRight = true;

      // Turn left & right via Q/E or Left/Right arrows
      if (e.code === 'KeyQ' || e.code === 'ArrowLeft') gw.player.turnLeft = true;
      if (e.code === 'KeyE' || e.code === 'ArrowRight') gw.player.turnRight = true;

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') gw.player.isSprinting = true;

      if (e.code === 'Space' || e.code === 'Enter') {
        if (gameState === 'PLAYING') {
          handleSwing();
        }
      }

      if (e.code === 'Escape') {
        if (gameState === 'PLAYING') setGameState('MENU');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const gw = gameWorldRef.current;
      if (!gw) return;

      if (e.code === 'KeyW' || e.code === 'ArrowUp') gw.player.moveForward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') gw.player.moveBackward = false;
      if (e.code === 'KeyA') gw.player.moveLeft = false;
      if (e.code === 'KeyD') gw.player.moveRight = false;
      if (e.code === 'KeyQ' || e.code === 'ArrowLeft') gw.player.turnLeft = false;
      if (e.code === 'KeyE' || e.code === 'ArrowRight') gw.player.turnRight = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') gw.player.isSprinting = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Pointer lock & drag-to-look mouse movement
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isMouseDown = false;

    const handleMouseDown = () => {
      isMouseDown = true;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const gw = gameWorldRef.current;
      if (!gw) return;
      // Allow looking if pointer locked OR dragging mouse
      if (document.pointerLockElement === container || isMouseDown || gameState === 'PHOTO_MODE') {
        gw.player.handleMouseMove(e.movementX, e.movementY);
      }
    };

    const handleClick = () => {
      if (gameState === 'PLAYING') {
        handleSwing();
      }
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
    };
  }, [gameState]);

  // Swing handler
  const handleSwing = () => {
    const gw = gameWorldRef.current;
    if (!gw) return;
    const didSwing = gw.player.swing();
    if (didSwing) {
      audioEngine.playStickWhoosh(1.2);
      setStats((prev) => ({ ...prev, swings: prev.swings + 1 }));
    }
  };

  // Gameplay countdown timer
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRoundVictory(false);
          setGameState('RESULTS');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Mode Selection
  const handleSelectMode = (mode: GameMode) => {
    setCurrentMode(mode);
    if (mode === 'STORY') {
      setGameState('STORY_SELECT');
    } else if (mode === 'PRACTICE') {
      const practiceConfig: LevelConfig = {
        ...STORY_LEVELS[0],
        title: 'Practice Arena',
        tamilTitle: 'பயிற்சி களம்',
        blindfoldRequired: false,
        timeLimitSeconds: 120,
      };
      startLevelWithConfig(practiceConfig);
    } else if (mode === 'TIME_TRIAL') {
      const trialConfig: LevelConfig = {
        ...STORY_LEVELS[1],
        title: 'Time Trial Sprint',
        tamilTitle: 'மின்னல் வேகம்',
        timeLimitSeconds: 30,
      };
      startLevelWithConfig(trialConfig);
    } else {
      startLevelWithConfig(STORY_LEVELS[1]);
    }
  };

  const startLevelWithConfig = (config: LevelConfig) => {
    const gw = gameWorldRef.current;
    if (gw) {
      gw.loadLevel(config);
      gw.player.applyCustomization(selectedCharacter, selectedOutfit, selectedStick);
      setTimeRemaining(config.timeLimitSeconds);
      setIsBlindfoldPeekActive(false);
      setHitFeedback(null);
      setStats((prev) => ({
        ...prev,
        score: 0,
        swings: 0,
        hits: 0,
        combo: 1,
        accuracy: 100,
        timeElapsed: 0,
      }));
      audioEngine.setMusicMood('GAMEPLAY');
    }
    setGameState('PLAYING');
  };

  const startStoryLevel = (index: number) => {
    setCurrentLevelIndex(index);
    startLevelWithConfig(STORY_LEVELS[index]);
  };

  const handleNextStoryLevel = () => {
    if (currentLevelIndex < STORY_LEVELS.length - 1) {
      startStoryLevel(currentLevelIndex + 1);
    } else {
      setGameState('MENU');
    }
  };

  return (
    <div className="app-shell" style={{ position: 'relative', width: '100vw', height: '100dvh', minHeight: '100dvh', overflow: 'hidden' }}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: gameState === 'PLAYING' ? 'crosshair' : 'default' }} />

      {/* Halftone texture overlay */}
      <div className="halftone-overlay" />

      {/* 1. Landing Experience */}
      {gameState === 'LANDING' && (
        <LandingOverlay
          onEnterFestival={() => setGameState('MENU')}
          onOpenStory={() => {
            audioEngine.init();
            audioEngine.startMusic('VILLAGE');
            setGameState('HERITAGE');
          }}
        />
      )}

      {/* 2. Main Menu */}
      {gameState === 'MENU' && (
        <MainMenu
          onSelectMode={handleSelectMode}
          onOpenCharacterSelect={() => setGameState('CHARACTER_SELECT')}
          onOpenHeritage={() => {
            unlockAchievement('tamil_legacy');
            setGameState('HERITAGE');
          }}
          onOpenAchievements={() => setGameState('ACHIEVEMENTS')}
          onOpenSettings={() => setGameState('SETTINGS')}
          onOpenPhotoMode={() => setGameState('PHOTO_MODE')}
        />
      )}

      {/* 3. Character & Outfit Select Modal */}
      {gameState === 'CHARACTER_SELECT' && (
        <CharacterSelectModal
          selectedCharacter={selectedCharacter}
          selectedOutfit={selectedOutfit}
          selectedStick={selectedStick}
          onConfirm={(char, outfit, stick) => {
            setSelectedCharacter(char);
            setSelectedOutfit(outfit);
            setSelectedStick(stick);
            setGameState('MENU');
          }}
          onBack={() => setGameState('MENU')}
        />
      )}

      {/* 4. Story Level Briefing */}
      {gameState === 'STORY_SELECT' && (
        <StoryModal
          level={STORY_LEVELS[currentLevelIndex]}
          onStartLevel={() => startStoryLevel(currentLevelIndex)}
          onBack={() => setGameState('MENU')}
        />
      )}

      {/* 5. Active Gameplay HUD */}
      {gameState === 'PLAYING' && (
        <>
          <GameHUD
            level={STORY_LEVELS[currentLevelIndex]}
            stats={stats}
            settings={settings}
            timeRemaining={timeRemaining}
            currentVoiceCue={currentVoiceCue}
            navMetrics={navMetrics}
            player={gameWorldRef.current ? gameWorldRef.current.player : null}
            onPause={() => setGameState('MENU')}
            onSwing={handleSwing}
            onToggleBlindfoldPeek={() => setIsBlindfoldPeekActive((p) => !p)}
            isBlindfoldPeekActive={isBlindfoldPeekActive}
            hitFeedback={hitFeedback}
          />
          <MobileControls
            player={gameWorldRef.current ? gameWorldRef.current.player : null}
            onSwing={handleSwing}
          />
        </>
      )}

      {/* 6. Round Results Modal */}
      {gameState === 'RESULTS' && (
        <ResultsModal
          isVictory={isRoundVictory}
          score={stats.score}
          bestScore={stats.bestScore}
          timeElapsed={stats.timeElapsed}
          accuracy={stats.accuracy}
          hitQuality={lastHitQuality}
          hasNextLevel={currentLevelIndex < STORY_LEVELS.length - 1}
          onNextLevel={handleNextStoryLevel}
          onRetry={() => startStoryLevel(currentLevelIndex)}
          onHome={() => setGameState('MENU')}
        />
      )}

      {/* 7. Heritage Showcase */}
      {gameState === 'HERITAGE' && (
        <HeritageModal onClose={() => setGameState('MENU')} />
      )}

      {/* 8. Achievements */}
      {gameState === 'ACHIEVEMENTS' && (
        <AchievementsModal
          achievements={achievements}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* 9. Settings */}
      {gameState === 'SETTINGS' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* 10. Photo Mode */}
      {gameState === 'PHOTO_MODE' && (
        <PhotoModeModal
          gameWorld={gameWorldRef.current}
          onClose={() => setGameState('MENU')}
        />
      )}
    </div>
  );
};
