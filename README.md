# Emprenor Nexus

Plataforma cliente ↔ proveedor para gestión de obras, documentación, legajo, presupuesto y consultas trazables.

**Stack:** Next.js · PostgreSQL · Prisma · NextAuth · Socket.io

## Requisitos

- Node.js 20+
- PostgreSQL 16+ (Docker o remoto)
- Cuenta Vercel (recomendado para deploy)

## Inicio rápido (local)

```bash
cp .env.example .env.local
# Editar DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

npm install
npm run db:up
npm run db:push
npm run db:seed
npm run dev
```

App: http://localhost:3001

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor desarrollo (Next + Socket.io) |
| `npm run build` | Build producción |
| `npm run db:seed` | Datos demo (solo desarrollo) |
| `npm run test:all` | Auditoría completa (smoke + full + veracity) |

## Deploy (Vercel)

1. Conectar este repositorio en Vercel.
2. **Root Directory:** `.` (raíz del repo).
3. Variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `CRON_SECRET`.
4. Tras el primer deploy: `npx prisma db push` contra la BD de producción.

Documentación: carpeta `docs/` (`PRODUCTION_READINESS.md`, `AUDITORIA_COMPLETA_RESULTADOS.md`).

## Licencia

Uso privado — Emprenor Servicios.
