# 🐳 Guía de Despliegue con Docker - Memorize

Esta guía explica cómo ejecutar todo el proyecto Memorize (Frontend React + Backend Express + PostgreSQL) usando Docker.

## 📋 Requisitos Previos

- **Docker Desktop** instalado ([descargar aquí](https://www.docker.com/products/docker-desktop/))
- **Docker Compose** (incluido en Docker Desktop)
- Puerto **80** disponible en tu máquina

## 🏗️ Arquitectura Docker

```
┌─────────────────────────────────────────────────────────────┐
│                         NGINX (Puerto 80)                   │
│  ┌─────────────────┐  ┌──────────────────────────────────┐ │
│  │   React Build   │  │  Proxy /api/ → backend:3000      │ │
│  │   (Frontend)    │  │  Proxy /socket.io/ → backend:3000│ │
│  └─────────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Express + Socket.IO)                  │
│                     Puerto: 3000                            │
│  - API REST                                                 │
│  - WebSocket (Socket.IO)                                    │
│  - Prisma ORM                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    POSTGRESQL 16                            │
│                     Puerto: 5432                            │
│  - Base de datos: memorize                                  │
│  - Usuario: memorize_user                                   │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Pasos de Instalación

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Edita el archivo `.env` y cambia la contraseña de PostgreSQL:

```env
POSTGRES_PASSWORD=tu_password_super_seguro_aqui
```

⚠️ **IMPORTANTE**: El archivo `.env` NO se sube a Git (está en `.gitignore`)

### 2. Construir y Ejecutar

Desde la raíz del proyecto (`c:\Users\kevin\Desktop\memorize\`), ejecuta:

```bash
docker compose up --build
```

Esto hará:
1. ✅ Crear contenedor de PostgreSQL
2. ✅ Compilar backend (TypeScript → JavaScript)
3. ✅ Generar cliente de Prisma
4. ✅ Ejecutar migraciones de base de datos
5. ✅ Compilar frontend (React/Vite → build optimizado)
6. ✅ Configurar Nginx como reverse proxy
7. ✅ Iniciar todos los servicios

**Primera vez tomará ~5-10 minutos** (descargar imágenes, instalar dependencias, compilar).

### 3. Verificar que Funciona

Una vez que veas estos logs:

```
memorize-database   | database system is ready to accept connections
memorize-backend    | ✅ Servidor iniciado con éxito!
memorize-frontend   | /docker-entrypoint.sh: Launching /docker-entrypoint.d/...
```

Abre tu navegador en:

🌐 **http://localhost**

¡Ya deberías ver el juego funcionando!

## 🔧 Comandos Útiles

### Ver logs en tiempo real
```bash
docker compose logs -f
```

### Ver logs solo del backend
```bash
docker compose logs -f backend
```

### Detener los contenedores
```bash
docker compose down
```

### Detener y eliminar volúmenes (⚠️ borra la base de datos)
```bash
docker compose down -v
```

### Reconstruir sin caché (si hay problemas)
```bash
docker compose build --no-cache
docker compose up
```

### Ejecutar comandos dentro del backend
```bash
# Ejemplo: Crear usuario admin
docker compose exec backend node dist/set-admin.js
```

### Acceder a la base de datos
```bash
docker compose exec database psql -U memorize_user -d memorize
```

## 📁 Estructura de Archivos Docker

```
memorize/
├── docker-compose.yml          # Orquestación de servicios
├── .env                        # Variables de entorno (NO subir a Git)
├── .env.example                # Plantilla de variables
├── nginx/
│   └── default.conf            # Configuración de Nginx
├── frontend/
│   ├── Dockerfile              # Build de React + Nginx
│   └── .env                    # Config de desarrollo frontend
└── backend/
    ├── Dockerfile              # Build de Express + Prisma
    └── .env                    # Config de desarrollo backend
```

## 🔄 Flujo de Desarrollo

### Desarrollo Local (SIN Docker)

Para desarrollar localmente SIN Docker:

1. **Backend** (terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   Corre en `http://localhost:3000`

2. **Frontend** (terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```
   Corre en `http://localhost:5173`

3. **Base de Datos**:
   - Usa Docker solo para PostgreSQL:
     ```bash
     docker compose up database
     ```
   - O usa PostgreSQL instalado localmente

### Producción (CON Docker)

```bash
docker compose up --build
```

Todo corre en `http://localhost` (puerto 80)

## 🌍 Configuración de URLs

### Desarrollo Local

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE=http://localhost:3000
```

**Backend** (`backend/.env`):
```env
PORT=3000
DATABASE_URL=postgresql://postgres:12345678@localhost:5432/memorize
FRONTEND_URL=*
```

### Producción Docker

**Frontend** (se establece en `frontend/Dockerfile`):
```env
VITE_API_BASE=""
```
↳ Vacío = usa rutas relativas `/api/` y Nginx hace el proxy

**Backend** (se establece en `docker-compose.yml`):
```env
PORT=3000
DATABASE_URL=postgresql://memorize_user:${POSTGRES_PASSWORD}@database:5432/memorize
FRONTEND_URL=*
```

## 🐛 Troubleshooting

### Error: "Port 80 is already in use"

Otro servicio está usando el puerto 80. Opciones:

1. Detén el otro servicio (IIS, Apache, etc.)
2. Cambia el puerto en `docker-compose.yml`:
   ```yaml
   frontend:
     ports:
       - "8080:80"  # Cambia 80 por 8080
   ```
   Luego accede en `http://localhost:8080`

### Error: "database connection failed"

Espera a que PostgreSQL termine de inicializarse (10-30 segundos). Si persiste:

```bash
docker compose down -v
docker compose up --build
```

### Frontend muestra página en blanco

Verifica que Nginx esté redirigiendo correctamente:

```bash
docker compose exec frontend cat /etc/nginx/conf.d/default.conf
```

Debe tener las secciones `location /api/` y `location /socket.io/`

### Backend no encuentra Prisma

```bash
docker compose exec backend npx prisma generate
docker compose restart backend
```

## 📊 Puertos Expuestos

| Servicio | Puerto Host | Puerto Contenedor | Descripción |
|----------|-------------|-------------------|-------------|
| Frontend (Nginx) | 80 | 80 | Interfaz web |
| Backend | - | 3000 | API (interno) |
| Database | 5432 | 5432 | PostgreSQL |

## 🔐 Seguridad

⚠️ **ANTES DE PRODUCCIÓN**:

1. Cambia `POSTGRES_PASSWORD` a algo seguro
2. Configura HTTPS con certificados SSL
3. Actualiza `FRONTEND_URL` en backend para permitir solo tu dominio
4. Usa variables de entorno para secretos (JWT_SECRET, etc.)
5. Configura firewall para bloquear puerto 5432 externamente

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [Prisma en Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs: `docker compose logs -f`
2. Verifica que todos los servicios estén corriendo: `docker compose ps`
3. Reinicia desde cero:
   ```bash
   docker compose down -v
   docker compose up --build
   ```

---

¡Disfruta jugando Memorize! 🎮🧠
