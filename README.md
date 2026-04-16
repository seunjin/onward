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
