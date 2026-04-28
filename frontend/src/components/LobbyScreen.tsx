import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, LogOut, Play, Crown, Gamepad2, Search, Copy, Check } from 'lucide-react';
import type { Player, Room } from '../../App';

interface LobbyScreenProps {
  currentUser: Player;
  rooms: Room[];
  onCreateRoom: (name: string) => void;
  onJoinRoom: (room: Room, teamId: number) => void;
  onGoToSinglePlayer: () => void;
  onLogout: () => void;
}

export function LobbyScreen({ currentUser, rooms, onCreateRoom, onJoinRoom, onGoToSinglePlayer, onLogout }: LobbyScreenProps) {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinByCode, setShowJoinByCode] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [codeError, setCodeError] = useState('');

  const handleCreateRoom = () => {
    if (!roomName.trim()) return;

    onCreateRoom(roomName);
    setRoomName('');
    setShowCreateRoom(false);
  };

  const handleJoinByCode = () => {
    setCodeError('');
    const code = roomCode.trim().toUpperCase();
    
    if (!code) {
      setCodeError('Por favor ingresa un código');
      return;
    }

    const room = rooms.find(r => r.code === code);
    
    if (!room) {
      setCodeError('Sala no encontrada');
      return;
    }

    if (room.isStarted) {
      setCodeError('Esta sala ya comenzó');
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      setCodeError('Esta sala está llena');
      return;
    }

    const availableTeams = getAvailableTeams(room);
    if (availableTeams.length === 0) {
      setCodeError('No hay equipos disponibles');
      return;
    }

    onJoinRoom(room, availableTeams[0]);
    setRoomCode('');
    setShowJoinByCode(false);
  };

  const copyRoomCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getAvailableTeams = (room: Room): number[] => {
    const teams = [1, 2, 3, 4, 5];
    const teamCounts = teams.map(teamId => ({
      teamId,
      count: room.players.filter(p => p.teamId === teamId).length,
    }));
    
    return teamCounts.filter(t => t.count < 2).map(t => t.teamId);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-4xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Lobby Multijugador</h1>
            <p className="text-gray-400 mt-2">Conectado como: {currentUser.email}</p>
          </motion.div>

          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGoToSinglePlayer} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              <span>Modo Individual</span>
            </motion.button>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onLogout} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              <span>Salir</span>
            </motion.button>
          </div>
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8">
          {!showCreateRoom ? (
            <button onClick={() => setShowCreateRoom(true)} className="w-full py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 rounded-2xl flex items-center justify-center gap-3 transition-all">
              <Plus className="w-6 h-6" />
              <span className="text-lg">Crear Nueva Sala</span>
            </button>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl mb-4">Crear Nueva Sala</h3>
              <div className="flex gap-3">
                <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Nombre de la sala..." className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500" onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()} />
                <button onClick={handleCreateRoom} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl hover:brightness-110">Crear</button>
                <button onClick={() => setShowCreateRoom(false)} className="px-6 py-3 bg-gray-700 rounded-xl hover:bg-gray-600">Cancelar</button>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8">
          {!showJoinByCode ? (
            <button onClick={() => setShowJoinByCode(true)} className="w-full py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 rounded-2xl flex items-center justify-center gap-3 transition-all">
              <Search className="w-6 h-6" />
              <span className="text-lg">Unirse por Código</span>
            </button>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl mb-4">Unirse por Código</h3>
              <div className="flex gap-3">
                <input type="text" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} placeholder="Código de la sala..." className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500" onKeyPress={(e) => e.key === 'Enter' && handleJoinByCode()} />
                <button onClick={handleJoinByCode} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl hover:brightness-110">Unirse</button>
                <button onClick={() => setShowJoinByCode(false)} className="px-6 py-3 bg-gray-700 rounded-xl hover:bg-gray-600">Cancelar</button>
              </div>
              {codeError && <p className="text-sm text-red-500 mt-2">{codeError}</p>}
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room, index) => {
            const availableTeams = getAvailableTeams(room);
            const isFull = room.players.length >= room.maxPlayers;

            return (
              <motion.div key={room.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * 0.1 }} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 hover:border-cyan-500/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl mb-2">{room.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400"><Users className="w-4 h-4" /><span>{room.players.length} / {room.maxPlayers} jugadores</span></div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="px-2 py-1 bg-cyan-500/20 border border-cyan-500 rounded text-xs text-cyan-300 font-mono">{room.code}</div>
                      <button onClick={() => copyRoomCode(room.code)} className="p-1 hover:bg-gray-700 rounded transition-colors" title="Copiar código">{copiedCode === room.code ? (<Check className="w-4 h-4 text-green-400" />) : (<Copy className="w-4 h-4 text-gray-400" />)}</button>
                    </div>
                  </div>
                  {room.isStarted && (<div className="px-3 py-1 bg-green-500/20 border border-green-500 rounded-full text-xs text-green-400">En juego</div>)}
                </div>

                <div className="grid grid-cols-5 gap-2 mb-4">
                  {[1,2,3,4,5].map((teamId) => {
                    const teamPlayers = room.players.filter(p => p.teamId === teamId);
                    return (
                      <div key={teamId} className={`p-2 rounded-lg text-center ${teamPlayers.length === 2 ? 'bg-green-500/20 border border-green-500' : teamPlayers.length === 1 ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-gray-700/50 border border-gray-600'}`}>
                        <div className="text-xs text-gray-400">Equipo {teamId}</div>
                        <div className="text-lg">{teamPlayers.length}/2</div>
                      </div>
                    );
                  })}
                </div>

                {!room.isStarted && !isFull && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">Unirse al equipo:</p>
                    <div className="grid grid-cols-5 gap-2">
                      {availableTeams.map((teamId) => (
                        <motion.button key={teamId} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onJoinRoom(room, teamId)} className="py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-sm hover:brightness-110">{teamId}</motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {isFull && !room.isStarted && (<div className="text-center py-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">Sala llena</div>)}
              </motion.div>
            );
          })}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-16"><Users className="w-16 h-16 text-gray-600 mx-auto mb-4" /><p className="text-gray-400">No hay salas disponibles. ¡Crea una!</p></div>
        )}
      </div>
    </div>
  );
}
