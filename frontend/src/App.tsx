import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { RoomWaiting } from './components/RoomWaiting';
import { MultiplayerGame } from './components/MultiplayerGame';
import { FinalResults } from './components/FinalResults';
import { MainMenu } from './components/MainMenu';
import { GameBoard } from './components/GameBoard';
import { BossFight } from './components/BossFight';
import { RewardScreen } from './components/RewardScreen';
import socket from './lib/socket';

export type Universe = 'volcania' | 'frostheim' | 'neural' | 'verdalis' | 'lunaris';

export type GameScreen = 'login' | 'register' | 'lobby' | 'roomWaiting' | 'multiplayerGame' | 'finalResults' | 'menu' | 'game' | 'boss' | 'reward';

export type Player = {
  id: string;
  email: string;
  teamId: number;
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
};

export default function App() {
  const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5175';
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('register');
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  
  // Gestión centralizada de salas
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    // Socket already connects via singleton; listen for updates
    socket.on('rooms:update', (data: Room[]) => setRooms(data));
    socket.on('player:joined', (payload: any) => {
      // opcional: mostrar notificaciones
      console.log('player joined', payload);
    });
    socket.on('room:started', (payload: any) => {
      console.log('room started', payload);
      setCurrentScreen('multiplayerGame');
    });

    // request initial rooms via fetch as fallback
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/rooms`);
        if (res.ok) setRooms(await res.json());
      } catch (err) {
        console.error('Error fetching rooms', err);
      }
    })();

    return () => {
      socket.off('rooms:update');
      socket.off('player:joined');
      socket.off('room:started');
    };
  }, []);

  // Estados del juego individual
  const [selectedUniverse, setSelectedUniverse] = useState<Universe | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [unlockedPowers, setUnlockedPowers] = useState<Universe[]>([]);

  // Sincronizar currentRoom con la lista de rooms
  useEffect(() => {
    if (currentRoom) {
      const updatedRoomData = rooms.find(r => r.id === currentRoom.id);
      setCurrentRoom(updatedRoomData || null);
    }
  }, [rooms]);

  const handleLoginSuccess = (email: string) => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          const player = await res.json() as Player;
          setCurrentUser(player);
          setCurrentScreen('lobby');
        } else {
          const player: Player = { id: Date.now().toString(), email, teamId: 0 };
          setCurrentUser(player);
          setCurrentScreen('lobby');
        }
      } catch (err) {
        const player: Player = { id: Date.now().toString(), email, teamId: 0 };
        setCurrentUser(player);
        setCurrentScreen('lobby');
      }
    })();
  };

  // Generar código único para sala
  const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (rooms.some(r => r.code === code)) {
      return generateRoomCode();
    }
    return code;
  };

  const handleCreateRoom = (name: string) => {
    if (!currentUser) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/rooms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, creator: currentUser }),
        });
        if (res.ok) {
          const created = await res.json() as Room;
          setRooms(prev => [...prev, created]);
          setCurrentUser({ ...currentUser, teamId: 1 });
          setCurrentRoom(created);
          setCurrentScreen('roomWaiting');
          // join socket room
          socket.emit('joinRoom', created.id);
          return;
        }
      } catch (err) {
        console.error('Error creating room', err);
      }

      // Fallback local
      const newRoom: Room = {
        id: Date.now().toString(),
        name,
        code: generateRoomCode(),
        players: [{ ...currentUser, teamId: 1 }],
        maxPlayers: 10,
        isStarted: false,
        currentRound: 1,
        currentTeam: 1,
        creatorId: currentUser.id,
      };
      setRooms(prevRooms => [...prevRooms, newRoom]);
      setCurrentUser({ ...currentUser, teamId: 1 });
      setCurrentRoom(newRoom);
      setCurrentScreen('roomWaiting');
    })();
  };

  const handleJoinRoom = (room: Room, teamId: number) => {
    if (!currentUser) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/rooms/${room.id}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player: currentUser, teamId }),
        });
        if (res.ok) {
          const updatedRoom = await res.json() as Room;
          setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
          setCurrentUser({ ...currentUser, teamId });
          setCurrentRoom(updatedRoom);
          setCurrentScreen('roomWaiting');
          socket.emit('joinRoom', updatedRoom.id);
          return;
        }
      } catch (err) {
        console.error('Error joining room', err);
      }

      // Fallback local behavior
      const playerToUpdate = { ...currentUser, teamId };
      setRooms(prevRooms => prevRooms.map(r => {
        if (r.id === room.id) {
          const playerExists = r.players.some(p => p.id === currentUser.id);
          const updatedPlayers = playerExists
            ? r.players.map(p => (p.id === currentUser.id ? playerToUpdate : p))
            : [...r.players, playerToUpdate];
          return { ...r, players: updatedPlayers };
        }
        return r;
      }));
      setCurrentUser(playerToUpdate);
      setCurrentRoom(room);
      setCurrentScreen('roomWaiting');
    })();
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

      // Fallback local
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

  const handleStartGame = () => {
    if (!currentRoom) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/rooms/${currentRoom.id}/start`, {
          method: 'PUT',
        });
        if (res.ok) {
          const updated = await res.json() as Room;
          setRooms(prev => prev.map(r => r.id === updated.id ? updated : r));
          setCurrentScreen('multiplayerGame');
          return;
        }
      } catch (err) {
        console.error('Error starting game', err);
      }

      // Fallback local
      const updatedRoom = { ...currentRoom, isStarted: true };
      setRooms(prevRooms => prevRooms.map(r => r.id === currentRoom.id ? updatedRoom : r));
      setCurrentScreen('multiplayerGame');
    })();
  };

  const handleBackToLobby = () => {
    if (currentUser && currentRoom) {
      // Remover jugador de la sala
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

  const handleGoToSinglePlayer = () => {
    setCurrentScreen('menu');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRoom(null);
    setCurrentScreen('login');
  };

  // Funciones del juego individual
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

  const handleBossDefeated = () => {
    if (selectedUniverse && !unlockedPowers.includes(selectedUniverse)) {
      setUnlockedPowers([...unlockedPowers, selectedUniverse]);
    }
    setCurrentScreen('reward');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
    setSelectedUniverse(null);
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
          currentUser={currentUser}
          rooms={rooms}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onGoToSinglePlayer={handleGoToSinglePlayer}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === 'roomWaiting' && currentRoom && currentUser && (
        <RoomWaiting
          room={currentRoom}
          currentUser={currentUser}
          onStartGame={handleStartGame}
          onChangeTeam={handleChangeTeam}
          onBackToLobby={handleBackToLobby}
        />
      )}

      {currentScreen === 'multiplayerGame' && currentRoom && currentUser && (
        <MultiplayerGame
          room={currentRoom}
          currentUser={currentUser}
          onGameEnd={handleGameEnd}
          onBackToLobby={handleBackToLobby}
        />
      )}

      {currentScreen === 'finalResults' && currentRoom && (
        <FinalResults
          room={currentRoom}
          onBackToLobby={handleBackToLobby}
        />
      )}
      
      {currentScreen === 'menu' && (
        <MainMenu 
          onUniverseSelect={handleUniverseSelect}
          unlockedPowers={unlockedPowers}
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
      
      {currentScreen === 'boss' && selectedUniverse && (
        <BossFight
          universe={selectedUniverse}
          onBossDefeated={handleBossDefeated}
          onBackToMenu={handleBackToMenu}
        />
      )}
      
      {currentScreen === 'reward' && selectedUniverse && (
        <RewardScreen
          universe={selectedUniverse}
          onBackToMenu={handleBackToMenu}
          onReplay={handleReplay}
        />
      )}
    </div>
  );
}
