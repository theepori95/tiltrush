# TiltRush: NEON ESCAPE 🛸⚡🏎️👾

> **“Your phone. Your reflexes. One unforgettable run.”**  
> *Official Hackathon Entry: Anything but a Game Controller*

TiltRush transforms any smartphone into an ultra-low latency real-time motion controller for a suite of 3 high-octane indie browser arcade games running on a laptop or desktop screen.

---

## 🎮 The 3 Arcade Games

TiltRush includes 3 distinct motion-controlled games with full 1P to 4P split-screen multiplayer support:

### 1. 🏎️ NEON RACING
- **Core Loop:** Pilot supersonic hovercrafts down a dark infinite cyber highway.
- **Motion Physics:** Tilt your phone roll left/right to weave through barrier walls.
- **Tilt-to-Flow:** Dynamic lavender particle exhaust ribbons stream behind craft, reacting to steering velocity.
- **Pulse Orbs:** Collect glowing orbs to build up to a **5x Combo Multiplier**.
- **Neon Overdrive:** Accumulate 3 orbs to trigger hyper-speed invulnerability warp that smashes through obstacle walls.

### 2. 🔮 BALL ASCENT & JUMP
- **Core Loop:** Balance a levitating energy sphere ascending against rising thermal updrafts.
- **Roof Hazards:** Crushing laser blocks and spiked stalactites plummet downward from the ceiling.
- **The JUMP Button:** Press **JUMP** on your smartphone controller (or keyboard `Space`) to execute a high-altitude leap over falling roof obstacles without getting crushed!
- **Altitude Scoring:** Gain altitude meters and collect levitation sparks.

### 3. 👾 CYBER MAZE HUNTER
- **Core Loop:** Pac-Man style 15x15 cyber labyrinth where an autonomous AI "Nemesis Hunter" stalks players through glowing corridors.
- **2D Gyro Navigation:** Tilt phone roll (left/right) and pitch (up/down) to select turns at intersections.
- **Key Recovery:** Navigate to the center of the labyrinth to retrieve the Golden Access Key.
- **Exit Portal:** Escape through the Exit Portal before the Hunter catches you for a +1000 point bonus!

---

## 👥 Multi-Player Split-Screen (1P, 2P, 3P, 4P)

TiltRush features full local multiplayer split-screen:
- **Assigned Colors & Avatars:**
  - **Player 1:** Neon Violet 🛸 (`#C4B5FD`) — Left/Right Keys or Phone 1
  - **Player 2:** Cyber Cyan ⚡ (`#38BDF8`) — A/D Keys or Phone 2
  - **Player 3:** Solar Amber 🏎️ (`#FBBF24`) — J/L Keys or Phone 3
  - **Player 4:** Emerald Pulse 👾 (`#34D399`) — Numpad Keys or Phone 4
- **Dedicated QR Code for Every Player:**
  - Visit the **QR Phone Station** subpage on your laptop.
  - Each player scans their own dedicated QR code: `/?mode=controller&room=CODE&player=N`.
  - Up to 4 phones connect simultaneously to control their respective hovercraft or ball!
- **Pre-Game Match Options:**
  - Choose between 1P Solo Run, 2P Split Duel, 3P Trio Rush, and 4P Quad Royale.
  - Customize player display names and pick from 12 pilot emojis.
  - Adjust speed difficulty (Chill 0.8x, Neon Arcade 1.0x, Hyper Warp 1.4x).

---

## 📈 Chess.com-Style Rating Trajectory & Match Log

Inspired by Chess.com's rating progression charts:
- **Interactive SVG Line Graph:** Displays pilot rating trajectory and score progress over historical matches.
- **Telemetry Metric Cards:** Real-time Pilot Rating (ELO scale), All-Time Best score, Dodge & Collection Accuracy %, and Total Runs Logged.
- **Interactive Hover Points:** Inspect date/time, arena game type, player mode, winner, score, and rating delta (+/-).
- **Match History Table:** Detailed breakdown of every match across all 3 game arenas with filters by game type.

---

## 🎨 Design System & Halftone Wordmark Component

- **Color Palette:**
  - Main background: `#0B0A10`
  - Secondary surface: `#12101A`
  - Card surface: `#191622`
  - Accents: Soft lavender `#C4B5FD` and muted purple `#A78BFA`
- **shadcn/ui Structure:**
  - Built with `@/*` mapping to `./*` and components located in `/components/ui/`.
  - Integrated `HalftoneWordmarkFooter` (`/components/ui/halftone-wordmark-footer.tsx`) featuring physics-based spring dots, warm displacement lighting, and print grain.

---

## 📡 Technology Stack & Latency Approach

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, HTML5 Canvas 2D, Lucide Icons, Web Audio API synthesizer.
- **Backend:** Node.js, Express, `ws` (native WebSockets), in-memory room registry with 6-character room codes.
- **Sensors:** `DeviceOrientationEvent` gamma (roll) and beta (pitch), clamped, normalized (-1.0 to 1.0), and throttled at 30 Hz (~33ms) to avoid network congestion.
- **Latency Measurement:** True round-trip latency (RTT) measured using 1.2 Hz ping/pong heartbeat timestamps (`Date.now() - sentAt`), displaying actual network latency on both devices.

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test

# 3. Start unified full-stack dev server
npm run dev

# 4. Open in browser
# Laptop game: http://localhost:3000
# Mobile controller: http://localhost:3000/?mode=controller&room=ROOM_CODE&player=1
```
