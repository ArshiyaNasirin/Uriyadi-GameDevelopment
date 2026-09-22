import { DirectionalVoiceCue, HitQuality } from '../types';

class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private isInitialized = false;

  private isMusicPlaying = false;
  private musicInterval: number | null = null;
  private musicMood: 'VILLAGE' | 'COUNTDOWN' | 'GAMEPLAY' | 'CELEBRATION' = 'VILLAGE';

  // Master volumes
  private volumes = {
    master: 0.9,
    music: 0.7,
    sfx: 0.85,
    voice: 1.0,
  };

  // Dedicated Native Tamil Speech Audio Cache
  private tamilAudioCache = new Map<string, HTMLAudioElement>();
  private activeVoiceAudio: HTMLAudioElement | null = null;

  public init() {
    if (this.isInitialized && this.ctx && this.ctx.state === 'running') return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volumes.master, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.volumes.music, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.volumes.sfx, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.voiceGain = this.ctx.createGain();
      this.voiceGain.gain.setValueAtTime(this.volumes.voice, this.ctx.currentTime);
      this.voiceGain.connect(this.masterGain);

      this.isInitialized = true;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const resumeAudio = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      };
      window.addEventListener('click', resumeAudio, { passive: true });
      window.addEventListener('keydown', resumeAudio, { passive: true });
      window.addEventListener('touchstart', resumeAudio, { passive: true });

      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  public setVolumes(master: number, music: number, sfx: number, voice: number) {
    this.volumes = { master, music, sfx, voice };
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.masterGain) this.masterGain.gain.setTargetAtTime(master, now, 0.05);
    if (this.musicGain) this.musicGain.gain.setTargetAtTime(music, now, 0.05);
    if (this.sfxGain) this.sfxGain.gain.setTargetAtTime(sfx, now, 0.05);
    if (this.voiceGain) this.voiceGain.gain.setTargetAtTime(voice, now, 0.05);
  }

  // --- TEMPLE BELL ---
  public playTempleBell(pitch = 520, volume = 0.8) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Harmonic partials for authentic Indian temple brass bell
    const partials = [1, 2.76, 5.4, 8.93, 11.3];
    const decays = [3.5, 2.0, 1.2, 0.7, 0.4];
    const amps = [0.6, 0.35, 0.2, 0.12, 0.06];

    partials.forEach((mult, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(pitch * mult, now);

      gain.gain.setValueAtTime(amps[i] * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decays[i]);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now);
      osc.stop(now + decays[i]);
    });
  }

  // --- THAVIL DRUM BEATS ---
  public playThavilBeat(type: 'thud' | 'thap' | 'roll', volume = 0.7) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    if (type === 'thud') {
      // Deep punchy bass side (Thoppi)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

      gain.gain.setValueAtTime(volume * 0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === 'thap') {
      // High snappy Valanthalai side (stick slap)
      const osc = this.ctx.createOscillator();
      const noise = this.createNoiseBufferNode(0.08);
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(3, now);

      gain.gain.setValueAtTime(volume * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(filter);
      if (noise) noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } else {
      // Quick roll
      for (let j = 0; j < 3; j++) {
        setTimeout(() => this.playThavilBeat('thap', volume * 0.6), j * 35);
      }
    }
  }

  // --- NADASWARAM MELODIC PHRASE ---
  public playNadaswaramNote(freq: number, duration = 0.35, vibrato = true, volume = 0.5) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    subOsc.type = 'triangle';

    osc.frequency.setValueAtTime(freq, now);
    subOsc.frequency.setValueAtTime(freq * 0.5, now);

    // Characteristic double-reed nasal formant filter
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.Q.setValueAtTime(2.2, now);

    // Gamakam (microtonal slide/vibrato)
    if (vibrato) {
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(6.5, now);
      lfoGain.gain.setValueAtTime(freq * 0.025, now);
      lfo.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + duration);
    }

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + duration);
    subOsc.stop(now + duration);
  }

  // --- STICK WHOOSH ---
  public playStickWhoosh(speed = 1.0) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const duration = 0.22 / Math.max(0.6, speed);

    const noise = this.createNoiseBufferNode(duration);
    if (!noise) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(1800 * speed, now + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(400, now + duration);
    filter.Q.setValueAtTime(2.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.85 * this.volumes.sfx, now + duration * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
  }

  // --- POT HIT ---
  public playPotHit(quality: HitQuality) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Clay thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const startFreq = quality === 'PERFECT' ? 380 : quality === 'GREAT' ? 320 : 220;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.15);

    gain.gain.setValueAtTime(0.9 * this.volumes.sfx, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.21);

    // Sharp ceramic knock noise
    const noise = this.createNoiseBufferNode(0.1);
    if (noise) {
      const nFilter = this.ctx.createBiquadFilter();
      nFilter.type = 'highpass';
      nFilter.frequency.setValueAtTime(1200, now);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(quality === 'PERFECT' ? 0.8 : 0.4, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      noise.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(this.sfxGain);
    }
  }

  // --- ROPE CREAK ---
  public playRopeCreak(volume = 0.5) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const duration = 0.25;

    const noise = this.createNoiseBufferNode(duration);
    if (!noise) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(850, now);
    filter.frequency.linearRampToValueAtTime(1400, now + duration * 0.4);
    filter.frequency.linearRampToValueAtTime(600, now + duration);
    filter.Q.setValueAtTime(8.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(volume * 0.6 * this.volumes.sfx, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
  }

  // --- POT SHATTER (SIGNATURE CLIMAX AUDIO) ---
  public playPotShatter() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // 1. Heavy low impact explosion
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
    subGain.gain.setValueAtTime(1.0 * this.volumes.sfx, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.46);

    // 2. Ceramic shards splintering & crashing
    for (let i = 0; i < 4; i++) {
      const delay = i * 0.04;
      const shardNoise = this.createNoiseBufferNode(0.35);
      if (shardNoise) {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2500 + i * 800, now + delay);
        filter.Q.setValueAtTime(4.0, now + delay);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.7, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.28);

        shardNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
      }
    }

    // 3. Fluid turmeric water splash
    this.playWaterSplash(1.0);

    // 4. Temple bell chime celebration
    this.playTempleBell(650, 0.9);
    setTimeout(() => this.playTempleBell(880, 0.8), 250);
  }

  // --- WATER SPLASH ---
  public playWaterSplash(volume = 0.6) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const duration = 0.35;

    const noise = this.createNoiseBufferNode(duration);
    if (!noise) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
  }

  // --- CROWD CHEER & GASP ---
  public playCrowdReaction(type: 'gasp' | 'cheer' | 'celebrate') {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    if (type === 'gasp') {
      const noise = this.createNoiseBufferNode(0.3);
      if (!noise) return;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.linearRampToValueAtTime(400, now + 0.25);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
    } else {
      // Roar / Whistle
      const duration = type === 'celebrate' ? 2.5 : 1.2;
      const noise = this.createNoiseBufferNode(duration);
      if (!noise) return;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.linearRampToValueAtTime(1300, now + duration * 0.3);
      filter.frequency.exponentialRampToValueAtTime(700, now + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.85, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      // Whistle harmonics
      if (type === 'celebrate') {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.linearRampToValueAtTime(2400, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.9);
        oscGain.gain.setValueAtTime(0.3, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.91);
      }
    }
  }

  // --- DEDICATED NATIVE TAMIL VOICE AUDIO STREAM ---
  public playTamilVoiceAudio(tamilText: string, onFallback?: () => void) {
    try {
      const clean = tamilText.replace(/[!?,.']/g, '').trim();
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ta&client=tw-ob&q=${encodeURIComponent(clean)}`;

      let audio = this.tamilAudioCache.get(url);
      if (!audio) {
        audio = new Audio(url);
        this.tamilAudioCache.set(url, audio);
      }

      if (this.activeVoiceAudio) {
        this.activeVoiceAudio.pause();
        this.activeVoiceAudio.currentTime = 0;
      }

      this.activeVoiceAudio = audio;
      audio.currentTime = 0;
      audio.volume = Math.max(0.9, this.volumes.voice);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Tamil TTS stream error, running fallback:', err);
          if (onFallback) onFallback();
        });
      }
    } catch {
      if (onFallback) onFallback();
    }
  }

  // --- DIRECTIONAL TAMIL VOICE GUIDANCE (SPATIAL AUDIO + NATIVE TAMIL SPEECH) ---
  public playSpatialVoiceCue(cue: DirectionalVoiceCue, panX = 0, distance = 1) {
    // Ensure AudioContext is initialized and active
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.ctx || !this.voiceGain) return;

    // Positional stereo panning: -1 (full left) to +1 (full right)
    let panner: StereoPannerNode | null = null;
    try {
      if (this.ctx.createStereoPanner) {
        panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, panX)), this.ctx.currentTime);
        panner.connect(this.voiceGain);
      }
    } catch {
      panner = null;
    }

    const outputNode: AudioNode = panner || this.voiceGain;

    // 1. ALWAYS play procedural spatial vocal acoustic shout through stereo panner
    this.synthesizeTamilFormant(cue, outputNode, distance);

    // Climax crowd cheer accompaniment when in striking range
    if (cue.urgency === 'CLIMAX' || cue.angleTarget === 'STRIKE') {
      this.playCrowdReaction('cheer');
    }

    // 2. Play 100% Native Tamil Voice Audio Stream!
    this.playTamilVoiceAudio(cue.tamilText, () => {
      // Offline fallback: use speech synthesis with phonetic Tamil syllables
      this.playSpeechSynthesisFallback(cue);
    });
  }

  private playSpeechSynthesisFallback(cue: DirectionalVoiceCue) {
    if (!('speechSynthesis' in window)) return;
    try {
      const voices = window.speechSynthesis.getVoices();
      const tamilVoice = voices.find(v =>
        v.lang.toLowerCase().startsWith('ta') ||
        v.lang.toLowerCase().includes('ta-in') ||
        v.name.toLowerCase().includes('tamil')
      );

      let text = cue.tamilText;
      let lang = 'ta-IN';

      if (!tamilVoice) {
        // Phonetic Tamil syllables that pronounce authentic Tamil on any English TTS engine
        lang = 'en-US';
        if (cue.angleTarget === 'STRIKE') {
          text = 'Uh-dee! Uh-dee-daa Kathir uh-dee!!';
        } else if (cue.angleTarget === 'LEFT') {
          text = 'Ih-dhadhu! Ih-dhadhu pakkam thirumbu!';
        } else if (cue.angleTarget === 'RIGHT') {
          text = 'Vah-lah-dhu! Vah-lah-dhu pakkam vaa!';
        } else if (cue.angleTarget === 'CLOSE') {
          text = 'Paanai pakkathula vandhuttaa!';
        } else if (cue.angleTarget === 'MISSED') {
          text = 'Nool izhaila pochu! Marupadiyum adi!';
        } else {
          text = 'Moon-naadi vaa! Neera poppa!';
        }
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      if (tamilVoice) utterance.voice = tamilVoice;
      utterance.rate = cue.rate || 1.15;
      utterance.pitch = cue.pitch || 1.05;
      utterance.volume = Math.max(0.85, this.volumes.voice);

      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn('Fallback speech error:', e);
        }
      }, 20);
    } catch {}
  }

  private synthesizeTamilFormant(cue: DirectionalVoiceCue, destination: AudioNode, distance = 1) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const duration = 0.42;

    // Dual-oscillator formant synthesis for natural vocal acoustic shout
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter1 = this.ctx.createBiquadFilter();
    const filter2 = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    const baseFreq = cue.angleTarget === 'STRIKE' ? 360 : cue.angleTarget === 'LEFT' ? 310 : 270;
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + duration);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, now + duration);

    // Formant filter frequencies
    filter1.type = 'bandpass';
    filter2.type = 'bandpass';
    const f1 = cue.angleTarget === 'STRIKE' ? 950 : cue.angleTarget === 'LEFT' ? 1800 : 1300;
    const f2 = cue.angleTarget === 'STRIKE' ? 1700 : 2600;
    filter1.frequency.setValueAtTime(f1, now);
    filter1.Q.setValueAtTime(4.0, now);
    filter2.frequency.setValueAtTime(f2, now);
    filter2.Q.setValueAtTime(5.0, now);

    const distAtten = 1 / Math.max(0.5, distance * 0.7);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(Math.min(1.0, 0.75 * distAtten * this.volumes.voice), now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(filter1);
    osc2.connect(filter2);
    filter1.connect(gain);
    filter2.connect(gain);
    gain.connect(destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  // --- DYNAMIC FESTIVAL MUSIC LOOP ---
  public startMusic(mood: 'VILLAGE' | 'COUNTDOWN' | 'GAMEPLAY' | 'CELEBRATION' = 'VILLAGE') {
    this.musicMood = mood;
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // Raga Mohanam scale frequencies: S R2 G3 P D2 S' (C, D, E, G, A, C)
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];

    let step = 0;
    this.musicInterval = window.setInterval(() => {
      if (!this.isMusicPlaying || !this.ctx) return;

      // Authentic Thavil rhythmic pattern (Adhi Thaalam variations)
      if (step % 8 === 0) {
        this.playThavilBeat('thud', 0.8);
      } else if (step % 8 === 4) {
        this.playThavilBeat('thud', 0.6);
        this.playThavilBeat('thap', 0.5);
      } else if (step % 2 === 1) {
        this.playThavilBeat('thap', 0.4);
      }

      // Nadaswaram festive melodic riffs
      if (this.musicMood === 'GAMEPLAY' || this.musicMood === 'CELEBRATION') {
        if (step % 4 === 0) {
          const noteIndex = (step / 4) % scale.length;
          const freq = scale[noteIndex];
          this.playNadaswaramNote(freq, 0.28, true, 0.45);
        }
      } else if (this.musicMood === 'VILLAGE') {
        if (step % 16 === 0) {
          this.playNadaswaramNote(scale[step % scale.length], 0.6, true, 0.25);
        }
      }

      step = (step + 1) % 32;
    }, 125);
  }

  public setMusicMood(mood: 'VILLAGE' | 'COUNTDOWN' | 'GAMEPLAY' | 'CELEBRATION') {
    this.musicMood = mood;
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  private createNoiseBufferNode(durationSeconds: number): AudioBufferSourceNode | null {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * durationSeconds);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.start();
    return source;
  }
}

export const audioEngine = new WebAudioEngine();
