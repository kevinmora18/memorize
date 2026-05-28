# 🎮 MEMORIZE - Juego de Memoria Evolutivo

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

Un juego de memoria multijugador con sistema de evolución, tienda, skins personalizables y múltiples modos de juego.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Modos de Juego](#-modos-de-juego)
- [Panel de Administración](#-panel-de-administración)
- [API Endpoints](#-api-endpoints)
- [Despliegue](#-despliegue)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## ✨ Características

### 🎯 Modos de Juego
- **Clásico**: Niveles progresivos con dificultad creciente
- **Infinito**: Juega sin límites y alcanza el máximo puntaje
- **Desafío**: Modo contra reloj con obstáculos
- **Boss Fight**: Enfrenta jefes temáticos con mecánicas especiales
- **Multijugador**: Compite en tiempo real con otros jugadores
- **IA Friends**: Juega contra inteligencia artificial

### 🎨 Sistema de Personalización
- **8 Packs de Cartas**: Frutas, Animales, Espacio, Océano, Mágico, Dragón, Cyber, Celestial
- **6 Skins**: Classic, Neon, Gold, Ice, Shadow, Galaxy
- **6 Marcos**: Basic, Gold, Diamond, Fire, Cosmic, Rainbow
- **6 Tableros**: Default, Forest, Ocean, Volcano, Space, Heaven

### 📊 Sistema de Progresión
- Sistema de niveles y experiencia (XP)
- Monedas y gemas como moneda del juego
- Tienda con items desbloqueables
- Estadísticas detalladas de jugador
- Tabla de clasificación global

### 🛡️ Panel de Administración
- Gestión completa de usuarios
- Sistema de baneos temporal/permanente
- Anuncios globales
- Analíticas en tiempo real
- Gestión de economía del juego
- Historial de partidas

## 🚀 Tecnologías

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **Framer Motion** - Animaciones
- **Socket.io Client** - Comunicación en tiempo real
- **Lucide React** - Iconos

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **TypeScript** - Tipado estático
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **Socket.io** - WebSockets para multijugador
- **dotenv** - Variables de entorno

## 📦 Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0
- **Git**

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/memorize.git
cd memorize
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Configuración

### Backend (.env)

Crea un archivo `.env` en la carpeta `backend`:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/memorize"

# Server
PORT=5175
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

Crea un archivo `.env` en la carpeta `frontend`:

```env
VITE_API_BASE=http://localhost:5175
VITE_WS_URL=http://localhost:5175
```

### Configurar Base de Datos

```bash
cd backend

# Generar cliente de Prisma
npx prisma generate

# Crear/actualizar base de datos
npx prisma db push

# (Opcional) Abrir Prisma Studio
npx prisma studio
```

## 🎮 Uso

### Desarrollo

Abre dos terminales:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Accede a:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5175
- **Prisma Studio**: http://localhost:5555

### Producción

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Estructura del Proyecto

```
memorize/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Esquema de base de datos
│   ├── src/
│   │   └── index.ts               # Servidor principal
│   ├── .env                       # Variables de entorno
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   │   ├── fonlobby.png          # Imagen de fondo lobby
│   │   └── fondosin.png          # Imagen de fondo sin
│   ├── src/
│   │   ├── components/           # Componentes React
│   │   │   ├── AdminPanel.tsx    # Panel de administración
│   │   │   ├── GameScreen.tsx    # Pantalla de juego
│   │   │   ├── LobbyScreen.tsx   # Lobby principal
│   │   │   ├── TiendaScreen.tsx  # Tienda del juego
│   │   │   └── ...
│   │   ├── lib/                  # Utilidades y lógica
│   │   │   ├── evolutionSystem.ts
│   │   │   ├── playerEvolution.ts
│   │   │   ├── shopSystem.ts
│   │   │   └── socket.ts
│   │   ├── styles/
│   │   │   └── globals.css       # Estilos globales
│   │   ├── App.tsx               # Componente principal
│   │   └── main.tsx              # Punto de entrada
│   ├── .env                      # Variables de entorno
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.cjs
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── .gitignore
├── README.md
└── package.json
```

## 🎯 Modos de Juego

### 🎴 Modo Clásico
- 10 niveles progresivos
- Dificultad creciente
- Sistema de puntuación
- Tiempo límite por nivel

### ♾️ Modo Infinito
- Sin límite de niveles
- Dificultad incremental
- Competencia por máximo puntaje
- Tabla de clasificación

### ⚡ Modo Desafío
- Cartas especiales (bombas, glitch)
- Tiempo limitado
- Multiplicadores de combo
- Obstáculos dinámicos

### 👹 Boss Fight
- 5 tipos de jefes temáticos
- Mecánicas únicas por jefe
- Recompensas especiales
- Dificultad extrema

### 👥 Multijugador
- Salas de hasta 4 jugadores
- Equipos competitivos
- Chat en tiempo real
- Sincronización en vivo

### 🤖 IA Friends
- Juega contra IA
- Diferentes niveles de dificultad
- Práctica sin presión
- Mejora tus habilidades

## 🛡️ Panel de Administración

Acceso exclusivo para usuarios con rol `admin`.

### Funcionalidades:

#### 📊 Estadísticas
- Total de usuarios registrados
- Total de partidas jugadas
- Partidas ganadas
- Puntuación promedio
- Top 10 mejores puntuaciones

#### 👥 Gestión de Usuarios
- Ver todos los usuarios
- Cambiar roles (player ↔ admin)
- Editar monedas y gemas
- Banear/desbanear usuarios
- Eliminar usuarios

#### 🎮 Historial de Partidas
- Ver todas las partidas
- Filtrar por modo, jugador, resultado
- Estadísticas detalladas

#### 🛡️ Sistema de Baneos
- Baneos temporales o permanentes
- Razones de baneo
- Gestión de usuarios baneados
- Desbanear con un clic

#### 📢 Anuncios Globales
- Crear mensajes para todos los usuarios
- Tipos: info, warning, success, error
- Activar/desactivar anuncios
- Fecha de expiración

#### 💰 Gestión de Economía
- Regalar monedas/gemas masivamente
- Crear promociones
- Multiplicadores de recompensas
- Control de precios

#### 📈 Analíticas
- Usuarios activos (últimos 7 días)
- Modos de juego más populares
- Registros por día
- Tendencias de uso

## 🔌 API Endpoints

### Autenticación
```
POST   /api/auth/login          # Login/registro de usuario
```

### Usuarios
```
GET    /api/users/:userId                    # Obtener perfil
PUT    /api/users/:userId/stats              # Actualizar estadísticas
GET    /api/users/:userId/inventory          # Obtener inventario
PUT    /api/users/:userId/inventory          # Actualizar inventario
GET    /api/users/:userId/matches            # Historial de partidas
```

### Partidas
```
POST   /api/matches                          # Guardar resultado
GET    /api/leaderboard                      # Tabla de clasificación
```

### Admin
```
GET    /api/admin/users                      # Todos los usuarios
GET    /api/admin/matches                    # Todas las partidas
GET    /api/admin/stats                      # Estadísticas globales
GET    /api/admin/banned-users               # Usuarios baneados
GET    /api/admin/announcements              # Todos los anuncios
GET    /api/admin/promotions                 # Todas las promociones
GET    /api/admin/analytics                  # Analíticas

PUT    /api/admin/users/:id/role             # Cambiar rol
PUT    /api/admin/users/:id/currency         # Editar monedas/gemas
PUT    /api/admin/users/:id/ban              # Banear usuario
PUT    /api/admin/users/:id/unban            # Desbanear usuario
DELETE /api/admin/users/:id                  # Eliminar usuario

POST   /api/admin/announcements              # Crear anuncio
PUT    /api/admin/announcements/:id/toggle   # Activar/desactivar
DELETE /api/admin/announcements/:id          # Eliminar anuncio

POST   /api/admin/promotions                 # Crear promoción
DELETE /api/admin/promotions/:id             # Eliminar promoción

POST   /api/admin/give-currency-all          # Regalar a todos
```

### WebSocket Events
```
rooms:update        # Actualización de salas
player:joined       # Jugador se unió
room:started        # Sala iniciada
game:update         # Actualización de juego
```

## 🚀 Despliegue

### Render.com (Recomendado)

1. Crea una cuenta en [Render.com](https://render.com)
2. Conecta tu repositorio de GitHub
3. Crea un servicio PostgreSQL
4. Crea un Web Service para el backend
5. Crea un Static Site para el frontend
6. Configura las variables de entorno

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones detalladas.

### Docker (Alternativa)

```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Kevin**

## 🙏 Agradecimientos

- Framer Motion por las increíbles animaciones
- Lucide por los iconos
- Prisma por el excelente ORM
- La comunidad de React y TypeScript

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!
