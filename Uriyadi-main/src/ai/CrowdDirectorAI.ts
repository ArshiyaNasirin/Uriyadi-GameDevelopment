import { DirectionalVoiceCue } from '../types';

export interface PlayerSpatialContext {
  distanceToPot: number;
  angleDiff: number; // Difference between player facing direction and pot direction (-PI to PI)
  isMoving: boolean;
  playerSpeed: number;
  timeRemaining: number;
  isBlindfolded: boolean;
  didRecentMiss?: boolean;
}

export class CrowdDirectorAI {
  private lastSpeakerIndex = -1;
  private callCount = 0;

  // Authentic Tamil Spectator Persona Profiles
  private speakers = [
    {
      name: 'தாத்தா பொன்னுசாமி',
      role: 'ELDER' as const,
      avatar: '👴',
      pitch: 0.88,
      rate: 0.95,
      style: 'wise',
    },
    {
      name: 'மாறன் (தோழன்)',
      role: 'FRIEND' as const,
      avatar: '👦',
      pitch: 1.12,
      rate: 1.25,
      style: 'energetic',
    },
    {
      name: 'செல்வி அக்கா',
      role: 'VILLAGE_WOMAN' as const,
      avatar: '👩',
      pitch: 1.28,
      rate: 1.10,
      style: 'encouraging',
    },
    {
      name: 'கிராமத்து சிறுவர்கள்',
      role: 'KIDS' as const,
      avatar: '🧒',
      pitch: 1.38,
      rate: 1.30,
      style: 'excited',
    },
  ];

  /**
   * Intelligently evaluate player spatial dynamics and generate
   * context-aware, varied, lifelike Tamil audience calls.
   */
  public generateCrowdGuidance(ctx: PlayerSpatialContext): DirectionalVoiceCue {
    this.callCount++;
    const { distanceToPot, angleDiff, timeRemaining, didRecentMiss } = ctx;
    const isUrgent = timeRemaining <= 15;

    // Pick next speaker, rotating naturally while favoring kids/friend near pot
    let speakerIdx: number;
    if (distanceToPot <= 1.8) {
      // In striking range, kids and friend are loudest
      speakerIdx = Math.random() > 0.5 ? 1 : 3;
    } else {
      do {
        speakerIdx = Math.floor(Math.random() * this.speakers.length);
      } while (speakerIdx === this.lastSpeakerIndex && this.speakers.length > 1);
    }
    this.lastSpeakerIndex = speakerIdx;
    const speaker = this.speakers[speakerIdx];

    // Handle recent swing miss reaction
    if (didRecentMiss) {
      return this.generateMissReaction(speaker);
    }

    // Categorize spatial direction relative to player's blindfold orientation
    if (angleDiff < -0.32) {
      return this.generateLeftGuidance(speaker, Math.abs(angleDiff), isUrgent);
    } else if (angleDiff > 0.32) {
      return this.generateRightGuidance(speaker, angleDiff, isUrgent);
    } else if (distanceToPot > 2.4) {
      return this.generateForwardGuidance(speaker, distanceToPot, isUrgent);
    } else if (distanceToPot > 1.8) {
      return this.generateCloseGuidance(speaker, distanceToPot, isUrgent);
    } else {
      return this.generateStrikeGuidance(speaker, isUrgent);
    }
  }

  // --- 1. LEFT GUIDANCE ---
  private generateLeftGuidance(speaker: typeof this.speakers[0], severity: number, isUrgent: boolean): DirectionalVoiceCue {
    const isSharp = severity > 1.2;
    const options = [
      {
        tamil: isSharp ? 'தம்பி, இடது பக்கம் முழுசா திரும்பு!' : 'கொஞ்சம் இடது பக்கம் திரும்பு!',
        english: isSharp ? 'Turn sharply to your left!' : 'Turn a little to the left!',
        phonetic: 'Idadhu pakkam thirumbu!',
      },
      {
        tamil: 'இடதுடா மச்சி! இடது பக்கம் வா!',
        english: 'Left buddy! Come towards your left!',
        phonetic: 'Idadhuda machi! Idadhu pakkam vaa!',
      },
      {
        tamil: 'கதிர், இடது பக்கத்துலதான் பானை சத்தம் கேக்குது!',
        english: 'Kathir, the pot ropes are creaking on your left!',
        phonetic: 'Idadhu pakkathula paanai satham!',
      },
      {
        tamil: 'இடது! இடது! அந்த பக்கம்தான்!',
        english: 'Left! Left! That way!',
        phonetic: 'Idadhu! Idadhu! Andha pakkam!',
      },
    ];

    const chosen = options[this.callCount % options.length];
    return {
      id: `cue_left_${this.callCount}`,
      speakerName: speaker.name,
      speakerRole: speaker.role,
      speakerAvatar: speaker.avatar,
      tamilText: chosen.tamil,
      englishText: chosen.english,
      phoneticText: chosen.phonetic,
      urgency: isUrgent ? 'HIGH' : 'NORMAL',
      angleTarget: 'LEFT',
      pitch: speaker.pitch,
      rate: speaker.rate * (isUrgent ? 1.15 : 1.0),
    };
  }

