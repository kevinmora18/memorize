import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { RoomWaiting } from './components/RoomWaiting';
import { MultiplayerGame } from './components/MultiplayerGame';
import { FinalResults } from './components/FinalResults';
import { GameBoard } from './components/GameBoard';
import { BossFight } from './components/BossFight';
import { BossSelect } from './components/BossSelect';
import { RewardScreen } from './components/RewardScreen';
import { GameScreen } from './components/GameScreen';
import { ClassicLevelSelect } from './components/ClassicLevelSelect';
import { LoadingScreen } from './components/LoadingScreen';
import { InfiniteMode } from './components/InfiniteMode';
import { ChallengeMode } from './components/ChallengeMode';
import { AIFriendsGame } from './components/AIFriendsGame';
import { AIRoomLobby } from './components/AIRoomLobby';
import { AIRoomWaiting } from './components/AIRoomWaiting';
import { ProfileScreen } from './components/ProfileScreen';
import { RankedScreen } from './components/RankedScreen';
import { TiendaScreen } from './components/TiendaScreen';
import { CollectionScreen } from './components/CollectionScreen';
import { AdminPanel } from './components/AdminPanel';
import { ParejasConexiones } from './components/ParejasConexiones';
import { TriadasConexiones } from './components/TriadasConexiones';
import { loadPlayerStats, savePlayerStats, addXP } from './lib/playerEvolution';
import socket from './lib/socket';
import { API_BASE, setToken, saveUser, clearSession, getToken, loadUser, apiGet } from './lib/api';

export type Universe = 'volcania' | 'frostheim' | 'neural' | 'verdalis' | 'lunaris';
export type BossType = 'naturaleza' | 'ciencia' | 'humano' | 'ecosistema' | 'tecnologia';

export type GameScreen = 'login' | 'register' | 'lobby' | 'roomWaiting' | 'multiplayerGame' | 'finalResults' | 'game' | 'boss' | 'boss-select' | 'reward' | 'classic' | 'classicLevelSelect' | 'loading' | 'infinite' | 'challenge' | 'ai-friends' | 'ai-room-lobby' | 'ai-room-waiting' | 'profile' | 'ranked' | 'tienda' | 'collection' | 'admin';



export type Player = {
  id: string;
  email: string;
  teamId: number;
  role?: string;
  level?: number;
  xp?: number;
  coins?: number;
  gems?: number;
};

export type Room = {
  id: string;
  name: string;
  code: string;
  players: Player[];
  maxPlayers: number;
  isStarted: boolean;
  currentRound: number;
  currentTeam: number;
  creatorId: string;
  gameMode?: 'classic' | 'connections' | 'triads';
  cardCount?: number;
};


