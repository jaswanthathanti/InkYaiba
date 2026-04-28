import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import Toolbar from '../components/Toolbar';
import TopBar from '../components/TopBar';
import RightPanel from '../components/RightPanel';
import LiveCursors from '../components/LiveCursors';
import Canvas from '../components/Canvas';

export default function WhiteboardPage() {
  const navigate = useNavigate();
  const { socket, isConnected, emit, on, off } = useSocket();

  // User state
  const [userData, setUserData] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [isCaptain, setIsCaptain] = useState(false);
  const [users, setUsers] = useState([]);
  const [canvasTheme, setCanvasTheme] = useState('white');
  const [isLocked, setIsLocked] = useState(false);

  // Drawing state
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [brushOpacity, setBrushOpacity] = useState(1.0);
  const [strokes, setStrokes] = useState([]);
  const [undoneStrokes, setUndoneStrokes] = useState([]);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [cursors, setCursors] = useState({});

  // UI state
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightTab, setRightTab] = useState('crew');
  const [mobileToolbarOpen, setMobileToolbarOpen] = useState(false);

  // Canvas ref
  const canvasRef = useRef(null);

  // Load user data from session
  useEffect(() => {
    const stored = sessionStorage.getItem('inkyaiba-user');
    if (!stored) {
      navigate('/join');
      return;
    }
    setUserData(JSON.parse(stored));
  }, [navigate]);

  // Connect to room when socket is ready
  useEffect(() => {
    if (!socket || !isConnected || !userData) return;

    if (userData.mode === 'create') {
      emit('create-room', {
        name: userData.nickname,
        avatar: userData.avatar,
        theme: userData.canvasTheme || 'white',
      }, (response) => {
        if (response.success) {
          setRoomCode(response.roomCode);
          setCanvasTheme(response.theme);
          setUsers(response.users);
          setStrokes(response.strokes || []);
          setIsCaptain(true);
        } else {
          alert(response.error || 'Failed to create room');
          navigate('/join');
        }
      });
    } else {
      emit('join-room', {
        roomCode: userData.roomCode,
        name: userData.nickname,
        avatar: userData.avatar,
      }, (response) => {
        if (response.success) {
          setRoomCode(response.roomCode);
          setCanvasTheme(response.theme);
          setUsers(response.users);
          setStrokes(response.strokes || []);
          setMessages(response.messages || []);
          setIsCaptain(false);
          setIsLocked(response.locked || false);
        } else {
          alert(response.error || 'Failed to join room');
          navigate('/join');
        }
      });
    }
  }, [socket, isConnected, userData]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = ({ user, users }) => {
      setUsers(users);
    };

    const handleUserLeft = ({ userId, users, newCaptainId }) => {
      setUsers(users);
      setCursors(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      if (newCaptainId === socket.id) {
        setIsCaptain(true);
      }
    };

    const handleStrokeDrawn = (stroke) => {
      setStrokes(prev => [...prev, stroke]);
    };

    const handleDrawActive = (data) => {
      // Handle live drawing preview from other users
      // This is handled by the Canvas component directly
    };

    const handleStrokeUndone = ({ strokeId, userId }) => {
      setStrokes(prev => {
        const undoneStroke = prev.find(s => s.id === strokeId);
        if (undoneStroke && userId === socket.id) {
          setUndoneStrokes(uPrev => [...uPrev, undoneStroke]);
        }
        return prev.filter(s => s.id !== strokeId);
      });
    };

    const handleBoardCleared = () => {
      setStrokes([]);
      setUndoneStrokes([]);
    };

    const handleLockChanged = ({ locked }) => {
      setIsLocked(locked);
    };

    const handleKicked = () => {
      alert('You have been removed from the room by the captain.');
      sessionStorage.removeItem('inkyaiba-user');
      navigate('/join');
    };

    const handleCursorUpdate = (data) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: data,
      }));
    };

    const handleCursorRemove = ({ userId }) => {
      setCursors(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    };

    const handleNewMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    const handleMessageReaction = ({ messageId, emoji, userId, name }) => {
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions };
          if (!reactions[emoji]) reactions[emoji] = [];
          if (!reactions[emoji].includes(name)) reactions[emoji].push(name);
          return { ...msg, reactions };
        }
        return msg;
      }));
    };

    on('user-joined', handleUserJoined);
    on('user-left', handleUserLeft);
    on('stroke-drawn', handleStrokeDrawn);
    on('draw-active', handleDrawActive);
    on('stroke-undone', handleStrokeUndone);
    on('board-cleared', handleBoardCleared);
    on('lock-changed', handleLockChanged);
    on('kicked', handleKicked);
    on('cursor-update', handleCursorUpdate);
    on('cursor-remove', handleCursorRemove);
    on('new-message', handleNewMessage);
    on('message-reaction', handleMessageReaction);

    return () => {
      off('user-joined', handleUserJoined);
      off('user-left', handleUserLeft);
      off('stroke-drawn', handleStrokeDrawn);
      off('draw-active', handleDrawActive);
      off('stroke-undone', handleStrokeUndone);
      off('board-cleared', handleBoardCleared);
      off('lock-changed', handleLockChanged);
      off('kicked', handleKicked);
      off('cursor-update', handleCursorUpdate);
      off('cursor-remove', handleCursorRemove);
      off('new-message', handleNewMessage);
      off('message-reaction', handleMessageReaction);
    };
  }, [socket, on, off, navigate]);

  // Handle undo
  const handleUndo = useCallback(() => {
    emit('undo');
  }, [emit]);

  // Handle redo — re-add from local undone stack
  const handleRedo = useCallback(() => {
    if (undoneStrokes.length === 0) return;
    const stroke = undoneStrokes[undoneStrokes.length - 1];
    setUndoneStrokes(prev => prev.slice(0, -1));
    setStrokes(prev => [...prev, stroke]);
    emit('draw-stroke', stroke);
  }, [undoneStrokes, emit]);

  // Handle new local stroke
  const handleStrokeComplete = useCallback((strokeData) => {
    const strokeId = `${socket?.id || 'anon'}-${Date.now()}`;
    const strokeWithId = { ...strokeData, id: strokeId, userId: socket?.id };
    emit('draw-stroke', strokeWithId);
    setStrokes(prev => [...prev, strokeWithId]);
    setUndoneStrokes([]);
  }, [emit, socket]);

  // Handle active drawing broadcast
  const handleDrawActive = useCallback((data) => {
    emit('draw-active', data);
  }, [emit]);

  // Handle cursor move
  const handleCursorMove = useCallback((x, y) => {
    if (!userData) return;
    const user = users.find(u => u.id === socket?.id);
    emit('cursor-move', {
      x,
      y,
      name: userData.nickname,
      avatar: userData.avatar,
      color: user?.color || '#E74C3C',
    });
  }, [emit, userData, users, socket]);

  // Handle leave room
  const handleLeaveRoom = useCallback(() => {
    emit('leave-room');
    sessionStorage.removeItem('inkyaiba-user');
    navigate('/');
  }, [emit, navigate]);

  // Handle clear board
  const handleClearBoard = useCallback(() => {
    if (!isCaptain) return;
    if (window.confirm('Clear the entire board? This cannot be undone.')) {
      emit('clear-board');
    }
  }, [isCaptain, emit]);

  // Handle toggle lock
  const handleToggleLock = useCallback(() => {
    if (!isCaptain) return;
    emit('toggle-lock');
  }, [isCaptain, emit]);

  // Handle kick user
  const handleKickUser = useCallback((userId) => {
    if (!isCaptain) return;
    emit('kick-user', userId);
  }, [isCaptain, emit]);

  // Handle send message
  const handleSendMessage = useCallback((text) => {
    if (!text.trim() || !userData) return;
    emit('chat-message', {
      name: userData.nickname,
      avatar: userData.avatar,
      text: text.trim(),
    });
  }, [emit, userData]);

  // Handle reaction
  const handleReaction = useCallback((messageId, emoji) => {
    if (!userData) return;
    emit('chat-reaction', {
      messageId,
      emoji,
      name: userData.nickname,
    });
  }, [emit, userData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, handleRedo]);

  if (!userData) return null;

  const canDraw = !isLocked || isCaptain;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-sky-200 text-slate-800 font-body relative">
      {/* Background Ambience Layer */}
      <div className="fixed inset-0 z-0 bg-sky-300 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-full h-[60vh] bg-gradient-to-t from-sky-500/30 to-transparent pointer-events-none z-0" />
      <div 
        className="fixed inset-0 z-0 opacity-10 pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.5) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />
      {/* Fake clouds via CSS */}
      <div className="fixed top-20 left-20 w-64 h-24 bg-white/40 blur-3xl rounded-full z-0 pointer-events-none" />
      <div className="fixed top-40 right-20 w-96 h-32 bg-white/40 blur-3xl rounded-full z-0 pointer-events-none" />
      {/* Top Bar */}
      <TopBar
        roomCode={roomCode}
        isCaptain={isCaptain}
        users={users}
        userCount={users.length}
        isLocked={isLocked}
        canvasRef={canvasRef}
        strokes={strokes}
        onLeave={handleLeaveRoom}
        onClear={handleClearBoard}
        onToggleLock={handleToggleLock}
      />

      <div className="flex-1 flex overflow-hidden relative z-10 w-full max-w-[1920px] mx-auto p-4 md:p-6 gap-4">
        {/* Left Toolbar */}
        <div className={`hidden md:block`}>
          <Toolbar
            tool={tool}
            setTool={setTool}
            color={color}
            setColor={setColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            brushOpacity={brushOpacity}
            setBrushOpacity={setBrushOpacity}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={strokes.length > 0}
            canRedo={undoneStrokes.length > 0}
          />
        </div>

        {/* Canvas Wrap */}
        <div className="flex-1 relative overflow-hidden rounded-2xl border-[3px] border-[#D4A373] bg-[#FDF6E3] shadow-[8px_8px_0px_rgba(0,0,0,0.15)] flex flex-col">
          <Canvas
            ref={canvasRef}
            tool={tool}
            color={color}
            brushSize={brushSize}
            brushOpacity={brushOpacity}
            theme={canvasTheme}
            strokes={strokes}
            canDraw={canDraw}
            onStrokeComplete={handleStrokeComplete}
            onDrawActive={handleDrawActive}
            onCursorMove={handleCursorMove}
            socket={socket}
          />
          <LiveCursors cursors={cursors} />
        </div>

        {/* Right Panel */}
        <div className="hidden lg:block w-80 h-full rounded-2xl border-[3px] border-[#D4A373] bg-[#1A1A1A] shadow-[8px_8px_0px_rgba(0,0,0,0.15)] overflow-hidden">
          <RightPanel
            tab={rightTab}
            setTab={setRightTab}
            users={users}
            messages={messages}
            isCaptain={isCaptain}
            currentUserId={socket?.id}
            onKick={handleKickUser}
            onSendMessage={handleSendMessage}
            onReaction={handleReaction}
          />
        </div>
      </div>

      {/* Mobile Bottom Toolbar */}
      <div className="md:hidden">
        <div className="flex items-center justify-around py-2 px-4 border-t bg-surface-navy border-border-navy">
          <button
            onClick={() => setMobileToolbarOpen(!mobileToolbarOpen)}
            className="p-2 rounded-lg hover:bg-white/5"
          >
            🎨
          </button>
          {['pen', 'eraser', 'rectangle', 'circle', 'line'].map(t => (
            <button
              key={t}
              onClick={() => setTool(t)}
              className={`p-2 rounded-lg text-sm ${tool === t ? 'bg-primary text-white' : 'hover:bg-white/5'}`}
            >
              {t === 'pen' ? '✏️' : t === 'eraser' ? '🧹' : t === 'rectangle' ? '⬜' : t === 'circle' ? '⭕' : '📏'}
            </button>
          ))}
          <button
            onClick={() => { setRightPanelOpen(!rightPanelOpen); setRightTab('chat'); }}
            className="p-2 rounded-lg hover:bg-white/5"
          >
            💬
          </button>
          <button
            onClick={() => { setRightPanelOpen(!rightPanelOpen); setRightTab('crew'); }}
            className="p-2 rounded-lg hover:bg-white/5"
          >
            👥
          </button>
        </div>
      </div>

      {/* Mobile drawers */}
      {mobileToolbarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileToolbarOpen(false)}>
          <div className="absolute bottom-16 left-0 right-0 p-4 bg-surface-navy rounded-t-2xl" onClick={e => e.stopPropagation()}>
            <Toolbar
              tool={tool}
              setTool={(t) => { setTool(t); setMobileToolbarOpen(false); }}
              color={color}
              setColor={setColor}
              brushSize={brushSize}
              setBrushSize={setBrushSize}
              brushOpacity={brushOpacity}
              setBrushOpacity={setBrushOpacity}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={strokes.length > 0}
              canRedo={undoneStrokes.length > 0}
              horizontal
            />
          </div>
        </div>
      )}

      {rightPanelOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setRightPanelOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface-navy" onClick={e => e.stopPropagation()}>
            <RightPanel
              tab={rightTab}
              setTab={setRightTab}
              users={users}
              messages={messages}
              isCaptain={isCaptain}
              currentUserId={socket?.id}
              onKick={handleKickUser}
              onSendMessage={handleSendMessage}
              onReaction={handleReaction}
            />
          </div>
        </div>
      )}
    </div>
  );
}
