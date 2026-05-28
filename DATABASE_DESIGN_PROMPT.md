# Prompt para Diseño de Base de Datos - Memorize Evolutivo

## Contexto del Juego

**Memorize Evolutivo** es un juego de memoria multijugador con sistema de progresión, múltiples modos de juego, sistema de rangos, y batallas contra bosses. Actualmente usa almacenamiento en memoria y localStorage, pero necesita una base de datos completa.

---

## Requerimientos de la Base de Datos

### 1. USUARIOS Y AUTENTICACIÓN

**Tabla: users**
- `id` (UUID, Primary Key)
- `email` (String, Unique, Required)
- `username` (String, Unique, Required)
- `password_hash` (String, Required) - Hash bcrypt de la contraseña
- `verification_code` (String, Nullable) - Código de verificación de 6 dígitos
- `is_verified` (Boolean, Default: false)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `last_login` (Timestamp, Nullable)

**Funcionalidades:**
- Registro con email y contraseña
- Sistema de verificación por código de 6 dígitos
- Login con email y contraseña
- Recuperación de contraseña

---

### 2. SISTEMA DE PROGRESIÓN Y ESTADÍSTICAS

**Tabla: player_stats**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `xp` (Integer, Default: 0) - Experiencia total del jugador
- `level` (Integer, Default: 1) - Nivel del jugador
- `rank_id` (Integer, Default: 1) - ID del rango actual (1-5)
- `games_played` (Integer, Default: 0) - Total de partidas jugadas
- `games_won` (Integer, Default: 0) - Total de partidas ganadas
- `total_score` (Integer, Default: 0) - Puntuación acumulada
- `highest_combo` (Integer, Default: 0) - Combo más alto alcanzado
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Rangos del Sistema (hardcoded en código, referenciados por rank_id):**
1. Mente Básica (0-1000 XP)
2. Sinapsis Activa (1000-3000 XP)
3. Neuro Maestro (3000-7000 XP)
4. Cerebro Evolutivo (7000-15000 XP)
5. Memoria Suprema (15000+ XP)

---

### 3. HISTORIAL DE PARTIDAS

**Tabla: game_sessions**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `game_mode` (Enum: 'classic', 'infinite', 'challenge', 'boss', 'multiplayer', 'ai-friends')
- `universe` (Enum: 'volcania', 'frostheim', 'neural', 'verdalis', 'lunaris', Nullable)
- `level_reached` (Integer, Nullable) - Nivel alcanzado en modo clásico
- `score` (Integer, Default: 0)
- `max_combo` (Integer, Default: 0)
- `time_played` (Integer) - Tiempo en segundos
- `xp_gained` (Integer, Default: 0)
- `result` (Enum: 'won', 'lost', 'abandoned')
- `started_at` (Timestamp)
- `ended_at` (Timestamp)

---

### 4. BOSSES Y DERROTAS

**Tabla: boss_defeats**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `boss_type` (Enum: 'caos', 'congelante', 'ilusion', 'neural', 'parasito')
- `universe` (Enum: 'volcania', 'frostheim', 'neural', 'verdalis', 'lunaris')
- `time_taken` (Integer) - Tiempo en segundos
- `attempts` (Integer, Default: 1) - Intentos hasta derrotarlo
- `xp_gained` (Integer, Default: 200)
- `defeated_at` (Timestamp)

**Tipos de Bosses (hardcoded):**
- `caos`: Mezcla cartas constantemente
- `congelante`: Bloquea cartas temporalmente
- `ilusion`: Crea cartas falsas
- `neural`: Aumenta velocidad del juego
- `parasito`: Roba tiempo al fallar

---

### 5. SALAS MULTIJUGADOR

**Tabla: rooms**
- `id` (UUID, Primary Key)
- `name` (String, Required)
- `code` (String, Unique, Required) - Código de 6 caracteres
- `creator_id` (UUID, Foreign Key → users.id)
- `max_players` (Integer, Default: 10)
- `is_started` (Boolean, Default: false)
- `is_finished` (Boolean, Default: false)
- `current_round` (Integer, Default: 1)
- `current_team` (Integer, Default: 1)
- `created_at` (Timestamp)
- `started_at` (Timestamp, Nullable)
- `finished_at` (Timestamp, Nullable)

