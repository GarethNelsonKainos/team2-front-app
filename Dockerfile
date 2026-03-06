FROM node:20-alpine3.19 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY views ./views
COPY public ./public

RUN npm run build
RUN npm prune --omit=dev

FROM gcr.io/distroless/nodejs20-debian12:nonroot AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/views ./views
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

ENV PORT=80

EXPOSE 80

CMD ["dist/index.js"]