  // --- 2. RIGHT GUIDANCE ---
  private generateRightGuidance(speaker: typeof this.speakers[0], severity: number, isUrgent: boolean): DirectionalVoiceCue {
    const isSharp = severity > 1.2;
    const options = [
      {
        tamil: isSharp ? 'தம்பி, வலது பக்கம் நல்லா திரும்பு!' : 'கொஞ்சம் வலது பக்கம் வாப்பா!',
        english: isSharp ? 'Turn sharply to your right!' : 'Step slightly to the right!',
        phonetic: 'Valadhu pakkam thirumbu!',
      },
      {
        tamil: 'வலதுடா! சுத்தி பார்க்காத, வலது பக்கம் வா!',
        english: 'Right side! Don’t wander, come right!',
        phonetic: 'Valadhuda! Valadhu pakkam vaa!',
      },
      {
        tamil: 'வலது பக்கம் திரும்பு தம்பி, அங்கதான் ஆட்கள் கூப்பிடுறோம்!',
        english: 'Turn right brother, listen to the crowd on the right!',
        phonetic: 'Valadhu pakkam thirumbu thambi!',
      },
      {
        tamil: 'வலது! வலது! நேரா வலது பக்கம்!',
        english: 'Right! Right! Straight to the right!',
        phonetic: 'Valadhu! Valadhu!',
      },
    ];

    const chosen = options[this.callCount % options.length];
    return {
      id: `cue_right_${this.callCount}`,
      speakerName: speaker.name,
      speakerRole: speaker.role,
      speakerAvatar: speaker.avatar,
      tamilText: chosen.tamil,
      englishText: chosen.english,
      phoneticText: chosen.phonetic,
      urgency: isUrgent ? 'HIGH' : 'NORMAL',
      angleTarget: 'RIGHT',
      pitch: speaker.pitch,
      rate: speaker.rate * (isUrgent ? 1.15 : 1.0),
    };
  }

  // --- 3. FORWARD GUIDANCE ---
  private generateForwardGuidance(speaker: typeof this.speakers[0], _distance: number, isUrgent: boolean): DirectionalVoiceCue {
    const options = [
      {
        tamil: 'நேரா போப்பா! தைரியமா முன்னாடி வா!',
        english: 'Walk straight son! Move forward boldly!',
        phonetic: 'Neera poppa! Munnadi vaa!',
      },
      {
        tamil: 'முன்னாடி வா மச்சி! சூப்பரா போற, அதே திசைதான்!',
        english: 'Move forward buddy! You are on the exact right track!',
        phonetic: 'Munnadi vaa machi! Adhey dhisai!',
      },
      {
        tamil: 'இன்னும் நாலு எட்டு முன்னாடி வா தம்பி!',
        english: 'Just four more steps forward, brother!',
        phonetic: 'Innum naalu ettu munnadi vaa!',
      },
      {
        tamil: 'முன்னாடி! முன்னாடி! வேகமா வா!',
        english: 'Forward! Forward! Keep your momentum!',
        phonetic: 'Munnadi! Munnadi! Vegama vaa!',
      },
    ];

    const chosen = options[this.callCount % options.length];
    return {
      id: `cue_fwd_${this.callCount}`,
      speakerName: speaker.name,
      speakerRole: speaker.role,
      speakerAvatar: speaker.avatar,
      tamilText: chosen.tamil,
      englishText: chosen.english,
      phoneticText: chosen.phonetic,
      urgency: isUrgent ? 'HIGH' : 'NORMAL',
      angleTarget: 'FORWARD',
      pitch: speaker.pitch,
      rate: speaker.rate * (isUrgent ? 1.15 : 1.0),
    };
  }

