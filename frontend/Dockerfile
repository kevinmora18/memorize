# ── Etapa 1: Build ────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependencias primero (cache layer)
COPY package*.json ./
RUN npm ci

# Copiar código fuente y compilar
COPY . .

# En producción, la API y Socket.IO van por Nginx (ruta relativa /api)
ENV VITE_API_BASE=""

RUN npm run build

# ── Etapa 2: Servir con Nginx ──────────────────────────────────
FROM nginx:alpine

# Copiar el build de React
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar config de Nginx (desde la carpeta nginx/ en la raíz)
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
