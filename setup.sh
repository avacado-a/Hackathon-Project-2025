#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Hackathon Project 2025 Setup  ${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Python 3 is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Python 3 found: $(python3 --version)"
echo -e "${GREEN}✓${NC} Node.js found: $(node --version)"
echo ""

# Install Node.js dependencies
echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
npm install
echo ""

# Install Python dependencies
echo -e "${BLUE}🐍 Installing Python dependencies...${NC}"
cd PythonHandTracking
python3 -m pip install -r requirements.txt
cd ..
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}To start the application:${NC}"
echo -e "  ${YELLOW}Option 1 (Recommended):${NC} ./start.sh"
echo -e "  ${YELLOW}Option 2 (Manual):${NC}"
echo -e "    Terminal 1: cd PythonHandTracking && python3 server.py"
echo -e "    Terminal 2: npm run dev"
echo ""
echo -e "Then open ${GREEN}http://localhost:3000${NC} in your browser!"
