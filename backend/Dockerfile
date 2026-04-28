# Backend Dockerfile para Render
FROM node:18-alpine

WORKDIR /app

# Copiar package.json del backend
COPY backend/package*.json ./backend/

# Instalar dependencias
WORKDIR /app/backend
RUN npm ci --only=production

# Copiar código del backend
COPY backend/ ./

EXPOSE 10000

ENV NODE_ENV=production
ENV PORT=10000

CMD ["npm", "run", "start"]