export default function App() {

  const [currentScreen, setCurrentScreen] = useState<GameScreen>('login');
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [classicLevel, setClassicLevel] = useState(1);
  const [postLoadingScreen, setPostLoadingScreen] = useState<GameScreen | null>(null);
  const [selectedBossType, setSelectedBossType] = useState<BossType>('naturaleza');
  
  const [rooms, setRooms] = useState<Room[]>([]);

  const [multiplayerInitialCards, setMultiplayerInitialCards] = useState<any[] | null>(null);

  // Restaurar sesión persistida al cargar la app
  useEffect(() => {
    const token = getToken();
    const savedUser = loadUser() as Player | null;

    if (token && savedUser) {
      setCurrentUser({ ...savedUser, teamId: savedUser.teamId || 0 });
      setCurrentScreen('lobby');
      socket.connect();
    }
  }, []);

  useEffect(() => {
    socket.on('rooms:update', (data: Room[]) => setRooms(data));
    socket.on('player:joined', (payload: any) => {
      console.log('player joined', payload);
    });
    socket.on('room:started', (payload: any) => {
      console.log('room started', payload);
      setCurrentScreen('multiplayerGame');
    });
    socket.on('game:started', (payload: any) => {
      console.log('game started with cards', payload);
      if (payload?.cards) {
        setMultiplayerInitialCards(payload.cards);
      }
      setCurrentScreen('multiplayerGame');
    });
    socket.on('connect_error', (err: any) => {
      // Si el token es inválido, la sesión del socket fallará; reintenta en lobby
      console.warn('Socket connect_error:', err?.message);
    });

    const fetchRooms = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/rooms`);
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
        }
      } catch (err) {
        // Silencioso
      }
    };

    fetchRooms();
    const interval = setInterval(fetchRooms, 2000);

    return () => {
      clearInterval(interval);
      socket.off('rooms:update');
      socket.off('player:joined');
      socket.off('room:started');
      socket.off('game:started');
      socket.off('connect_error');
    };
  }, []);

  const [selectedUniverse, setSelectedUniverse] = useState<Universe | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    if (currentRoom) {
      const updatedRoomData = rooms.find(r => r.id === currentRoom.id || r.code === currentRoom.code);
      if (updatedRoomData) {
        setCurrentRoom(updatedRoomData);
      }
    }
  }, [rooms]);

  const handleLoginSuccess = (userData: any, token: string) => {
    setToken(token);
    saveUser(userData);

    const player: Player = {
      id: userData.id,
      email: userData.email,
      teamId: 0,
      role: userData.role || 'player',
      level: userData.level || 1,
      xp: userData.xp || 0,
      coins: userData.coins || 1500,
      gems: userData.gems || 80,
    };
    setCurrentUser(player);
    setCurrentScreen('lobby');

    // Reconectar Socket.IO con la sesión autenticada
    if (!socket.connected) {
      socket.connect();
    }
  };


  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateRoom = async (
    roomName?: string,
    gameMode: 'classic' | 'connections' | 'triads' = 'triads',
    cardCount: number = 12
  ) => {
    let activeUser = currentUser;
    if (!activeUser) {
      activeUser = {
        id: `guest_${Date.now()}`,
        email: `Jugador_${Math.floor(Math.random() * 8999 + 1000)}@host.com`,
        teamId: 1,
        role: 'player',
        level: 1,
      };
      setCurrentUser(activeUser);
    }

    const code = generateRoomCode();
    const fallbackRoom: Room = {
      id: `room_${Date.now()}`,
      name: roomName || `Duelo 1 vs 1 (${gameMode.toUpperCase()})`,
      code,
      players: [{ ...activeUser, teamId: 1 }],
      maxPlayers: 2,
      isStarted: false,
      currentRound: 1,
      currentTeam: 1,
      creatorId: activeUser.id,
      gameMode,
      cardCount,
    };

    try {
      const res = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName || `Duelo 1 vs 1 (${gameMode.toUpperCase()})`,
          code,
          hostId: activeUser.id,
          creator: activeUser,
          maxPlayers: 2,
          mode: gameMode,
          cardCount,
        }),
      });
      if (res.ok) {
        const newRoom = await res.json() as Room;
        const completeRoom = { ...newRoom, code: newRoom.code || code, gameMode, cardCount };
        setRooms(prev => [completeRoom, ...prev.filter(r => r.id !== completeRoom.id)]);
        setCurrentRoom(completeRoom);
        setCurrentScreen('roomWaiting');
        return;
      }
    } catch (err) {
      console.error('Error creating room on backend, using local room', err);
    }

    setRooms(prev => [fallbackRoom, ...prev]);
    setCurrentRoom(fallbackRoom);
    setCurrentScreen('roomWaiting');
  };

  const handleJoinRoom = async (roomIdOrCode: string) => {
    let activeUser = currentUser;
    if (!activeUser) {
      activeUser = {
        id: `guest_${Date.now()}`,
        email: `Rival_${Math.floor(Math.random() * 8999 + 1000)}@movil.com`,
        teamId: 2,
        role: 'player',
        level: 1,
      };
      setCurrentUser(activeUser);
    }

    const cleanCode = roomIdOrCode.trim().toUpperCase();

    // 1. Intentar unirse directamente vía API
    try {
      const res = await fetch(`${API_BASE}/api/rooms/${cleanCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUser.id, player: activeUser, teamId: 2 }),
      });
      if (res.ok) {
        const updatedRoom = await res.json() as Room;
        setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
        setCurrentRoom(updatedRoom);
        setCurrentScreen('roomWaiting');
        return;
      }
    } catch (err) {
      console.error('Error joining room on backend by code/id', err);
    }

    // 2. Si no se resolvió por URL directa, buscar en el array de salas en memoria
    const targetRoom = rooms.find(
      r => r.code?.toUpperCase() === cleanCode || r.id.toUpperCase() === cleanCode
    );

    if (targetRoom) {
      try {
        const res = await fetch(`${API_BASE}/api/rooms/${targetRoom.id}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: activeUser.id, player: activeUser, teamId: 2 }),
        });
        if (res.ok) {
          const updatedRoom = await res.json() as Room;
          setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
          setCurrentRoom(updatedRoom);
          setCurrentScreen('roomWaiting');
          return;
        }
      } catch (err) {}

      // Fallback local
      const updatedPlayers = [...(targetRoom.players || []), { ...activeUser, teamId: 2 }];
      const updatedRoom = { ...targetRoom, players: updatedPlayers };
      setRooms(prev => prev.map(r => r.id === targetRoom.id ? updatedRoom : r));
      setCurrentRoom(updatedRoom);
      setCurrentScreen('roomWaiting');
      return;
    }

    // 3. Si no existe la sala aún (por ejemplo eres el primero en ingresar el código '000000'), crearla con ese código exacto:
    const newRoom: Room = {
      id: `room_${cleanCode.toLowerCase()}`,
      name: `Sala [${cleanCode}]`,
      code: cleanCode,
      players: [{ ...activeUser, teamId: 1 }],
      maxPlayers: 2,
      isStarted: false,
      currentRound: 1,
      currentTeam: 1,
      creatorId: activeUser.id,
      gameMode: 'connections',
      cardCount: 12,
    };

    try {
      const createRes = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Sala [${cleanCode}]`,
          code: cleanCode,
          hostId: activeUser.id,
          creator: activeUser,
          maxPlayers: 2,
          mode: 'connections',
          cardCount: 12,
        }),
      });
      if (createRes.ok) {
        const createdRoom = (await createRes.json()) as Partial<Room>;
        const completeRoom: Room = {
          id: createdRoom.id || newRoom.id,
          name: createdRoom.name || newRoom.name,
          code: cleanCode,
          players: createdRoom.players || newRoom.players,
          maxPlayers: createdRoom.maxPlayers || 2,
          isStarted: createdRoom.isStarted ?? false,
          currentRound: createdRoom.currentRound ?? 1,
          currentTeam: createdRoom.currentTeam ?? 1,
          creatorId: createdRoom.creatorId || activeUser.id,
          gameMode: 'connections',
          cardCount: 12,
        };
        setRooms(prev => [completeRoom, ...prev.filter(r => r.id !== completeRoom.id)]);
        setCurrentRoom(completeRoom);
        setCurrentScreen('roomWaiting');
        return;
      }
    } catch (e) {}

    // Fallback garantizado
    setRooms(prev => [newRoom, ...prev]);
    setCurrentRoom(newRoom);
    setCurrentScreen('roomWaiting');
  };




  const handleChangeTeam = (teamId: number) => {
    if (!currentUser || !currentRoom) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/rooms/${currentRoom.id}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player: { ...currentUser, teamId }, teamId }),
        });
        if (res.ok) {
          const updatedRoom = await res.json() as Room;
          setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
          setCurrentUser(prev => prev ? { ...prev, teamId } : null);
          setCurrentRoom(updatedRoom);
          return;
        }
      } catch (err) {
        console.error('Error changing team', err);
      }

      setCurrentUser(prevUser => prevUser ? { ...prevUser, teamId } : null);
      setRooms(prevRooms => 
        prevRooms.map(r => {
          if (r.id === currentRoom.id) {
            const updatedPlayers = r.players.map(p => p.id === currentUser.id ? { ...p, teamId } : p);
            return { ...r, players: updatedPlayers };
          }
          return r;
        }));
      setCurrentRoom(prev => prev ? { ...prev, players: prev.players.map(p => p.id === currentUser.id ? { ...p, teamId } : p) } : prev);
    })();
  };

  const handleStartGame = (initialCards?: any[]) => {
    if (initialCards) {
      setMultiplayerInitialCards(initialCards);
    }
    if (!currentRoom) {
      setCurrentScreen('multiplayerGame');
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/rooms/${currentRoom.id}/start`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hostId: currentRoom.creatorId, cards: initialCards || [] }),
        });
        if (res.ok) {
          const updated = await res.json() as Room;
          setRooms(prev => prev.map(r => r.id === updated.id ? updated : r));
        }
      } catch (err) {
        console.error('Error starting game on backend REST', err);
      }

      const updatedRoom = { ...currentRoom, isStarted: true };
      setRooms(prevRooms => prevRooms.map(r => r.id === currentRoom.id ? updatedRoom : r));
      setCurrentScreen('multiplayerGame');
    })();
  };

  const handleBackToLobby = () => {
    if (currentUser && currentRoom) {
      const updatedRoom = {
        ...currentRoom,
        players: currentRoom.players.filter(p => p.id !== currentUser.id),
      };
      setRooms(prevRooms => prevRooms.map(r => r.id === currentRoom.id ? updatedRoom : r));
    }
    setCurrentRoom(null);
    setCurrentScreen('lobby');
  };

  const handleGameEnd = () => {
    setCurrentScreen('finalResults');
  };

  const handleLogout = () => {
    clearSession();
    socket.disconnect();
    setCurrentUser(null);
    setCurrentRoom(null);
    setCurrentScreen('login');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('lobby');
    setSelectedUniverse(null);
  };

  const handleUniverseSelect = (universe: Universe) => {
    setSelectedUniverse(universe);
    setCurrentScreen('game');
    setCurrentLevel(1);
  };

  const handleLevelComplete = () => {
    if (currentLevel >= 3) {
      setCurrentScreen('boss');
    } else {
      setCurrentLevel(currentLevel + 1);
    }
  };

  const handleReplay = () => {
    setCurrentLevel(1);
    setCurrentScreen('game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden">
      {currentScreen === 'login' && (
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess} 
          onRegisterRedirect={() => setCurrentScreen('register')} 
        />
      )}

      {currentScreen === 'register' && (
        <RegisterScreen 
          onLoginRedirect={() => setCurrentScreen('login')} 
          onRegisterSuccess={handleLoginSuccess}
        />
      )}

      {currentScreen === 'lobby' && currentUser && (
        <LobbyScreen
          onStartMode={(mode) => {
            if (mode === 'classic') {
              setCurrentScreen('classicLevelSelect');
            } else if (mode === 'infinite') {
              setCurrentScreen('infinite');
            } else if (mode === 'challenge') {
              setCurrentScreen('challenge');
            } else if (mode === 'boss') {
              setCurrentScreen('boss-select');
            } else if (mode === 'ai-friends') {
              setCurrentScreen('ai-room-lobby');
            } else if (mode === 'profile') {
              setCurrentScreen('profile');
            } else if (mode === 'ranked') {
              setCurrentScreen('ranked');
            } else if (mode === 'tienda') {
              setCurrentScreen('tienda');
            } else if (mode === 'collection') {
              setCurrentScreen('collection');
            } else if (mode === 'ai-room-lobby') {
              setCurrentScreen('ai-room-lobby');
            } else if (mode === 'admin') {
              setCurrentScreen('admin');
            } else {
              setCurrentScreen('lobby');
            }
          }}
          onLogout={handleLogout}
          userRole={currentUser.role}

          userId={currentUser.id}
          rooms={rooms}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      )}


      {currentScreen === 'roomWaiting' && (
        <RoomWaiting
          room={currentRoom || {
            id: 'room_duel',
            name: 'DUELO 1 VS 1',
            code: 'DUEL01',
            players: [currentUser || { id: 'p1', email: 'Jugador 👑', teamId: 1, role: 'player' }],
            maxPlayers: 2,
            isStarted: false,
            currentRound: 1,
            currentTeam: 1,
            creatorId: currentUser?.id || 'p1',
            gameMode: 'triads',
            cardCount: 12
          }}
          currentUser={currentUser || { id: 'p1', email: 'Jugador 👑', teamId: 1, role: 'player' }}
          onStartGame={handleStartGame}
          onChangeTeam={handleChangeTeam}
          onBackToLobby={handleBackToLobby}
        />
      )}

      {currentScreen === 'multiplayerGame' && (
        <MultiplayerGame
          room={currentRoom || {
            id: 'room_duel',
            name: 'DUELO 1 VS 1',
            code: 'DUEL01',
            players: [
              currentUser || { id: 'p1', email: 'Jugador 1 👑', teamId: 1, role: 'player' },
              { id: 'bot_1', email: 'Rival Bot 🤖', teamId: 2, role: 'player' }
            ],
            maxPlayers: 2,
            isStarted: true,
            currentRound: 1,
            currentTeam: 1,
            creatorId: currentUser?.id || 'p1',
            gameMode: 'triads',
            cardCount: 12
          }}
          currentUser={currentUser || { id: 'p1', email: 'Jugador 1 👑', teamId: 1, role: 'player' }}
          initialCards={multiplayerInitialCards}
          onGameEnd={handleGameEnd}
          onBackToLobby={handleBackToLobby}
        />
      )}

      {currentScreen === 'finalResults' && (
        <FinalResults
          room={currentRoom || {
            id: 'room_duel',
            name: 'DUELO 1 VS 1',
            code: 'DUEL01',
            players: [currentUser || { id: 'p1', email: 'Jugador 👑', teamId: 1, role: 'player' }],
            maxPlayers: 2,
            isStarted: false,
            currentRound: 1,
            currentTeam: 1,
            creatorId: currentUser?.id || 'p1',
            gameMode: 'triads',
            cardCount: 12
          }}
          onBackToLobby={handleBackToLobby}
        />
      )}

      
      
      {currentScreen === 'game' && selectedUniverse && (
        <GameBoard
          universe={selectedUniverse}
          level={currentLevel}
          onLevelComplete={handleLevelComplete}
          onBackToMenu={handleBackToMenu}
        />
      )}
      
      {currentScreen === 'boss-select' && (
        <BossSelect
          onSelectBoss={(bossType: BossType) => {
            setSelectedBossType(bossType);
            setSelectedUniverse('neural'); // Universo por defecto
            setCurrentScreen('boss');
          }}
          onBack={() => setCurrentScreen('lobby')}
        />
      )}
      
      {currentScreen === 'boss' && selectedUniverse && (
        selectedBossType === 'ecosistema' || selectedBossType === 'tecnologia' ? (
          <TriadasConexiones
            universe={selectedUniverse}
            modo={selectedBossType}
            onComplete={() => {
              const stats = loadPlayerStats();
              const newStats = addXP(stats, 350);
              savePlayerStats(newStats);
              setCurrentScreen('reward');
            }}
            onBackToMenu={handleBackToMenu}
          />
        ) : (
          <ParejasConexiones
            universe={selectedUniverse}
            modo={selectedBossType}
            onComplete={() => {
              const stats = loadPlayerStats();
              const newStats = addXP(stats, 250);
              savePlayerStats(newStats);
              setCurrentScreen('reward');
            }}
            onBackToMenu={handleBackToMenu}
          />
        )
      )}

      {currentScreen === 'reward' && selectedUniverse && (
        <RewardScreen
          universe={selectedUniverse}
          onBackToMenu={() => setCurrentScreen('lobby')}
          onReplay={() => setCurrentScreen('boss-select')}
        />
      )}
      
      {currentScreen === 'classicLevelSelect' && (
        <ClassicLevelSelect
          onSelectLevel={(level) => {
            setClassicLevel(level);
            setCurrentScreen('classic');
          }}
          onBack={() => setCurrentScreen('lobby')}
        />
      )}

      {currentScreen === 'loading' && (
        <LoadingScreen 
          onComplete={() => {
            if (postLoadingScreen) {
              setCurrentScreen(postLoadingScreen);
              setPostLoadingScreen(null);
            } else {
              setCurrentScreen('lobby');
            }
          }}
        />
      )}

      {currentScreen === 'classic' && (
        <GameScreen
          initialLevel={classicLevel}
          onBackToLobby={() => setCurrentScreen('lobby')}
        />
      )}

      {currentScreen === 'infinite' && (
        <InfiniteMode onBackToLobby={() => setCurrentScreen('lobby')} />
      )}

      {currentScreen === 'challenge' && (
        <ChallengeMode onBackToLobby={() => setCurrentScreen('lobby')} />
      )}

      {currentScreen === 'ai-friends' && (
        <AIFriendsGame onBackToLobby={() => setCurrentScreen('ai-room-lobby')} />
      )}

      {currentScreen === 'ai-room-lobby' && (
        <AIRoomLobby 
          onBackToLobby={() => setCurrentScreen('lobby')}
          onStartGame={() => {
            setCurrentScreen('ai-friends');
          }}
          onCreateRealRoom={handleCreateRoom}
          onJoinRealRoom={handleJoinRoom}
          realRooms={rooms}
        />
      )}


      {currentScreen === 'ai-room-waiting' && (
        <AIRoomWaiting 
          onBackToLobby={() => setCurrentScreen('lobby')}
          onStartGame={() => {
            setCurrentScreen('ai-friends');
          }}
        />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen onBack={() => setCurrentScreen('lobby')} />
      )}

      {currentScreen === 'ranked' && (
        <RankedScreen onBack={() => setCurrentScreen('lobby')} />
      )}

      {currentScreen === 'tienda' && (
        <TiendaScreen onBack={() => setCurrentScreen('lobby')} userId={currentUser?.id} />
      )}

      {currentScreen === 'collection' && (
        <CollectionScreen onBack={() => setCurrentScreen('lobby')} />
      )}

      {currentScreen === 'admin' && currentUser && (
        <AdminPanel 
          onBack={() => setCurrentScreen('lobby')} 
          currentUserId={currentUser.id}
        />
      )}
    </div>
  );
}


