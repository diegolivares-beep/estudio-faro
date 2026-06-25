# Printia API — Node + Hono + Drizzle (Postgres via DATABASE_URL)
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . .
ENV NODE_ENV=production
ENV PORT=8787
EXPOSE 8787
# Al arrancar: aplica migraciones + semilla (idempotente) y levanta el server.
CMD ["sh","-c","npx tsx src/db/setup.ts && npx tsx src/server.ts"]
