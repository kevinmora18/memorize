# AGENTS.md

Multiplayer memory game. Two independent npm packages under `backend/` (Express + Socket.IO + Prisma, CommonJS) and `frontend/` (React + Vite + Tailwind, ESM). Documentation is Spanish.

## Commands

- Run backend: `npm run dev` in `backend/` (ts-node-dev, transpile-only — no typecheck). Or from root: `npm run server`.
- Run both: `npm run dev:all` at root (concurrently). Frontend on :5173.
- Backend prod build + check types: `npm run build` in `backend/` (`tsc`).
- Frontend build (also typechecks via `tsc -b`): `npm run build` in `frontend/`.
- Prisma (run in `backend/`): `npx prisma db push` / `migrate dev` / `studio` / `generate`. Schema in `backend/prisma/schema.prisma`.
- **No test runner exists and no ESLint config exists anywhere** — `npm run lint` fails. Do not assume tests or lint; use build/typecheck to verify.

## Root package.json is stale — don't trust it

The root `package.json` is an orphan copy of frontend deps and is **not** wired up: there is no root `vite.config`, `tsconfig.app.json`, or `tsconfig.node.json` (root `tsconfig.json` references them), so root `npm run dev` / `build` / `lint` fail. Ignore the root scripts except `server` and `dev:all`; run everything from `backend/` or `frontend/`.

## Ports / API wiring (README is wrong)

- Backend dev port is **3000** (`backend/.env`), not 5175 as the README claims.
- Vite dev proxy (`frontend/vite.config.ts`) forwards `/api` and `/socket.io` to `localhost:3000`.
- Some components hardcode a `http://localhost:5175` fallback for `VITE_API_BASE`, but `frontend/.env` sets it to `http://localhost:3000`, which wins at runtime. Trust the env var, not the fallback.
- Socket client (`frontend/src/lib/socket.ts`) uses `VITE_SOCKET_URL || window.location.origin`.

## Env files (all gitignored, per directory)

- `backend/.env`: `DATABASE_URL` (Postgres), `PORT=3000`, `FRONTEND_URL=*`. Local DB assumed `postgresql://postgres:12345678@localhost:5432/memorize`.
- `frontend/.env`: `VITE_API_BASE` (dev), `frontend/.env.production`: points at Render backend.
- Root `.env` only holds `POSTGRES_PASSWORD` for docker-compose.
- Never commit `.env` values.

## Backend architecture (POO / DI)

- Entrypoint: `backend/src/index.ts`. Wires Express routes (`/api/auth|users|rooms|matches|admin|leaderboard`) and Socket.IO.
- `backend/src/Container.ts` is a singleton dependency-injection container (prisma → repositories → services → controllers → RoomManager). Add new dependencies wiring here, layered like the rest.
- `backend/src/socket/SocketManager.ts` handles all Socket.IO room/game/chat events via `RoomManager`. Room/game state lives in-memory in `RoomManager`, not Postgres — in-memory state is lost on server restart.
- Backend is `"type": "commonjs"` + TS `module: CommonJS`, `strict: false`. Frontend is strict ESM. Don't mix module systems across the boundary.

## Deploy

- `docker-compose.yml`: postgres + backend + frontend (nginx serves frontend and proxies `/api` + `/socket.io` to `backend:3000`). Frontend Dockerfile copies `nginx/default.conf`.
- `render.yaml`: backend web service + frontend static site (`VITE_API_BASE` → Render backend).
