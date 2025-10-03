# ===== deps =====
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev

# ===== build =====
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ===== migrate =====
# Imagen para correr migraciones en TS (usa devDeps + código fuente)
FROM node:20-alpine AS migrate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# opcional: cliente de postgres para pg_isready
RUN apk add --no-cache postgresql-client
# por defecto no tiene CMD; lo fijamos desde docker-compose con wait-for-db

# ===== runner =====
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# utilidades para wait-for-db si las usas aquí
RUN apk add --no-cache postgresql-client

COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

EXPOSE 3000
CMD ["node", "dist/main.js"]



