# URIYADI (உரியடி) — The Legacy of Tamil Nadu 🏺🌾

> An immersive, culturally authentic 3D browser-based game inspired by traditional Tamil Uriyadi and village festival celebrations (*Pongal / Thiruvizha*).

![Uriyadi 3D Tamil Web Game](public/pot-icon.svg)

---

## 🌟 Overview

**Uriyadi** (உரியடி) is an ancient, beloved festival game of Tamil Nadu. In this game, players step into the sacred village festival square of **Kovilu**, blindfold themselves, listen to real-time directional shouts from the village audience, and swing their wooden lathi stick to shatter the suspended terracotta clay pot (*paanai*).

---

## ✨ Key Features

### 🏺 1. Authentic Cultural 3D World
* **Single Suspended Sacred Paanai:** Authentically decorated with white chunam tribal geometric zigzags, concentric sun dots, and red kumkum bands.
* **Village Fairground (*Thiruvizha*):** Features an animated rotating carousel (*Kudhirai Raatinam*) with hand-carved horses, bazaar stalls with striped awnings, tall sugarcane stalks (*karumbu*), and sacred cows with rainbow-painted horns.
* **Marigold & Chocolate Shower:** Shattering the pot erupts into an explosion of **180+ marigold and rose flower petals** and **55+ shiny foil-wrapped chocolates and candies** bouncing across the arena sand.

### 🗣️ 2. AI Crowd Director & Native Tamil Voice Audio
* **Living Spectator Personas:**
  * 👴 **தாத்தா பொன்னுசாமி (Elder Ponnusamy):** Wise, calm directional guidance (*"நேரா போப்பா! தைரியமா முன்னாடி வா!"*).
  * 👦 **மாறன் (Maran):** High-octane friend cheering (*"முன்னாடி வா மச்சி! சூப்பரா போற!"*).
  * 👩 **செல்வி அக்கா (Selvi Akka):** Warm micro-corrections and acoustic cues (*"கதிர், இடது பக்கத்துலதான் பானை சத்தம் கேக்குது!"*).
  * 🧒 **கிராமத்து சிறுவர்கள் (Village Kids):** Rapid climax cheering within striking range (*"அடி! அடி! உடைச்சுடு! பொங்கலோ பொங்கல்!!"*).
* **Native Tamil Speech Streaming & 3D Spatial Panning:** Directional Tamil audio pans binaurally between your left and right ear to guide you while blindfolded.

### 🧭 3. Side-Docked Visual HUD & Soundwave Equalizer
* **Unobstructed View:** Audience captions and speaker cards are docked to the side of the screen, keeping your center line of sight directly on the pot.
* **Bilingual Guidance:** Displays bold Tamil calls, English translations, and phonetic pronunciation guides.
* **Soundwave Equalizer:** Animated gold EQ audio bars pulse in real time with the crowd's voices.

### 🎮 4. Dual Control Scheme
* **Desktop:** Keyboard (`WASD` to walk, `Shift` to sprint, Mouse to look) + Left Click or `Space` to swing.
* **Mobile / Touch:** Responsive on-screen virtual analog joystick and tactile **அடி! SWING** button.

---

## 🛠️ Technology Stack

* **Core:** [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
* **Bundler & Dev Server:** [Vite](https://vitejs.dev/)
* **3D Graphics & Physics:** [Three.js](https://threejs.org/) (custom procedural shaders, geometries, and particle physics)
* **Audio:** Web Audio API (procedural acoustic formant synthesis, positional `StereoPannerNode`, native Tamil voice audio)
* **Styling:** Vanilla CSS with Tamil festival art tokens, gold-embossed frames, and warm parchment typography.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18+ recommended)
* npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/deekshanacs/Uriyadi.git
   cd Uriyadi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173/`

### Production Build

To create an optimized production build:
```bash
npm run build
```

---

## 📜 License
This project is open-source and created as a cultural tribute to the heritage, folk arts, and festivals of Tamil Nadu.