**Tabla: room_players**
- `id` (UUID, Primary Key)
- `room_id` (UUID, Foreign Key → rooms.id)
- `user_id` (UUID, Foreign Key → users.id)
- `team_id` (Integer, Required) - 1 o 2
- `score` (Integer, Default: 0)
- `is_ready` (Boolean, Default: false)
- `joined_at` (Timestamp)
- `left_at` (Timestamp, Nullable)

---

### 6. DESBLOQUEOS Y COLECCIONABLES

**Tabla: unlocked_items**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `item_type` (Enum: 'skin', 'effect', 'power', 'boss')
- `item_id` (String, Required) - ID del item desbloqueado
- `unlocked_at` (Timestamp)

**Items Desbloqueables (hardcoded):**

**Skins:**
- `clasico` (Inicial)
- `electrico` (Rango 2)
- `maestro` (Rango 3)
- `evolutivo` (Rango 4)
- `supremo` (Rango 5)

**Efectos:**
- `basico` (Inicial)
- `chispas` (Rango 2)
- `aura` (Rango 3)
- `particulas` (Rango 4)
- `legendario` (Rango 5)

**Poderes:**
- `tiempo_extra` (Rango 3)
- `vision` (Rango 4)
- `escudo` (Rango 5)
- `combo_infinito` (Rango 5)

**Bosses:**
- `caos` (Rango 1 - Disponible desde inicio)
- `congelante` (Rango 2)
- `ilusion` (Rango 3)
- `neural` (Rango 4)
- `parasito` (Rango 5)

---

### 7. LOGROS Y ACHIEVEMENTS

**Tabla: achievements**
- `id` (UUID, Primary Key)
- `achievement_id` (String, Unique, Required) - ID del logro
- `name` (String, Required)
- `description` (String, Required)
- `icon` (String, Required) - Emoji o URL
- `xp_reward` (Integer, Default: 0)
- `category` (Enum: 'progression', 'skill', 'collection', 'social')

**Tabla: user_achievements**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `achievement_id` (UUID, Foreign Key → achievements.id)
- `progress` (Integer, Default: 0) - Progreso actual
- `target` (Integer, Required) - Meta para completar
- `is_completed` (Boolean, Default: false)
- `completed_at` (Timestamp, Nullable)

**Ejemplos de Logros:**
- "Primera Victoria" - Gana tu primera partida
- "Combo Maestro" - Alcanza un combo de 10
- "Cazador de Bosses" - Derrota a los 5 bosses
- "Memoria Perfecta" - Completa un nivel sin errores
- "Velocista" - Completa un nivel en menos de 30 segundos

---

### 8. LEADERBOARDS (TABLAS DE CLASIFICACIÓN)

**Tabla: leaderboard_entries**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `leaderboard_type` (Enum: 'global_xp', 'classic_score', 'infinite_score', 'boss_time', 'weekly_xp')
- `score` (Integer, Required)
- `rank` (Integer, Nullable) - Posición en el ranking
- `metadata` (JSON, Nullable) - Datos adicionales (nivel, boss, etc.)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Tipos de Leaderboards:**
- `global_xp`: Ranking por XP total
- `classic_score`: Mejor puntuación en modo clásico
- `infinite_score`: Mejor puntuación en modo infinito
- `boss_time`: Mejor tiempo derrotando bosses
- `weekly_xp`: XP ganado esta semana

---

### 9. AMIGOS Y SOCIAL

**Tabla: friendships**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `friend_id` (UUID, Foreign Key → users.id)
- `status` (Enum: 'pending', 'accepted', 'blocked')
- `created_at` (Timestamp)
- `accepted_at` (Timestamp, Nullable)

**Tabla: friend_requests**
- `id` (UUID, Primary Key)
- `sender_id` (UUID, Foreign Key → users.id)
- `receiver_id` (UUID, Foreign Key → users.id)
- `status` (Enum: 'pending', 'accepted', 'rejected')
- `created_at` (Timestamp)
- `responded_at` (Timestamp, Nullable)

