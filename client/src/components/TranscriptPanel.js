import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, Divider, Stack } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import deepgramSTT from '../utils/deepgram';

const DEEPGRAM_API_KEY = process.env.REACT_APP_DEEPGRAM_API_KEY || '26f95eb3c6290594e69f91dd8091b65263346935';

const TranscriptPanel = ({ socket, roomCode, userName, users, transcripts, setTranscripts, muted }) => {
  const [listening, setListening] = useState(false);
  const dgRef = useRef(null);

  // Start Deepgram STT
  const startListening = async () => {
    if (muted) return; // Don't start if muted
    setListening(true);
    dgRef.current = await deepgramSTT(DEEPGRAM_API_KEY, (text, isFinal) => {
      if (muted) return; // Don't process if muted
      console.log('Deepgram transcript:', { text, isFinal });
      if (isFinal && text && socket) {
        socket.emit('transcript', { roomCode, from: userName, text });
        setTranscripts(prev => ({
          ...prev,
          [userName]: [...(prev[userName] || []), text]
        }));
      }
    });
  };

  // Stop Deepgram STT
  const stopListening = () => {
    setListening(false);
    if (dgRef.current && dgRef.current.stop) {
      dgRef.current.stop();
    }
  };

  // Pause/resume Deepgram when muted changes
  useEffect(() => {
    if (muted && listening) {
      // If muted while listening, stop STT
      stopListening();
    } else if (!muted && listening && !dgRef.current) {
      // If unmuted and listening, restart STT
      startListening();
    }
    // eslint-disable-next-line
  }, [muted]);

  // Display transcripts per user
  return (
    <Paper elevation={4} sx={{ p: 2, mt: 2, minWidth: 320 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Live Transcripts</Typography>
        {listening ? (
          <Button variant="contained" color="error" startIcon={<StopIcon />} onClick={stopListening} disabled={muted}>
            Stop
          </Button>
        ) : (
          <Button variant="contained" color="primary" startIcon={<MicIcon />} onClick={startListening} disabled={muted}>
            Start Transcript
          </Button>
        )}
      </Box>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={2}>
        {Object.keys(transcripts).length === 0 && (
          <Typography variant="body2" color="text.secondary">No transcripts yet.</Typography>
        )}
        {Object.entries(transcripts).map(([speaker, lines]) => (
          <Box key={speaker}>
            <Typography variant="subtitle2" color="primary">{speaker}</Typography>
            <List dense>
              {lines.map((line, idx) => (
                <ListItem key={idx}>
                  <ListItemText primary={line} />
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default TranscriptPanel; 