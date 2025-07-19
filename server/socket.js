const { Server } = require('socket.io');

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // In-memory room user tracking
  const roomUsers = {};

  io.on('connection', (socket) => {
    // Join room
    socket.on('join-room', ({ roomCode, userName }) => {
      socket.join(roomCode);
      if (!roomUsers[roomCode]) roomUsers[roomCode] = [];
      roomUsers[roomCode].push({ id: socket.id, name: userName });
      // Notify others
      socket.to(roomCode).emit('user-joined', { id: socket.id, name: userName });
      // Send current users to new user
      socket.emit('room-users', roomUsers[roomCode]);
    });

    // WebRTC signaling
    socket.on('signal', ({ roomCode, signal, to }) => {
      io.to(to).emit('signal', { from: socket.id, signal });
    });

    // Transcript event
    socket.on('transcript', ({ roomCode, from, text }) => {
      // Broadcast to all in room except sender
      socket.to(roomCode).emit('transcript', { from, text });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      for (const roomCode in roomUsers) {
        const idx = roomUsers[roomCode].findIndex(u => u.id === socket.id);
        if (idx !== -1) {
          const [user] = roomUsers[roomCode].splice(idx, 1);
          io.to(roomCode).emit('user-left', { id: socket.id, name: user.name });
          if (roomUsers[roomCode].length === 0) delete roomUsers[roomCode];
          break;
        }
      }
    });
  });
}

module.exports = { setupSocket }; 