---

### 10. CONFIGURACIÓN DE USUARIO

**Tabla: user_settings**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id, Unique)
- `sound_enabled` (Boolean, Default: true)
- `music_enabled` (Boolean, Default: true)
- `sound_volume` (Integer, Default: 50) - 0-100
- `music_volume` (Integer, Default: 50) - 0-100
- `notifications_enabled` (Boolean, Default: true)
- `language` (String, Default: 'es') - 'es', 'en', etc.
- `theme` (Enum: 'dark', 'light', 'auto', Default: 'dark')
- `selected_skin` (String, Default: 'clasico')
- `selected_effect` (String, Default: 'basico')
- `updated_at` (Timestamp)

---

### 11. EVENTOS Y LOGS

**Tabla: game_events**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id, Nullable)
- `session_id` (UUID, Foreign Key → game_sessions.id, Nullable)
- `event_type` (String, Required) - 'match', 'combo', 'bomb', 'shuffle', etc.
- `event_data` (JSON, Nullable) - Datos adicionales del evento
- `created_at` (Timestamp)

**Útil para:**
- Analytics
- Detección de patrones de juego
- Debugging
- Balanceo de dificultad

---

## Índices Recomendados

```sql
-- Usuarios
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Estadísticas
CREATE INDEX idx_player_stats_user_id ON player_stats(user_id);
CREATE INDEX idx_player_stats_xp ON player_stats(xp DESC);
CREATE INDEX idx_player_stats_rank_id ON player_stats(rank_id);

-- Sesiones de juego
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_game_mode ON game_sessions(game_mode);
CREATE INDEX idx_game_sessions_started_at ON game_sessions(started_at DESC);

-- Boss defeats
CREATE INDEX idx_boss_defeats_user_id ON boss_defeats(user_id);
CREATE INDEX idx_boss_defeats_boss_type ON boss_defeats(boss_type);

-- Salas
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_creator_id ON rooms(creator_id);
CREATE INDEX idx_room_players_room_id ON room_players(room_id);
CREATE INDEX idx_room_players_user_id ON room_players(user_id);

-- Desbloqueos
CREATE INDEX idx_unlocked_items_user_id ON unlocked_items(user_id);
CREATE INDEX idx_unlocked_items_item_type ON unlocked_items(item_type);

-- Leaderboards
CREATE INDEX idx_leaderboard_entries_user_id ON leaderboard_entries(user_id);
CREATE INDEX idx_leaderboard_entries_type_score ON leaderboard_entries(leaderboard_type, score DESC);

-- Amigos
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
```

---

## Relaciones Clave

1. **users** → **player_stats** (1:1)
2. **users** → **game_sessions** (1:N)
3. **users** → **boss_defeats** (1:N)
4. **users** → **unlocked_items** (1:N)
5. **users** → **rooms** (1:N como creator)
6. **rooms** → **room_players** (1:N)
7. **users** → **room_players** (1:N)
8. **users** → **user_achievements** (1:N)
9. **users** → **friendships** (1:N)
10. **users** → **user_settings** (1:1)

---

## Triggers y Funciones Recomendadas

### 1. Auto-crear player_stats al registrar usuario
```sql
CREATE TRIGGER create_player_stats_on_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO player_stats (user_id, xp, level, rank_id)
  VALUES (NEW.id, 0, 1, 1);
END;
```

### 2. Auto-crear user_settings al registrar usuario
```sql
CREATE TRIGGER create_user_settings_on_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
END;
```

### 3. Actualizar rank_id cuando cambia XP
```sql
CREATE TRIGGER update_rank_on_xp_change
AFTER UPDATE ON player_stats
FOR EACH ROW
WHEN NEW.xp != OLD.xp
BEGIN
  UPDATE player_stats
  SET rank_id = CASE
    WHEN NEW.xp >= 15000 THEN 5
    WHEN NEW.xp >= 7000 THEN 4
    WHEN NEW.xp >= 3000 THEN 3
    WHEN NEW.xp >= 1000 THEN 2
    ELSE 1
  END
  WHERE id = NEW.id;
END;
```

