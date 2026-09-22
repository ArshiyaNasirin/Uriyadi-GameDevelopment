export type GameState =
  | 'LANDING'
  | 'INTRO'
  | 'MENU'
  | 'STORY_SELECT'
  | 'CHARACTER_SELECT'
  | 'PLAYING'
  | 'BLINDFOLD_COUNTDOWN'
  | 'POT_SHATTERED'
  | 'RESULTS'
  | 'HERITAGE'
  | 'ACHIEVEMENTS'
  | 'SETTINGS'
  | 'PHOTO_MODE';

export type GameMode = 'STORY' | 'PRACTICE' | 'FESTIVAL' | 'TIME_TRIAL' | 'ENDLESS';

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'EXPERT';

export type HitQuality = 'MISS' | 'WEAK' | 'GOOD' | 'GREAT' | 'PERFECT';

export type TimeOfDay = 'DAY' | 'SUNSET' | 'NIGHT';

export interface CharacterConfig {
  id: string;
  name: string;
  tamilName: string;
  title: string;
  description: string;
  speed: number;
  strength: number;
  audioSense: number;
  avatarIcon: string;
}

export interface OutfitConfig {
  id: string;
  name: string;
  tamilName: string;
  description: string;
  colorHex: string;
  clothHex: string;
  goldBorder: boolean;
}

export interface StickConfig {
  id: string;
  name: string;
  tamilName: string;
  material: string;
  colorHex: string;
  gripHex: string;
  powerMultiplier: number;
}

export interface NavigationMetrics {
  distanceToPot: number;
  bearingToPot: number; // -180 to 180 deg
  isInStrikingRange: boolean;
  isFacingPot: boolean;
}

export interface LevelConfig {
  id: number;
  title: string;
  tamilTitle: string;
  subtitle: string;
  description: string;
  potHeight: number; // 2.5 to 4.5 meters
  potSwingSpeed: number; // multiplier
  windStrength: number; // 0 to 1
  timeLimitSeconds: number;
  pulleyActive: boolean; // boss or rope puller active
  pulleyFrequency: number;
  waterGuards: boolean;
  waterSplashInterval: number;
  blindfoldRequired: boolean;
  targetAccuracy: number;
  timeOfDay: TimeOfDay;
}

export interface PlayerStats {
  score: number;
  bestScore: number;
  accuracy: number;
  swings: number;
  hits: number;
  combo: number;
  highestCombo: number;
  timeElapsed: number;
  level: number;
  completedLevels: number[];
  unlockedModes: GameMode[];
  stamina?: number;
}

export interface SettingsConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  language: 'TA' | 'EN';
  blindfoldOpacity: number; // 0.6 to 0.98
  mouseSensitivity: number;
  cameraShake: boolean;
  subtitles: boolean;
  graphicsQuality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';
  haptics: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  tamilTitle: string;
  description: string;
  unlocked: boolean;
  icon: string;
  unlockedAt?: string;
}

export interface HeritageItem {
  id: string;
  title: string;
  tamilTitle: string;
  category: 'GAME' | 'RITUAL' | 'ART' | 'MUSIC' | 'FOOD' | 'ARCHITECTURE';
  summary: string;
  details: string[];
  culturalSignificance: string;
  tag: string;
  icon: string;
}

export interface DirectionalVoiceCue {
  id: string;
  speakerName: string;
  speakerRole: 'ELDER' | 'FRIEND' | 'VILLAGE_WOMAN' | 'KIDS' | 'RIVAL';
  speakerAvatar: string;
  tamilText: string;
  englishText: string;
  phoneticText?: string;
  urgency: 'NORMAL' | 'HIGH' | 'CLIMAX';
  angleTarget: 'LEFT' | 'RIGHT' | 'FORWARD' | 'CLOSE' | 'NOW' | 'STRIKE' | 'CELEBRATE' | 'MISSED';
  pitch?: number;
  rate?: number;
}
