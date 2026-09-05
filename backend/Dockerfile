# ── Build del Backend ──────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Compilar TypeScript a JavaScript
RUN npm run build

EXPOSE 3000

# Ejecutar migraciones y luego iniciar servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
