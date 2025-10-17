#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Starting Hackathon Project    ${NC}"
echo -e "${BLUE}  URANUS PROBE EDITION 🪐        ${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    kill $PYTHON_PID 2>/dev/null
    kill $NEXTJS_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Python server in background
echo -e "${BLUE}🐍 Starting Python hand tracking server...${NC}"
cd PythonHandTracking
python3 server.py &
PYTHON_PID=$!
cd ..

# Wait a moment for Python server to start
sleep 3

# Start Next.js dev server in background
echo -e "${BLUE}⚛️  Starting Next.js frontend...${NC}"
npm run dev &
NEXTJS_PID=$!

echo ""
echo -e "${GREEN}✅ All servers started!${NC}"
echo ""
echo -e "${BLUE}Services running:${NC}"
echo -e "  • Python Server (Flask): ${GREEN}http://localhost:5000${NC}"
echo -e "  • WebSocket Server: ${GREEN}ws://localhost:8765${NC}"
echo -e "  • Next.js Frontend: ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for both processes
wait $PYTHON_PID $NEXTJS_PID
