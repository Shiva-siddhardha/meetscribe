import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

const RoomJoin = ({ onJoin }) => {
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    if (!roomCode.trim() || !userName.trim()) {
      setError('Room code and name are required');
      return;
    }
    setError('');
    onJoin(roomCode.trim(), userName.trim());
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={4} sx={{ p: 4, minWidth: 320 }}>
        <Typography variant="h5" mb={2} align="center">Join a Meeting</Typography>
        <TextField
          label="Room Code"
          value={roomCode}
          onChange={e => setRoomCode(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Your Name"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          fullWidth
          margin="normal"
        />
        {error && <Typography color="error" variant="body2">{error}</Typography>}
        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleJoin}>
          Join
        </Button>
      </Paper>
    </Box>
  );
};

export default RoomJoin; 