  // --- 4. CLOSE TO POT GUIDANCE ---
  private generateCloseGuidance(speaker: typeof this.speakers[0], _distance: number, _isUrgent: boolean): DirectionalVoiceCue {
    const options = [
      {
        tamil: 'பானை பக்கத்துல வந்துட்ட... நிதானமா நில்லு!',
        english: 'You’ve reached the pot... steady your stance!',
        phonetic: 'Paanai pakkathula vandhutta!',
      },
      {
        tamil: 'பானை உன் தலைக்கு மேல ஆடுது மச்சி! தடியை தயார் பண்ணு!',
        english: 'The pot is swinging right above your head! Ready the stick!',
        phonetic: 'Thadiyai thayaar pannu!',
      },
      {
        tamil: 'கிட்ட வந்துட்ட தம்பி! இன்னும் ஒரு சின்ன எட்டு!',
        english: 'Extremely close brother! Just one tiny step!',
        phonetic: 'Kitta vandhutta thambi!',
      },
      {
        tamil: 'பானை வாசம் அடிக்குது! கவனமா நில்லு!',
        english: 'The scent of sweet Pongal is near! Stand ready!',
        phonetic: 'Paanai vaasam adikkudhu!',
      },
    ];

    const chosen = options[this.callCount % options.length];
    return {
      id: `cue_close_${this.callCount}`,
      speakerName: speaker.name,
      speakerRole: speaker.role,
      speakerAvatar: speaker.avatar,
      tamilText: chosen.tamil,
      englishText: chosen.english,
      phoneticText: chosen.phonetic,
      urgency: 'HIGH',
      angleTarget: 'CLOSE',
      pitch: speaker.pitch,
      rate: speaker.rate * 1.1,
    };
  }

  // --- 5. STRIKE NOW CLIMAX GUIDANCE ---
  private generateStrikeGuidance(speaker: typeof this.speakers[0], _isUrgent: boolean): DirectionalVoiceCue {
    const options = [
      {
        tamil: 'அடிடா கதிர் அடி!! இப்போதான் நேரம், பலமா அடி!!',
        english: 'STRIKE KATHIR STRIKE!! NOW IS THE TIME, SWING HARD!!',
        phonetic: 'Adida Kathir adi!! Ippodhan neram, balama adi!!',
      },
      {
        tamil: 'இப்போ அடி!! ஓங்கி அடிச்சு தூக்குடா!!',
        english: 'STRIKE NOW!! Swing with all your strength!!',
        phonetic: 'Ippo adi!! Oongi adichu thookkuda!!',
      },
      {
        tamil: 'நேரடியா பானை மேல இருக்கு! இப்போதே அடி!!',
        english: 'Right on the pot! SWING THIS SECOND!!',
        phonetic: 'Neeradiya paanai mela irukku! Ippodhey adi!!',
      },
      {
        tamil: 'அடி! அடி! அடி! உடைச்சிடு! பொங்கலோ பொங்கல்!!',
        english: 'HIT IT! HIT IT! BREAK THE POT! PONGALO PONGAL!!',
        phonetic: 'Adi! Adi! Udaichidu! Pongalo Pongal!!',
      },
    ];

    const chosen = options[this.callCount % options.length];
    return {
      id: `cue_strike_${this.callCount}`,
      speakerName: speaker.name,
      speakerRole: speaker.role,
      speakerAvatar: speaker.avatar,
      tamilText: chosen.tamil,
      englishText: chosen.english,
      phoneticText: chosen.phonetic,
      urgency: 'CLIMAX',
      angleTarget: 'STRIKE',
      pitch: speaker.pitch * 1.05,
      rate: speaker.rate * 1.25,
    };
  }

  // --- 6. MISSED SWING REACTION ---
  private generateMissReaction(speaker: typeof this.speakers[0]): DirectionalVoiceCue {
    const options = [
      {
        tamil: 'அடடா! நூல் இழைல போச்சு! பதட்டப்படாதே, மறுபடியும் அடி!',
        english: 'Missed by a whisker! Don’t panic, strike again!',
        phonetic: 'Nool izhaila pochu! Marupadiyum adi!',
      },
      {
        tamil: 'ஐயோ காத்துல போச்சு மச்சி! கொஞ்சம் உயர்த்தி அடி!',
        english: 'Swing caught the air buddy! Aim slightly higher!',
        phonetic: 'Konjam uyarthi adi!',
      },
      {
        tamil: 'பானை ஆடுது தம்பி! ஆட்டத்தை கணிச்சு அடி!',
        english: 'The pot is swinging brother! Time the rhythm and strike!',
        phonetic: 'Aattatha kanichu adi!',
      },
    ];

    const chosen = options[this.callCount % options.length];
    return {
      id: `cue_miss_${this.callCount}`,
      speakerName: speaker.name,
      speakerRole: speaker.role,
      speakerAvatar: speaker.avatar,
      tamilText: chosen.tamil,
      englishText: chosen.english,
      phoneticText: chosen.phonetic,
      urgency: 'HIGH',
      angleTarget: 'MISSED',
      pitch: speaker.pitch,
      rate: speaker.rate * 1.1,
    };
  }
}

export const crowdAI = new CrowdDirectorAI();
