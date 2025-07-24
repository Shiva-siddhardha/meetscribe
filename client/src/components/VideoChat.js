import React, { useEffect, useRef, useState } from 'react';
import { Box, Grid, Typography, IconButton, Tooltip, Avatar, Paper } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SimplePeer from 'simple-peer';

const VideoChat = ({ socket, roomCode, userName, users, onTranscript, onUserChange, muted, setMuted }) => {
  const [cameraOff, setCameraOff] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // { id: MediaStream }
  const localVideoRef = useRef();
  const peersRef = useRef({}); // { id: SimplePeer }
  const myIdRef = useRef(null);
  const remoteVideoRefs = useRef({}); // { id: ref }

  // Get user media and set local video
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error('getUserMedia error:', err);
      });
  }, []);

  // Set local video srcObject when stream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote streams to their video elements
  useEffect(() => {
    Object.entries(remoteStreams).forEach(([id, stream]) => {
      if (remoteVideoRefs.current[id] && remoteVideoRefs.current[id].current) {
        remoteVideoRefs.current[id].current.srcObject = stream;
      }
    });
  }, [remoteStreams]);

  // Get my socket id
  useEffect(() => {
    if (!socket) return;
    myIdRef.current = socket.id;
    socket.on('connect', () => {
      myIdRef.current = socket.id;
    });
    return () => {
      socket.off('connect');
    };
  }, [socket]);

  // Handle peer connections
  useEffect(() => {
    if (!socket || !localStream) return;

    // Helper: create peer
    const createPeer = (userId, initiator) => {
      console.log(`[${userName}] Creating peer for ${userId}, initiator: ${initiator}`);
      const peer = new SimplePeer({
        initiator,
        trickle: false,
        stream: localStream
      });
      peer.on('signal', signal => {
        console.log(`[${userName}] Sending signal to ${userId}`, signal);
        socket.emit('signal', { roomCode, signal, to: userId });
      });
      peer.on('stream', stream => {
        console.log(`[${userName}] Received stream from ${userId}`);
        setRemoteStreams(prev => ({ ...prev, [userId]: stream }));
      });
      peer.on('error', err => {
        console.error(`[${userName}] Peer error with ${userId}:`, err);
      });
      peer.on('close', () => {
        console.log(`[${userName}] Peer connection closed with ${userId}`);
      });
      return peer;
    };

    // When joining, connect to all existing users as receiver
    const handleRoomUsers = (roomUsers) => {
      console.log(`[${userName}] handleRoomUsers`, roomUsers);
      // Find my own id
      const me = roomUsers.find(u => u.name === userName);
      if (me) myIdRef.current = me.id;
      roomUsers.forEach(user => {
        if (user.name !== userName && !peersRef.current[user.id]) {
          // Joining user: create peer as receiver for each existing user
          console.log(`[${userName}] Creating peer as receiver for`, user.name, user.id);
          const peer = createPeer(user.id, false);
          peersRef.current[user.id] = peer;
        }
      });
    };

    // When a new user joins, existing users create peer as initiator
    const handleUserJoined = ({ id, name }) => {
      console.log(`[${userName}] user-joined event:`, id, name);
      if (name !== userName && !peersRef.current[id]) {
        // Existing users: create peer as initiator for new user
        console.log(`[${userName}] Creating peer as initiator for`, name, id);
        const peer = createPeer(id, true);
        peersRef.current[id] = peer;
      }
    };

    // Handle incoming signal
    const handleSignal = ({ from, signal }) => {
      console.log(`[${userName}] Received signal from`, from, signal);
      const peer = peersRef.current[from];
      if (peer) {
        peer.signal(signal);
      } else {
        // If peer doesn't exist yet, create as receiver
        console.log(`[${userName}] Creating peer on signal from`, from);
        const newPeer = createPeer(from, false);
        peersRef.current[from] = newPeer;
        newPeer.signal(signal);
      }
    };

    // Handle user leaving
    const handleUserLeft = ({ id }) => {
      console.log(`[${userName}] user-left event:`, id);
      if (peersRef.current[id]) {
        peersRef.current[id].destroy();
        delete peersRef.current[id];
        setRemoteStreams(prev => {
          const newStreams = { ...prev };
          delete newStreams[id];
          return newStreams;
        });
        if (onUserChange) onUserChange();
      }
    };

    socket.on('room-users', handleRoomUsers);
    socket.on('user-joined', handleUserJoined);
    socket.on('signal', handleSignal);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('room-users', handleRoomUsers);
      socket.off('user-joined', handleUserJoined);
      socket.off('signal', handleSignal);
      socket.off('user-left', handleUserLeft);
      Object.values(peersRef.current).forEach(peer => peer.destroy());
      peersRef.current = {};
      setRemoteStreams({});
    };
    // eslint-disable-next-line
  }, [socket, localStream, userName, roomCode]);

  // Mute/camera toggle
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
      setMuted(!muted);
    }
  };
  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !cameraOff;
      });
      setCameraOff(!cameraOff);
    }
  };

  // Render video grid
  const renderVideo = (stream, name, isLocal = false, id = null) => {
    const videoRef = isLocal ? localVideoRef : (remoteVideoRefs.current[id] || (remoteVideoRefs.current[id] = React.createRef()));
    return (
      <Paper elevation={3} sx={{ p: 1, bgcolor: isLocal ? '#e3f2fd' : '#fff' }}>
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          style={{ width: 220, height: 160, borderRadius: 8, background: '#000' }}
        />
        <Box display="flex" alignItems="center" mt={1}>
          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{name[0]}</Avatar>
          <Typography variant="body2">{name} {isLocal && '(You)'}</Typography>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item>{localStream && renderVideo(localStream, userName, true)}</Grid>
        {users.filter(u => u.name !== userName).map(u => (
          <Grid item key={u.id}>
            {remoteStreams[u.id] ? renderVideo(remoteStreams[u.id], u.name, false, u.id) : (
              <Paper elevation={1} sx={{ width: 220, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f0f0' }}>
                <Typography variant="body2">Connecting to {u.name}...</Typography>
              </Paper>
            )}
          </Grid>
        ))}
      </Grid>
      <Box display="flex" justifyContent="center" mt={2}>
        <Tooltip title={muted ? 'Unmute' : 'Mute'}>
          <IconButton onClick={toggleMute} color={muted ? 'error' : 'primary'}>
            {muted ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={cameraOff ? 'Turn Camera On' : 'Turn Camera Off'}>
          <IconButton onClick={toggleCamera} color={cameraOff ? 'error' : 'primary'}>
            {cameraOff ? <VideocamOffIcon /> : <VideocamIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default VideoChat; 