// InkYaiba Socket Handlers — Real-time event management
const {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoom,
  getRoomUsers,
  addStroke,
  clearStrokes,
  removeLastStroke,
  addMessage,
  setLocked,
  removeUser,
} = require('./roomStore');

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {


    let currentRoom = null;
    let currentUser = null;

    // ── Create Room ──
    socket.on('create-room', ({ name, avatar, theme }, callback) => {
      try {
        const room = createRoom(socket.id, name, avatar, theme || 'white');
        currentRoom = room.code;
        currentUser = { id: socket.id, name, avatar };

        socket.join(room.code);

        const users = getRoomUsers(room.code);
        callback({
          success: true,
          roomCode: room.code,
          theme: room.theme,
          users,
          strokes: room.strokes,
          isCaptain: true,
        });

      } catch (err) {
        callback({ success: false, error: 'Failed to create room' });
      }
    });

    // ── Join Room ──
    socket.on('join-room', ({ roomCode, name, avatar }, callback) => {
      try {
        const code = roomCode.toUpperCase().trim();
        const existingRoom = getRoom(code);
        if (!existingRoom) {
          return callback({ success: false, error: 'Room not found' });
        }

        if (existingRoom.users.size >= 20) {
          return callback({ success: false, error: 'Room is full (max 20)' });
        }

        // Uniqueness check
        for (const user of existingRoom.users.values()) {
          if (user.name.toLowerCase() === name.toLowerCase()) {
            return callback({ success: false, error: 'Nickname is already taken in this room' });
          }
        }

        const room = joinRoom(code, socket.id, name, avatar);
        currentRoom = code;
        currentUser = { id: socket.id, name, avatar };

        socket.join(code);

        const users = getRoomUsers(code);
        const user = room.users.get(socket.id);

        // Notify others
        socket.to(code).emit('user-joined', {
          user,
          users,
        });

        callback({
          success: true,
          roomCode: code,
          theme: room.theme,
          users,
          strokes: room.strokes,
          messages: room.messages,
          isCaptain: false,
          locked: room.locked,
        });

        console.log(`🧭 ${name} joined room ${code}`);
      } catch (err) {
        callback({ success: false, error: 'Failed to join room' });
      }
    });

    // ── Drawing Events ──
    socket.on('draw-stroke', (strokeData) => {
      if (!currentRoom) return;
      const room = getRoom(currentRoom);
      if (!room) return;
      if (room.locked && room.captainId !== socket.id) return;

      const stroke = {
        ...strokeData,
        userId: socket.id,
        id: strokeData.id || `${socket.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      };
      addStroke(currentRoom, stroke);
      socket.to(currentRoom).emit('stroke-drawn', stroke);
    });

    socket.on('draw-active', (data) => {
      if (!currentRoom) return;
      socket.to(currentRoom).emit('draw-active', {
        ...data,
        userId: socket.id,
      });
    });

    // ── Undo ──
    socket.on('undo', () => {
      if (!currentRoom) return;
      const removed = removeLastStroke(currentRoom, socket.id);
      if (removed) {
        io.to(currentRoom).emit('stroke-undone', {
          strokeId: removed.id,
          userId: socket.id,
        });
      }
    });

    // ── Clear Board (Captain only) ──
    socket.on('clear-board', () => {
      if (!currentRoom) return;
      const room = getRoom(currentRoom);
      if (!room || room.captainId !== socket.id) return;
      clearStrokes(currentRoom);
      io.to(currentRoom).emit('board-cleared');
    });

    // ── Lock Drawing (Captain only) ──
    socket.on('toggle-lock', () => {
      if (!currentRoom) return;
      const room = getRoom(currentRoom);
      if (!room || room.captainId !== socket.id) return;
      room.locked = !room.locked;
      io.to(currentRoom).emit('lock-changed', { locked: room.locked });
    });

    // ── Kick User (Captain only) ──
    socket.on('kick-user', (targetId) => {
      if (!currentRoom) return;
      const room = getRoom(currentRoom);
      if (!room || room.captainId !== socket.id) return;
      if (targetId === socket.id) return; // Can't kick yourself

      // Find the target socket
      const targetSocket = io.sockets.sockets.get(targetId);
      if (targetSocket) {
        targetSocket.emit('kicked');
        targetSocket.leave(currentRoom);
      }

      removeUser(currentRoom, targetId);
      const users = getRoomUsers(currentRoom);
      io.to(currentRoom).emit('user-left', { userId: targetId, users });
    });

    // ── Cursor Movement ──
    socket.on('cursor-move', (data) => {
      if (!currentRoom) return;
      socket.to(currentRoom).emit('cursor-update', {
        userId: socket.id,
        x: data.x,
        y: data.y,
        name: data.name,
        avatar: data.avatar,
        color: data.color,
      });
    });

    // ── Chat ──
    socket.on('chat-message', (data) => {
      if (!currentRoom) return;
      const msg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId: socket.id,
        name: data.name,
        avatar: data.avatar,
        text: data.text,
        timestamp: Date.now(),
        reactions: {},
      };
      addMessage(currentRoom, msg);
      io.to(currentRoom).emit('new-message', msg);
    });

    socket.on('chat-reaction', ({ messageId, emoji, name }) => {
      if (!currentRoom) return;
      io.to(currentRoom).emit('message-reaction', {
        messageId,
        emoji,
        userId: socket.id,
        name,
      });
    });

    // ── Leave Room ──
    socket.on('leave-room', () => {
      handleLeave();
    });

    // ── Disconnect ──
    socket.on('disconnect', () => {
      handleLeave();
    });

    function handleLeave() {
      if (!currentRoom) return;
      const code = currentRoom;
      const result = leaveRoom(code, socket.id);

      socket.leave(code);

      if (result && !result.deleted) {
        const users = getRoomUsers(code);
        io.to(code).emit('user-left', {
          userId: socket.id,
          users,
          newCaptainId: result.captainId,
        });
      }

      // Notify cursor removal
      io.to(code).emit('cursor-remove', { userId: socket.id });

      currentRoom = null;
      currentUser = null;
    }
  });
}

module.exports = { setupSocketHandlers };
