# MeetScribe

**MeetScribe** is a real-time video meeting platform with live transcription and AI-powered summarization. It enables users to join video rooms, get live speech-to-text transcripts, and generate concise meeting summaries using Google Gemini AI. Built with React, Node.js, WebRTC, and Socket.IO, it supports both cloud (Deepgram) and offline (Vosk) speech recognition.

---

## Features

- Multi-user video conferencing (WebRTC)
- Room-based meetings (join with code and name)
- Live speech-to-text transcription (Deepgram API or Vosk offline)
- Per-user transcript tracking
- AI-powered meeting summarization (Google Gemini API)
- Download summaries as PDF
- Real-time collaboration (Socket.IO)
- Mute/unmute, camera on/off controls

---

## Tech Stack

- **Frontend:** React 19, Material-UI, Socket.IO Client, simple-peer, jsPDF, vosk-browser
- **Backend:** Node.js, Express, Socket.IO, Axios, dotenv, cors
- **Speech-to-Text:** Deepgram API (cloud), Vosk (offline, in-browser)
- **AI Summarization:** Google Gemini API

---

## Folder Structure

```
meetscribe/
  client/      # React frontend
  server/      # Node.js/Express backend
```

---

## Installation & Setup

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
```

### 4. Run Locally

#### **Start Backend**
```bash
cd server
npm start # or node server.js
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
5. Summarize the meeting and download the summary as PDF.

---

## Deployment

1. **Build the frontend:**
   ```bash
   cd client
   npm run build
   ```
2. **Serve the build from Express:**
   - Copy `client/build` to `server/build` (or reference it directly).
   - In `server/server.js`, add:
     ```js
     const path = require('path');
     app.use(express.static(path.join(__dirname, 'build')));
     app.get('*', (req, res) => {
       res.sendFile(path.join(__dirname, 'build', 'index.html'));
     });
     ```
3. **Deploy the `server/` folder** to your host (Render, Heroku, etc.).
4. **Set environment variables** in your hosting dashboard.
5. **Point your domain** to the deployed backend.

---

## Environment Variables

- `REACT_APP_DEEPGRAM_API_KEY` (frontend): Deepgram API key
- `REACT_APP_SOCKET_URL` (frontend): Backend URL
- `GEMINI_API_KEY` (backend): Google Gemini API key
- `PORT` (backend): Server port

---

## License

MIT License

---

## Credits
- Built by Shiva Siddhardha
- Speech-to-text by Deepgram and Vosk
- Summarization by Google Gemini

---

## Screenshots
*Add screenshots here if desired* 