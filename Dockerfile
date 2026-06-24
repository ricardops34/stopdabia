# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Variáveis NEXT_PUBLIC_* precisam estar disponíveis no momento do next build
# pois são embutidas no bundle cliente pelo compilador
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_BASE_URL=https://adedonha.bjsoft.com.br

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

RUN npm run build

# ── Stage 2: produção ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copia node_modules completo (inclui tsx e todas as dependências)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node_modules/.bin/tsx", "server.ts"]
