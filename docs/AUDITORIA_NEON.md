# Auditoria base de datos Neon (Vercel Postgres)

**Fecha:** 2026-05-23  
**Base:** `neondb` en Neon (`us-east-1`)

## Conexion

| Prueba | Resultado |
|--------|-----------|
| `SELECT 1` | OK |
| Base de datos | `neondb` |
| URL pooled (`DATABASE_URL`) | App / Prisma runtime |
| URL directa (`DATABASE_URL_UNPOOLED`) | Migraciones `prisma db push` |

## Esquema

| Metrica | Valor |
|---------|-------|
| Tablas en `public` | **34** |
| Modelos Prisma sincronizados | OK (`prisma db push`) |
| Seed demo ejecutado | OK |

### Tablas creadas

Organization, User, ClientProfile, Project, ProjectAssignment, Document, DocumentVersion, Worker, Vehicle, WorkExtra, ProjectLedgerEntry, SiteLogEntry, ProjectTask, ProjectMilestone, DailyFieldReport, TechnicalReport, Incident, ChatChannel, ChatMessage, ChatChannelMember, ChatAttachment, Notification, LiveFeedEvent, WorkOrder, QualityNonConformance, CorrectiveAction, HseIncident, PermitToWork, SafetyInspection, TenantBranding, TenantPacDocument, PlatformMetric, AuditLog, ProjectMaterial.

## Datos demo (post-seed)

| Entidad | Cantidad |
|---------|----------|
| Usuarios | 13 |
| Perfiles cliente | 8 |
| Proyectos | 9 |
| Asignaciones | 12 |
| Canales chat | 2 |

## Variables en `.env.local` (requeridas app)

Ademas de las de Neon, deben existir:

- `NEXTAUTH_SECRET` (≥ 32 caracteres)
- `NEXTAUTH_URL` (local o dominio Vercel)
- `CRON_SECRET` (cron mantenimiento)
- `BLOB_READ_WRITE_TOKEN` (opcional uploads)

## Vercel — copiar las mismas variables

En el proyecto Vercel → Settings → Environment Variables:

1. `DATABASE_URL` = pooled (POSTGRES_URL de Neon)
2. `DATABASE_URL_UNPOOLED` = direct (POSTGRES_URL_NON_POOLING)
3. `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `CRON_SECRET`, `BLOB_READ_WRITE_TOKEN`

**Build:** `prisma generate && next build`  
Tras primer deploy las tablas ya existen si ejecutaste `db push` desde local.

## Comandos de verificacion

```bash
npx dotenv -e .env.local --override -- node scripts/neon-schema-audit.mjs
npx dotenv -e .env.local --override -- tsx scripts/test-db-connection.ts
npm run test:all
```

## Nota MongoDB

El archivo `.env` raiz puede contener `MONGODB_URI` de un stack anterior. **Emprenor Nexus usa solo PostgreSQL** — no es necesario Mongo para esta app.
