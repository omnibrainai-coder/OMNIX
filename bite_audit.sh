#!/bin/bash
echo -e "\e[1;35m====================================================\e[0m"
echo -e "\e[1;36m          BITE CORE SYSTEM AUDIT ENGINE             \e[0m"
echo -e "\e[1;35m====================================================\e[0m"

echo -e "\n\e[1;33m[1] SECURITY & ENCRYPTION CHECK (SHA-256 / JWT / TLS):\e[0m"
grep -rnw . -e "sha256" -e "jwt" -e "crypto" -e "bcrypt" -e "aes" --include=\*.{ts,tsx,js,py,go} || echo "No direct local matches, checking fallback libs..."

echo -e "\n\e[1;33m[2] REAL-TIME NETWORK CHANNELS (WebSockets / WebRTC / SMS / Calls):\e[0m"
grep -rnw . -e "websocket" -e "ws://" -e "wss://" -e "peerconnection" -e "webrtc" -e "twilio" -e "vonage" -e "sms" --include=\*.{ts,tsx,js,py,go}

echo -e "\n\e[1;33m[3] BACKGROUND TRACKING & PRIVACY AUDIT (Location / Background Aggregators):\e[0m"
echo "Scanning for hidden trackers or background daemon loops..."
grep -rnw . -e "geolocation" -e "watchPosition" -e "background-fetch" -e "background-service" --include=\*.{ts,tsx,js,js,json}

echo -e "\n\e[1;33m[4] DATABASE PIPELINES & DATA STORAGE ARCHITECTURE:\e[0m"
grep -rnw . -e "SELECT" -e "INSERT" -e "db.connect" -e "mongoose" -e "prisma" -e "supabase" --include=\*.{ts,tsx,js,py,go}

echo -e "\n\e[1;32m[5] ARCHITECTURE PROJECT STRUCTURE TREE:\e[0m"
if command -v tree &> /dev/null; then
    tree -I "node_modules|.git"
else
    find . -maxdepth 3 -not -path '*/.*' -not -path './node_modules*'
fi
echo -e "\e[1;35m====================================================\e[0m"
