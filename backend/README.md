# Backend - Memorize Game

Backend API para el juego de memoria con PostgreSQL y Prisma.

## 🚀 Configuración Inicial

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar PostgreSQL

Asegúrate de tener PostgreSQL instalado y corriendo en tu máquina.

Crea la base de datos:
```sql
CREATE DATABASE memorize;
```

### 3. Configurar variables de entorno

El archivo `.env` ya está configurado con:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/memorize"
PORT=5175
```

**IMPORTANTE:** Si tu contraseña de PostgreSQL es diferente a `postgres`, actualiza el `.env`:
```env
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/memorize"
```

### 4. Generar Prisma Client y crear tablas

```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Crear las tablas en la base de datos
npm run prisma:push
```

O si prefieres usar migraciones:
```bash
npm run prisma:migrate
```

### 5. Iniciar el servidor

```bash
npm run dev
```

El servidor estará corriendo en `http://localhost:5175`

## 📊 Prisma Studio

Para ver y editar los datos de la base de datos visualmente:

```bash
npm run prisma:studio
```

Esto abrirá una interfaz web en `http://localhost:5555`

## 🛠️ Scripts Disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo con hot-reload
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia el servidor en producción
- `npm run prisma:generate` - Genera el cliente de Prisma
- `npm run prisma:migrate` - Crea una nueva migración
- `npm run prisma:push` - Sincroniza el schema con la base de datos
- `npm run prisma:studio` - Abre Prisma Studio

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login o registro de usuario

### Usuarios
- `GET /api/users/:userId` - Obtener perfil de usuario
- `PUT /api/users/:userId/stats` - Actualizar estadísticas

### Inventario
- `GET /api/users/:userId/inventory` - Obtener inventario
- `PUT /api/users/:userId/inventory` - Actualizar inventario

### Partidas
- `POST /api/matches` - Guardar resultado de partida
- `GET /api/users/:userId/matches` - Historial de partidas
- `GET /api/leaderboard` - Tabla de clasificación

## 🗄️ Estructura de la Base de Datos

### Tablas:
- **users** - Información de usuarios
- **player_stats** - Estadísticas de juego
- **inventories** - Items comprados y equipados
- **matches** - Historial de partidas

## ⚠️ Solución de Problemas

### Error de conexión a PostgreSQL
```
Error: Can't reach database server
```
**Solución:** Verifica que PostgreSQL esté corriendo y que las credenciales en `.env` sean correctas.

### Error de Prisma Client
```
Error: @prisma/client did not initialize yet
```
**Solución:** Ejecuta `npm run prisma:generate`

### Puerto en uso
```
Error: Port 5175 is already in use
```
**Solución:** Cambia el puerto en `.env` o detén el proceso que está usando el puerto 5175.
