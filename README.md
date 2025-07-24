# MeetScribe

**MeetScribe** is a real-time video meeting platform with live transcription and AI-powered summarization. It enables users to join video rooms, get live speech-to-text transcripts, and generate concise meeting summaries using Google Gemini AI or a local NLP model. Built with React, Node.js, WebRTC, and Socket.IO, it supports both cloud (Deepgram, Gemini) and offline (Vosk, local NLP) speech recognition.

---

## Features

- Multi-user video conferencing (WebRTC)
- Room-based meetings (join with code and name)
- Live speech-to-text transcription (Deepgram API or Vosk offline)
- Per-user transcript tracking
- **AI-powered meeting summarization (choose between Google Gemini API or Local NLP model)**
- Download summaries as PDF
- Real-time collaboration (Socket.IO)
- Mute/unmute, camera on/off controls

---

## Tech Stack

- **Frontend:** React 19, Material-UI, Socket.IO Client, simple-peer, jsPDF, vosk-browser
- **Backend:** Node.js, Express, Socket.IO, Axios, dotenv, cors, Python (Flask, transformers)
- **Speech-to-Text:** Deepgram API (cloud), Vosk (offline, in-browser)
- **AI Summarization:** Google Gemini API or Local NLP (HuggingFace Transformers)

---

## Folder Structure

```
meetscribe/
  client/      # React frontend
  server/      # Node.js/Express backend (+ Python summarizer)
  render.yaml  # Render deployment config
```

---

## Installation & Setup (Local)

### 1. Clone the Repository
```bash
git clone https://github.com/Shiva-siddhardha/meetscribe.git
cd meetscribe
```

### 2. Set Up Environment Variables

#### **Frontend (`client/.env`)**
```
REACT_APP_DEEPGRAM_API_KEY=your_deepgram_api_key
REACT_APP_SOCKET_URL=http://localhost:5000
```

#### **Backend (`server/.env`)**
```
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

### 3. Install Dependencies

#### **Frontend**
```bash
cd client
npm install
```

#### **Backend**
```bash
cd ../server
npm install
pip install -r requirements.txt
```

### 4. Run Locally

#### **Start Backend (Node.js + Flask auto-starts)**
```bash
cd server
npm start
```

#### **Start Frontend**
```bash
cd ../client
npm start
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## Usage

1. Open the frontend in your browser.
2. Join a meeting room with a code and your name.
3. Start/stop live transcription.
4. View live transcripts per user.
5. **Choose summarizer (Gemini or Local) in the summary panel.**
6. Summarize the meeting and download the summary as PDF.

---

## Deployment on Render

### **Backend (Node.js + Python) on Render**

1. **Push your code to GitHub.**
2. **Ensure `render.yaml` is present in your repo root.**
   - This file automates backend deployment, installs both Node and Python dependencies, and sets up environment variables.
3. **Create a new Web Service on [Render](https://dashboard.render.com/):**
   - Connect your GitHub repo.
   - Render will auto-detect `render.yaml` and use it for setup.
   - Set your environment variables (`GEMINI_API_KEY`, `PORT`) in the Render dashboard if not set in `render.yaml`.
   - The backend will auto-start the Flask summarizer.

#### **Sample `render.yaml`**
```yaml
services:
  - type: web
    name: meetscribe-backend
    env: node
    rootDir: server
    buildCommand: npm install
    preBuildCommand: pip install -r requirements.txt
    startCommand: npm start
    envVars:
      - key: GEMINI_API_KEY
        sync: false
      - key: PORT
        value: 10000
```

### **Frontend (React) on Render or Vercel**
1. Create a new **Static Site** (Render) or import to Vercel:
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
   - Add environment variables: `REACT_APP_DEEPGRAM_API_KEY`, `REACT_APP_SOCKET_URL` (set to your backend Render URL)

### **CORS and API URLs**
- Ensure your backend allows CORS from your frontend domain.
- Set `REACT_APP_SOCKET_URL` and all API calls to use your deployed backend URL.

---

## Environment Variables

- `REACT_APP_DEEPGRAM_API_KEY` (frontend): Deepgram API key
- `REACT_APP_SOCKET_URL` (frontend): Backend URL
- `GEMINI_API_KEY` (backend): Google Gemini API key
- `PORT` (backend): Server port

---

## Credits
- Built by Shiva Siddhardha
- Speech-to-text by Deepgram
- Summarization by Google Gemini and HuggingFace Transformers