### 4. Desbloquear items automáticamente al subir de rango
```sql
CREATE TRIGGER unlock_items_on_rank_up
AFTER UPDATE ON player_stats
FOR EACH ROW
WHEN NEW.rank_id > OLD.rank_id
BEGIN
  -- Desbloquear items según el nuevo rango
  -- (Implementar lógica específica)
END;
```

---

## Consultas Comunes (Queries)

### Obtener perfil completo de usuario
```sql
SELECT 
  u.id, u.email, u.username,
  ps.xp, ps.level, ps.rank_id, ps.games_played, ps.games_won,
  ps.total_score, ps.highest_combo,
  us.sound_enabled, us.selected_skin, us.selected_effect
FROM users u
JOIN player_stats ps ON u.id = ps.user_id
JOIN user_settings us ON u.id = us.user_id
WHERE u.id = ?;
```

### Top 10 jugadores por XP
```sql
SELECT 
  u.username, ps.xp, ps.rank_id, ps.games_won
FROM player_stats ps
JOIN users u ON ps.user_id = u.id
ORDER BY ps.xp DESC
LIMIT 10;
```

### Historial de partidas de un usuario
```sql
SELECT 
  game_mode, universe, level_reached, score, max_combo,
  xp_gained, result, started_at, ended_at
FROM game_sessions
WHERE user_id = ?
ORDER BY started_at DESC
LIMIT 20;
```

### Bosses derrotados por un usuario
```sql
SELECT 
  boss_type, universe, time_taken, attempts, defeated_at
FROM boss_defeats
WHERE user_id = ?
ORDER BY defeated_at DESC;
```

### Items desbloqueados por un usuario
```sql
SELECT item_type, item_id, unlocked_at
FROM unlocked_items
WHERE user_id = ?
ORDER BY unlocked_at DESC;
```

---

## Tecnologías Recomendadas

### Opción 1: PostgreSQL (Recomendado para producción)
- Robusto y escalable
- Soporte completo de JSON
- Excelente para relaciones complejas
- Hosting: Render, Railway, Supabase

### Opción 2: MySQL/MariaDB
- Ampliamente soportado
- Buen rendimiento
- Hosting: PlanetScale, Railway

### Opción 3: MongoDB (NoSQL)
- Flexible para datos no estructurados
- Bueno para eventos y logs
- Hosting: MongoDB Atlas

### Opción 4: Supabase (PostgreSQL + Auth + Realtime)
- PostgreSQL con autenticación integrada
- Realtime subscriptions
- API REST automática
- Ideal para este proyecto

---

## Migraciones Iniciales

### Orden de creación de tablas:
1. `users`
2. `player_stats`
3. `user_settings`
4. `game_sessions`
5. `boss_defeats`
6. `rooms`
7. `room_players`
8. `unlocked_items`
9. `achievements`
10. `user_achievements`
11. `leaderboard_entries`
12. `friendships`
13. `friend_requests`
14. `game_events`

---

## Datos Iniciales (Seeds)

### Desbloqueos iniciales para nuevos usuarios:
```sql
INSERT INTO unlocked_items (user_id, item_type, item_id, unlocked_at)
VALUES 
  (?, 'skin', 'clasico', NOW()),
  (?, 'effect', 'basico', NOW()),
  (?, 'boss', 'caos', NOW());
```

### Achievements predefinidos:
```sql
INSERT INTO achievements (achievement_id, name, description, icon, xp_reward, category)
VALUES
  ('first_win', 'Primera Victoria', 'Gana tu primera partida', '🏆', 50, 'progression'),
  ('combo_master', 'Combo Maestro', 'Alcanza un combo de 10', '⚡', 100, 'skill'),
  ('boss_hunter', 'Cazador de Bosses', 'Derrota a los 5 bosses', '👑', 500, 'collection'),
  ('perfect_memory', 'Memoria Perfecta', 'Completa un nivel sin errores', '💎', 150, 'skill'),
  ('speedrunner', 'Velocista', 'Completa un nivel en menos de 30 segundos', '🚀', 200, 'skill');
```

