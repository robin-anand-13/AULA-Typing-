# Aula.Typing — Minimal, Premium 3D Typing Speed Test Platform

A full-stack, typing speed test platform with genuine 3D graphics (Three.js), server-authoritative scoring engine, and optional Gemini AI coaching.

---

## 🛠 Tech Stack

- **Backend**: Node.js v22 LTS, TypeScript, Express, Mongoose (MongoDB), Zod, Helmet, Winston, Vitest
- **Frontend**: React (JSX), Vite, Three.js (GLTFLoader), CSS Custom Properties (Dark Ocean & Warm Earth palettes), Lucide Icons
- **3D Asset**: Aula F75 Mechanical Keyboard (`.glb` asset rendered via WebGL)
- **AI**: Google Gemini API adapter with built-in deterministic rule-based fallback

---

## 🎨 Color Palettes (CSS Custom Properties)

### 🌊 Palette A — Dark Ocean (Default)
- **Deep Navy**: `#0D1B2A`
- **Dark Slate**: `#1B263B`
- **Steel Blue**: `#415A77`
- **Muted Sage**: `#778D7A`
- **Warm Sand**: `#D4C4A8`
- **Soft Ivory**: `#F4F1DE`

### 🏜 Palette B — Warm Earth (Optional Theme)
- **Espresso Brown**: `#3E2522`
- **Taupe**: `#8C6E63`
- **Caramel**: `#D3A376`
- **Peach Cream**: `#FFE0B2`
- **Warm Ivory**: `#FFF2DF`

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure Node.js v20+ or v22+ is in your PATH.

### 2. Backend Setup
```bash
cd backend
npm install
npm run build
# Start development server
npm run dev
# Or start the compiled server
npm start
# Or run tests
npx vitest run
```
The backend must be running on port 3001 while using the frontend. On Windows, you can start it from the project root with `start-backend.bat`.

### 3. Frontend Setup
```bash
cd frontend
npm install
# Start Vite development server
npm run dev
# Or build for production
npm run build
```

---

## 🔒 Security & Architecture Highlights

1. **Server-Authoritative Scoring Engine v1.0**: Net/Gross WPM, accuracy, and benchmark validity calculations are derived on the backend from server start times and grapheme traces without trusting client assertions.
2. **Deterministic AI Fallback**: If `GEMINI_API_KEY` is not present, the system provides real diagnostic coaching and practice drill recommendations using the smart rule-based engine.
3. **Resilient Persistence**: Connects to MongoDB when available; seamlessly falls back to memory store when running offline or without database instances.
