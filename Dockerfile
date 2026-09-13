FROM node:22-bookworm-slim

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["./node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