---

## Seguridad

### Consideraciones importantes:
1. **Passwords**: Usar bcrypt con salt rounds >= 10
2. **Tokens**: JWT para autenticación con expiración
3. **Rate Limiting**: Limitar requests por IP/usuario
4. **SQL Injection**: Usar prepared statements siempre
5. **XSS**: Sanitizar inputs del usuario
6. **CORS**: Configurar correctamente para producción
7. **Validación**: Validar todos los inputs en backend

---

## Escalabilidad

### Para futuro crecimiento:
1. **Caching**: Redis para sesiones y leaderboards
2. **CDN**: Para assets estáticos
3. **Load Balancing**: Múltiples instancias del backend
4. **Database Replication**: Read replicas para queries pesadas
5. **Sharding**: Si hay millones de usuarios
6. **Message Queue**: Para procesamiento asíncrono (RabbitMQ, Redis)

---

## Endpoints API Necesarios

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/verify` - Verificar código
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Recuperar contraseña
- `POST /api/auth/reset-password` - Resetear contraseña

### Usuario
- `GET /api/users/me` - Perfil del usuario actual
- `PUT /api/users/me` - Actualizar perfil
- `GET /api/users/:id` - Perfil público de usuario
- `GET /api/users/me/stats` - Estadísticas del usuario

### Juego
- `POST /api/game/start` - Iniciar sesión de juego
- `PUT /api/game/:sessionId/end` - Finalizar sesión
- `POST /api/game/xp` - Añadir XP
- `GET /api/game/history` - Historial de partidas

### Bosses
- `GET /api/bosses` - Lista de bosses disponibles
- `POST /api/bosses/defeat` - Registrar derrota de boss
- `GET /api/bosses/defeats` - Historial de derrotas

### Multijugador
- `GET /api/rooms` - Lista de salas
- `POST /api/rooms` - Crear sala
- `POST /api/rooms/:id/join` - Unirse a sala
- `POST /api/rooms/:id/leave` - Salir de sala
- `PUT /api/rooms/:id/start` - Iniciar partida
- `GET /api/rooms/:code` - Buscar sala por código

### Desbloqueos
- `GET /api/unlocks` - Items desbloqueados
- `POST /api/unlocks` - Desbloquear item

### Leaderboards
- `GET /api/leaderboards/:type` - Obtener ranking
- `GET /api/leaderboards/:type/me` - Mi posición

### Logros
- `GET /api/achievements` - Lista de logros
- `GET /api/achievements/me` - Mis logros
- `POST /api/achievements/:id/claim` - Reclamar logro

### Social
- `GET /api/friends` - Lista de amigos
- `POST /api/friends/request` - Enviar solicitud
- `POST /api/friends/accept` - Aceptar solicitud
- `DELETE /api/friends/:id` - Eliminar amigo

### Configuración
- `GET /api/settings` - Obtener configuración
- `PUT /api/settings` - Actualizar configuración

---

## WebSocket Events

### Cliente → Servidor
- `joinRoom` - Unirse a sala
- `leaveRoom` - Salir de sala
- `changeTeam` - Cambiar de equipo
- `ready` - Marcar como listo
- `gameAction` - Acción en el juego

### Servidor → Cliente
- `rooms:update` - Actualización de salas
- `player:joined` - Jugador se unió
- `player:left` - Jugador salió
- `room:started` - Partida iniciada
- `game:event` - Evento del juego
- `game:ended` - Partida terminada

---

## Notas Finales

Este diseño cubre todas las funcionalidades actuales del juego y deja espacio para futuras expansiones como:
- Sistema de clanes/guilds
- Torneos
- Misiones diarias
- Tienda de items
- Sistema de temporadas
- Chat en tiempo real
- Replays de partidas

**Recomendación:** Empezar con Supabase para tener autenticación, base de datos PostgreSQL y realtime integrados desde el inicio.
