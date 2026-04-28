# 🏴‍☠️ InkYaiba Frontend — The Pirate Portal

This is the frontend client for **InkYaiba**, the real-time collaborative whiteboard. Built with a focus on high-fidelity UI, smooth animations, and instantaneous user feedback.

## ✨ Frontend Highlights

### 🎨 Custom Canvas Engine
Our whiteboard is powered by a custom-built React Canvas implementation that handles:
- **Variable Brush Dynamics**: Size and opacity controls.
- **Geometric Primitives**: Real-time shape projection (Rectangles, Circles, Arrows).
- **Ink Red Selection**: A custom selection system for a unique aesthetic.

### 🌊 Modern Pirate UI
- **Single-Section Portal**: A focused landing experience that eliminates clutter.
- **Glassmorphism**: Translucent panels that overlay the "Grand Line" map.
- **Parchment Styling**: High-detail card designs using the `FDF6E3` color palette.
- **Animation Suite**: Powered by `Framer Motion` for layout shifts and UI transitions.

---

## 🛠️ Tech Stack & Dependencies

- **React 18** (Vite-powered)
- **Tailwind CSS v4** (Custom design tokens)
- **Socket.io-client** (Real-time sync)
- **Lucide React** (Consistent iconography)
- **Framer Motion** (Smooth interactions)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in this directory:
```env
VITE_SERVER_URL=http://localhost:3001
```

### 3. Start Development Server
```bash
npm run dev
```

---

## 📦 Build for Deployment
```bash
npm run build
```
The build artifacts will be located in the `dist/` directory, ready to be hosted on Vercel or Netlify.

---
**Set sail at `http://localhost:5173`** ⚓
