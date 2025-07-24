import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import RoomJoin from './components/RoomJoin';
import VideoChat from './components/VideoChat';
import TranscriptPanel from './components/TranscriptPanel';
import SummaryViewer from './components/SummaryViewer';
// import { summarizeTranscript } from './utils/geminiApi'; // (removed)
import { CssBaseline, Container, Box, Typography } from '@mui/material';

const ENDPOINT = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

async function summarizeTranscript(transcript, speaker = '', summarizer = 'gemini') {
  try {
    const response = await fetch('/summarize-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, speaker, summarizer })
    });
    if (!response.ok) throw new Error('Failed to summarize');
    const data = await response.json();
    console.log('Summary API response:', data);
    return data; // Return the full object
  } catch (err) {
    console.error('Summarization error:', err);
    return {};
  }
}

function App() {
  const [socket, setSocket] = useState(null);
  const [joined, setJoined] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState([]); // [{id, name}]
  const [transcripts, setTranscripts] = useState({}); // {User_B: [..]}
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);

  // Join room
  const handleJoin = (room, name) => {
    setRoomCode(room);
    setUserName(name);
    const sock = io(ENDPOINT);
    setSocket(sock);
    sock.emit('join-room', { roomCode: room, userName: name });
    setJoined(true);
  };

  // Socket events
  useEffect(() => {
    if (!socket) return;
    socket.on('room-users', (roomUsers) => {
      setUsers(roomUsers);
    });
    socket.on('user-joined', (user) => {
      setUsers(prev => [...prev, user]);
    });
    socket.on('user-left', ({ id }) => {
      setUsers(prev => prev.filter(u => u.id !== id));
      setTranscripts(prev => {
        const newT = { ...prev };
        Object.keys(newT).forEach(speaker => {
          if (users.find(u => u.id === id && u.name === speaker)) {
            delete newT[speaker];
          }
        });
        return newT;
      });
    });
    socket.on('transcript', ({ from, text }) => {
      setTranscripts(prev => ({
        ...prev,
        [from]: [...(prev[from] || []), text]
      }));
    });
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [socket]);

  // Summarize handler
  const handleSummarize = async (text, speaker, summarizer) => {
    setLoading(true);
    setSummary([]); // or setSummary({})
    const result = await summarizeTranscript(text, speaker, summarizer);
    setSummary(result); // <-- store the full object
    setLoading(false);
  };

  if (!joined) {
    return <RoomJoin onJoin={handleJoin} />;
  }

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>MeetScribe AI</Typography>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          <Box flex={2}>
            <VideoChat
              socket={socket}
              roomCode={roomCode}
              userName={userName}
              users={users}
              muted={muted}
              setMuted={setMuted}
            />
          </Box>
          <Box flex={1} minWidth={340}>
            <TranscriptPanel
              socket={socket}
              roomCode={roomCode}
              userName={userName}
              users={users}
              transcripts={transcripts}
              setTranscripts={setTranscripts}
              muted={muted}
            />
            <SummaryViewer
              transcripts={transcripts}
              onSummarize={handleSummarize}
              summary={summary}
              loading={loading}
            />
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default App;
