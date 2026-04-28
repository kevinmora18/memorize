import io from 'socket.io-client';

const BASE = process.env.BASE || 'http://localhost:5176';
const results = { passed: 0, failed: 0, errors: [] };

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    results.passed++;
  } else {
    console.error(`✗ ${message}`);
    results.failed++;
    results.errors.push(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`✓ ${message}`);
    results.passed++;
  } else {
    console.error(`✗ ${message} (expected: ${expected}, got: ${actual})`);
    results.failed++;
    results.errors.push(message);
  }
}

async function createRoom() {
  const res = await fetch(`${BASE}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'E2E Sala', creator: { id: 'creator-1', email: 'creator@test', teamId: 1 } })
  });
  const data = await res.json();
  assert(res.status === 201 || res.ok, `POST /api/rooms returned status ${res.status}`);
  assert(data.id, 'Room has id');
  assert(data.code, 'Room has code');
  assert(data.players.length === 1, 'Room has 1 initial player (creator)');
  return data;
}

async function ensureServerRunning() {
  try {
    await fetch(`${BASE}/api/rooms`, { method: 'GET' });
    return;
  } catch (err) {
    console.log('Backend not reachable, importing server index to start it in-process...');
    // Import server in-process (backend/index.js) so tests can run reliably in this environment
    await import('./index.js');
    // wait briefly for server to start
    await new Promise(res => setTimeout(res, 500));
  }
}

async function login(email) {
  const res = await fetch(`${BASE}/api/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
  });
  const data = await res.json();
  assert(res.ok, `POST /api/login returned status ${res.status}`);
  assert(data.id, `Login returned player with id`);
  assert(data.email === email, `Player email is ${email}`);
  return data;
}

async function joinRoomByApi(roomId, player) {
  const res = await fetch(`${BASE}/api/rooms/${roomId}/join`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ player, teamId: 1 })
  });
  const data = await res.json();
  assert(res.ok, `POST /api/rooms/:id/join returned status ${res.status}`);
  assert(data.id === roomId, `Returned room id matches ${roomId}`);
  assert(data.players.length > 0, `Room has players after join`);
  return data;
}

function clientSocket(name) {
  const socket = io(BASE, { reconnectionAttempts: 3 });
  const events = {};
  
  socket.on('connect', () => {
    console.log(`${name} connected (${socket.id})`);
    events.connected = true;
  });
  socket.on('disconnect', () => {
    console.log(`${name} disconnected`);
    events.disconnected = true;
  });
  socket.on('rooms:update', (rooms) => {
    console.log(`${name} rooms:update [${rooms.map(r => `${r.id}:${r.players.length}p`).join(',')}]`);
    events.roomsUpdate = rooms;
  });
  socket.on('player:joined', (data) => {
    console.log(`${name} player:joined:`, data.player.email);
    events.playerJoined = data;
  });
  socket.on('room:started', (data) => {
    console.log(`${name} room:started:`, data.roomId);
    events.roomStarted = data;
  });
  socket.on('game:event', (ev) => {
    console.log(`${name} game:event:`, ev);
    events.gameEvent = ev;
  });
  
  return { socket, events };
}

async function run() {
  console.log('🧪 E2E test starting against', BASE, '\n');

  await ensureServerRunning();

  const room = await createRoom();
  console.log(`✓ Room created: ${room.id} (code: ${room.code})\n`);

  // Client A connects and joins room
  const { socket: socketA, events: eventsA } = clientSocket('ClientA');
  
  // Wait for connection
  await new Promise(res => {
    const check = () => {
      if (eventsA.connected) res();
      else setTimeout(check, 50);
    };
    check();
  });

  socketA.emit('joinRoom', room.id);
  console.log('✓ ClientA emitted joinRoom\n');

  // Client B logs in and joins via API
  const playerB = await login('playerb@test.com');
  console.log(`✓ PlayerB login: ${playerB.id}\n`);
  
  const joinedRoom = await joinRoomByApi(room.id, playerB);
  assertEqual(joinedRoom.players.length, 2, 'Room has 2 players after B joins');
  console.log('');

  // Wait a bit for socket events to propagate
  await new Promise(res => setTimeout(res, 500));

  // Verify ClientA received rooms:update
  assert(eventsA.roomsUpdate, 'ClientA received rooms:update');
  if (eventsA.roomsUpdate) {
    const testRoom = eventsA.roomsUpdate.find(r => r.id === room.id);
    assert(testRoom, `ClientA rooms:update includes test room`);
    if (testRoom) {
      assertEqual(testRoom.players.length, 2, `Room in rooms:update has 2 players`);
      assertEqual(testRoom.isStarted, false, `Room is not started yet`);
    }
  }
  console.log('');

  // Start room via API
  const res = await fetch(`${BASE}/api/rooms/${room.id}/start`, { method: 'PUT' });
  const startedRoom = await res.json();
  assertEqual(startedRoom.isStarted, true, 'PUT /api/rooms/:id/start sets isStarted=true');
  console.log('');

  // Wait for events to propagate
  await new Promise(res => setTimeout(res, 500));

  // Verify ClientA received room:started
  assert(eventsA.roomStarted, 'ClientA received room:started event');
  if (eventsA.roomStarted) {
    assertEqual(eventsA.roomStarted.roomId, room.id, 'room:started contains correct roomId');
  }

  // Verify ClientA received updated rooms:update with isStarted=true
  if (eventsA.roomsUpdate) {
    const testRoom = eventsA.roomsUpdate.find(r => r.id === room.id);
    if (testRoom) {
      assertEqual(testRoom.isStarted, true, `Room in rooms:update now has isStarted=true`);
    }
  }
  console.log('');

  // Cleanup
  socketA.close();
  console.log('✓ ClientA closed\n');

  // Print summary
  console.log('═'.repeat(50));
  console.log(`✓ Passed: ${results.passed} | ✗ Failed: ${results.failed}`);
  console.log('═'.repeat(50));

  if (results.failed > 0) {
    console.log('\nFailed assertions:');
    results.errors.forEach(err => console.log(`  - ${err}`));
    process.exit(1);
  } else {
    console.log('\n🎉 All E2E tests passed!');
    process.exit(0);
  }
}

run().catch(err => { 
  console.error('❌ E2E test error:', err.message);
  console.log('\n═'.repeat(50));
  console.log(`✓ Passed: ${results.passed} | ✗ Failed: ${results.failed + 1}`);
  console.log('═'.repeat(50));
  process.exit(1); 
});
