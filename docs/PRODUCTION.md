# Despliegue a produccion — Emprenor Nexus

## Requisitos

- Node.js 20+ o Docker
- PostgreSQL 16+
- Dominio HTTPS con `NEXTAUTH_URL` correcto
- (Opcional) AWS S3 para documentos
- (Opcional) Stripe para billing real

## Variables de entorno

Copie `.env.example` a `.env` y complete:

| Variable | Requerida prod | Descripcion |
|----------|----------------|-------------|
| `DATABASE_URL` | Si | PostgreSQL |
| `NEXTAUTH_SECRET` | Si | Min 32 caracteres aleatorios |
| `NEXTAUTH_URL` | Si | URL publica `https://app.tudominio.com` |
| `STRIPE_*` | No | Billing real |
| `CRON_SECRET` | Recomendado | Cron de trials |
| `AWS_*` | Recomendado | Upload documentos |

## Docker Compose (recomendado)

```bash
cp .env.example .env
# Editar POSTGRES_PASSWORD, NEXTAUTH_SECRET, NEXTAUTH_URL

docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec app npx prisma db push
docker compose -f docker-compose.prod.yml exec app npm run db:seed
```

## Cron mantenimiento (trials vencidos)

Programar diario:

```bash
curl -X POST https://app.tudominio.com/api/cron/maintenance \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Health check

- `GET /api/health` → 200 si DB ok
- Usar en load balancer / Kubernetes probes

## Checklist pre-go-live

```bash
npm run prod:check
npm run test:smoke
npm run build
```

Ver `PRODUCTION_READINESS.md` para matriz completa.
