# onward

Onward is a monorepo for the `Progress over perfection` product.

- `apps/web`: Vite + React service web
- `apps/mobile`: Expo + React Native mobile app
- `apps/api`: NestJS API

## Development

```bash
pnpm install
pnpm db:up
pnpm --filter @onward/api db:push
pnpm dev
```

## Environment Files

- `apps/web/.env.development`: local web development values
- `apps/web/.env.production`: production web values
- `apps/web/.env.example`: web template
- `apps/api/.env.development`: local API development values
- `apps/api/.env.production`: production API values
- `apps/api/.env.example`: API template
- optional local overrides:
  - `.env.development.local`
  - `.env.production.local`
