// InkYaiba Room Store — In-memory state management
// Stores all room data: users, strokes, settings

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function createRoom(captainId, captainName, captainAvatar, theme = 'white') {
  let code = generateRoomCode();
  // Ensure unique
  while (rooms.has(code)) {
    code = generateRoomCode();
  }

  const room = {
    code,
    theme,
    captainId,
    locked: false,
    users: new Map(),
    strokes: [],
    messages: [],
    createdAt: Date.now(),
  };

  room.users.set(captainId, {
    id: captainId,
    name: captainName,
    avatar: captainAvatar,
    color: getUniqueColor(0),
    isCaptain: true,
    joinedAt: Date.now(),
  });

  rooms.set(code, room);
  return room;
}

function joinRoom(roomCode, userId, userName, userAvatar) {
  const room = rooms.get(roomCode);
  if (!room) return null;

  const userIndex = room.users.size;
  room.users.set(userId, {
    id: userId,
    name: userName,
    avatar: userAvatar,
    color: getUniqueColor(userIndex),
    isCaptain: false,
    joinedAt: Date.now(),
  });

  return room;
}

function leaveRoom(roomCode, userId) {
  const room = rooms.get(roomCode);
  if (!room) return null;

  room.users.delete(userId);

  // If room is empty, delete it
  if (room.users.size === 0) {
    rooms.delete(roomCode);
    return { deleted: true };
  }

  // If captain left, assign new captain
  if (room.captainId === userId) {
    const firstUser = room.users.values().next().value;
    if (firstUser) {
      room.captainId = firstUser.id;
      firstUser.isCaptain = true;
    }
  }

  return room;
}

function getRoom(roomCode) {
  return rooms.get(roomCode) || null;
}

function getRoomUsers(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return [];
  return Array.from(room.users.values());
}

function addStroke(roomCode, stroke) {
  const room = rooms.get(roomCode);
  if (!room) return;
  room.strokes.push(stroke);
}

function clearStrokes(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;
  room.strokes = [];
}

function removeLastStroke(roomCode, userId) {
  const room = rooms.get(roomCode);
  if (!room) return null;
  // Find last stroke by this user
  for (let i = room.strokes.length - 1; i >= 0; i--) {
    if (room.strokes[i].userId === userId) {
      const removed = room.strokes.splice(i, 1)[0];
      return removed;
    }
  }
  return null;
}

function addMessage(roomCode, message) {
  const room = rooms.get(roomCode);
  if (!room) return;
  room.messages.push(message);
  // Keep only last 200 messages
  if (room.messages.length > 200) {
    room.messages = room.messages.slice(-200);
  }
}

function setLocked(roomCode, locked) {
  const room = rooms.get(roomCode);
  if (!room) return;
  room.locked = locked;
}

function removeUser(roomCode, userId) {
  return leaveRoom(roomCode, userId);
}

// 16 distinct user colors
const USER_COLORS = [
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
  '#9B59B6', '#1ABC9C', '#E67E22', '#E91E63',
  '#00BCD4', '#8BC34A', '#FF5722', '#607D8B',
  '#795548', '#CDDC39', '#FF9800', '#4CAF50',
];

function getUniqueColor(index) {
  return USER_COLORS[index % USER_COLORS.length];
}

module.exports = {
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
  generateRoomCode,
};
