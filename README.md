# ☠️ InkYaiba — The Ultimate Pirate's War Map
### Real-Time Collaborative Whiteboard for Legends

**InkYaiba** (インクヤイバ) is a high-fidelity, real-time collaborative whiteboard built for the modern pirate crew. Whether you're mapping out your next raid on the Grand Line or brainstorming your next tech stack, InkYaiba provides a seamless, immersive, and visually stunning portal for group collaboration.

![InkYaiba Banner](https://img.shields.io/badge/Status-Hackathon_Ready-A50000?style=for-the-badge&logo=react)
![Real Time](https://img.shields.io/badge/Real--Time-Socket.io-D4A373?style=for-the-badge)
![UI](https://img.shields.io/badge/UI-Modern_Pirate-1A1A1A?style=for-the-badge)

---

## 🧭 Why InkYaiba?
In the sea of generic whiteboards, InkYaiba stands out with its unique **Modern-Pirate aesthetic**. We combined the raw energy of high-seas adventure with cutting-edge real-time technology to create a workspace that feels alive, premium, and focused.

### ⚓ Key Hackathon Features
- **🔥 Zero-Latency Drawing**: Built on a custom HTML5 Canvas engine and WebSocket sync for instantaneous stroke replication.
- **🏴‍☠️ Crew Portal**: No signups required. Generate a room code, pick your pirate flag (avatar), and set sail in seconds.
- **⚔️ Battle Chat**: Integrated real-time communication with emoji reactions to celebrate your best ideas.
- **👑 Captain Controls**: Exclusive room administrative tools including canvas locking, board clearing, and crew management.
- **🗺️ Multiple Map Modes**: Choose between Blank Paper, Nautical Grid, or Dark Sea themes for your workspace.
- **📱 Responsive Seafaring**: Fully optimized for tablets and mobile devices with touch-aware drawing precision.

---

## 🛠️ The Treasure Chest (Tech Stack)

| Part | Tech | Role |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Lightning-fast SPA architecture |
| **Styling** | Tailwind CSS | Custom Pirate Design System |
| **Animation** | Framer Motion | Smooth portal transitions and UI micro-interactions |
| **Real-time** | Socket.io | Bi-directional event synchronization |
| **Backend** | Node.js + Express | Lightweight, scalable room management |
| **State** | In-Memory Stores | High-speed data handling for active sessions |

---

## 🚀 Setting Sail (Quick Start)

### 1. The Engine (Backend)
```bash
cd server
npm install
npm run dev
```
*Server docks at `http://localhost:3001`*

### 2. The Vessel (Frontend)
```bash
cd client
npm install
npm run dev
```
*Client docks at `http://localhost:5173`*

---

## 📁 The Ship's Manifest (Structure)

```text
InkYaiba/
├── client/              # The Frontend Portal
│   ├── src/
│   │   ├── components/  # Canvas engine, Toolbar, RightPanel
│   │   ├── hooks/       # Custom useSocket hook
│   │   ├── pages/       # Landing, Join, and Board views
│   │   └── utils/       # SVG/PNG Export logic
├── server/              # The Real-Time Command Center
│   ├── roomStore.js     # Global room & state management
│   └── socketHandlers.js# Real-time event logic
```

---

## 🌊 Roadmap & Vision
- [x] Real-time stroke synchronization
- [x] Integrated Battle Chat
- [x] PNG/SVG Export
- [ ] Layer Management
- [ ] Persistent Map Storage (Database integration)
- [ ] Voice Chat (VoIP) for Crews

---

## ⚓ The Creed
Built with passion for the **Hackathon 2024**. InkYaiba is more than a tool; it's a testament to the power of collaborative creativity under pressure.

**"Inherited Will, The Tide of the Times, and The Dreams of the People. These are things that will not be stopped."**

---
© 2024 InkYaiba Team | Set Sail! 🏴‍☠️
