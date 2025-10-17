# 🌌 Hackathon Project 2025 - Solar System Explorer

An interactive 3D solar system explorer with **hand tracking controls**! Control the camera with natural hand gestures while exploring planets with realistic orbits and a stunning star field background.

## ✨ Features

- **🪐 Full Solar System**: All 8 planets plus the Sun with realistic textures
- **🌟 Dynamic Star Field**: 10,000+ animated stars creating an immersive space environment  
- **🎯 Real Orbits**: Planets orbit the sun with scientifically accurate speeds
- **👋 Hand Gesture Controls**: Control the camera with natural hand gestures
  - 👉 Right hand pinch (up/down): Zoom in/out
  - 👈 Left hand pinch (left/right): Rotate view
  - ✊ Two fists: Pan camera
- **⚡ Real-time WebSocket**: Instant gesture recognition and response
- **📊 Visual Feedback**: Live status indicators and gesture visualization
- **🎨 Modern UI**: Sleek interface with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Webcam** for hand tracking

### Installation

Run the setup script to install all dependencies:

```bash
./setup.sh
```

Or manually install dependencies:

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
cd PythonHandTracking
pip install -r requirements.txt
cd ..
```

### Running the Application

#### Option 1: Quick Start (Recommended)

```bash
./start.sh
```

This starts both servers automatically. Press `Ctrl+C` to stop all servers.

#### Option 2: Manual Start

**Terminal 1 - Python Hand Tracking Server:**
```bash
cd PythonHandTracking
python3 server.py
```

**Terminal 2 - Next.js Frontend:**
```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 How to Use

1. **Allow camera access** when prompted
2. Click **"Start Exploring"** on the home page
3. **Position your hands** in front of the camera
4. Use the hand gestures shown in the guide overlay:
   - **Right hand**: Pinch thumb and index finger, move up/down to zoom
   - **Left hand**: Pinch thumb and index finger, move left/right to rotate  
   - **Both hands**: Make fists and move to pan the camera

The status indicator in the top-right shows connection status:
- 🟢 Green: Connected and tracking
- 🔴 Red: Disconnected (check Python server)
- 🔵 Blue: Gesture detected

## 🏗️ Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   └── explore/
│   │       └── page.tsx          # 3D solar system with hand tracking
│   ├── components/
│   │   ├── Planet.tsx            # Planet component with orbits
│   │   └── Star.tsx              # Animated star field
│   └── hooks/
│       └── useHandTracking.ts    # WebSocket hook for gestures
├── PythonHandTracking/
│   ├── server.py                 # Integrated Flask + WebSocket server
│   ├── handTracker.py            # Original hand tracking module
│   └── requirements.txt          # Python dependencies
├── public/
│   ├── textures/                 # Planet textures (sun, mercury, venus, etc.)
│   └── logo.png                  # App logo
├── setup.sh                      # Installation script
└── start.sh                      # Server startup script
```

## 🔧 Technologies Used

### Frontend
- **Next.js 15** - React framework with App Router
- **Three.js** - 3D graphics and rendering
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling

### Backend
- **Python 3** - Backend runtime
- **MediaPipe** - Hand tracking ML model
- **OpenCV** - Computer vision
- **WebSockets** - Real-time bidirectional communication
- **Flask** - REST API server
- **Flask-CORS** - Cross-origin resource sharing

## 🐛 Troubleshooting

### Hand tracking not connecting?
- Ensure Python server is running: `cd PythonHandTracking && python3 server.py`
- Check that WebSocket server started on `ws://localhost:8765`
- Allow camera permissions in your browser
- Click "Retry Connection" in the error message

### Camera not working?
- Make sure no other application is using the webcam
- Try restarting the Python server
- Check that OpenCV can access your camera: `python3 -c "import cv2; print(cv2.VideoCapture(0).isOpened())"`

### Gestures not responding?
- Ensure good lighting conditions
- Keep hands clearly visible in the camera frame
- Check the tracking window to see if hands are detected (colored circles)
- Make sure you're using the correct hand (right for zoom, left for rotate)

### Port already in use?
- Check if port 3000 is available: `lsof -i :3000`
- Check if port 8765 is available: `lsof -i :8765`
- Check if port 5000 is available: `lsof -i :5000`

## 🌟 Features Highlights

### Solar System
- **Sun**: Central star with emissive lighting
- **Mercury, Venus, Earth, Mars**: Inner rocky planets
- **Jupiter, Saturn**: Gas giants
- **Uranus, Neptune**: Ice giants (URANUS PROBE EDITION!)

### Hand Tracking
- **MediaPipe Hands**: Google's state-of-the-art hand tracking
- **Real-time Detection**: 30+ FPS tracking
- **Multi-hand Support**: Tracks up to 2 hands simultaneously
- **Gesture Recognition**: Pinch and fist detection

## 📝 Development

To contribute or modify the project:

```bash
# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📄 License

This project was created for Hackathon 2025.

## 🙏 Acknowledgments

- Planet textures from [Solar System Scope](https://www.solarsystemscope.com/textures/)
- Hand tracking powered by [MediaPipe](https://google.github.io/mediapipe/)
- Built with [Next.js](https://nextjs.org) and [Three.js](https://threejs.org)
