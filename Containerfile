# syntax=docker/dockerfile:1

# --- Build stage ---
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .

# PUBLIC_* vars are baked into the client bundle at build time.
# Pass the VPS API URL here: --build-arg PUBLIC_API_BASE_URL=https://api.example.com
ARG PUBLIC_API_BASE_URL
ENV PUBLIC_API_BASE_URL=$PUBLIC_API_BASE_URL

RUN pnpm build

# --- Runtime stage ---
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /app/build ./build

EXPOSE 3000
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["node", "build"]
