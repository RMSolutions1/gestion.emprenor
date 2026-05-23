# Matriz de preparacion para produccion

**Ultima auditoria:** 2026-05-21  
**Estado global:** **Listo para despliegue operativo real** (nucleo MVP verificado por scripts automatizados)

**Resultados:** ver [AUDITORIA_COMPLETA_RESULTADOS.md](./AUDITORIA_COMPLETA_RESULTADOS.md)  
**Veracidad comercial:** [AUDITORIA_VERACIDAD.md](./AUDITORIA_VERACIDAD.md)

## Criterios cumplidos (ejecutar antes de deploy)

```bash
cd nextjs_space
npm run db:setup          # Docker PG + schema + seed
npm run dev               # http://localhost:3001
npm run test:all          # prod:check + smoke + full + veracity
```

| Script | Que valida |
|--------|------------|
| `prod:check` | Variables obligatorias (DATABASE_URL, NEXTAUTH_*) |
| `test:smoke` | Flujos HTTP admin + cliente |
| `test:full` | 7 tipos de mandante + proveedor + APIs criticas |
| `test:veracity` | Promesas marketing vs codigo |

## Listo para produccion (deploy hoy)

| Area | Estado | Notas |
|------|--------|-------|
| Auth JWT + roles | OK | NextAuth, 6 roles |
| Multi-tenant | OK | Org scope, suspend/trial guard |
| Ficha cliente (7 entity types) | OK | PARTICULAR, EMPRESA, COMERCIO, INDUSTRIA, PUBLICO, CONSORCIO, FUNDACION |
| Proyectos / legajo / vehiculos | OK | CRUD + serializacion Decimal |
| Portal cliente (12 tabs) | OK | Documentos, ledger, bitacora, consultas, recepcion |
| Chat RT + Socket.io | OK | Canales, DM, @menciones |
| QMS / HSE / OT / tareas / parte diario | OK | APIs + tabs |
| Ledger + site-log | OK | Presupuesto y fotos de obra |
| DMS versionado + firma | OK | OCR metadatos (Textract = prod AWS) |
| Billing Stripe | OK | Modo demo sin claves |
| Cron mantenimiento | OK | Trials + alertas compliance (requiere `CRON_SECRET`) |
| Administracion tenant | OK | Directorio clientes/equipo/obras |
| Onboarding tenant | OK | `/registro` |
| Platform owner | OK | Stats, activar/suspender tenants |
| Busqueda global | OK | Proyectos, docs, OT |
| Cronograma Gantt | OK | Vista por proyecto |
| Health + CI | OK | `/api/health`, GitHub Actions |
| Docker prod | OK | `Dockerfile`, `docker-compose.prod.yml` |
| Legal / marketing | OK | TyC, privacidad, landing honesta |

## Variables de entorno produccion

| Variable | Obligatoria | Uso |
|----------|-------------|-----|
| `DATABASE_URL` | Si | PostgreSQL |
| `NEXTAUTH_SECRET` | Si (≥32 chars) | Sesiones |
| `NEXTAUTH_URL` | Si | URL publica |
| `CRON_SECRET` | Recomendada | `POST /api/cron/maintenance` (Vercel Cron / scheduler) |
| `AWS_*` | Recomendada | Uploads S3 |
| `STRIPE_*` | Si factura | Billing real |

## Credenciales demo (seed)

Password clientes: `cliente123` | Admin: `admin2024` | Tecnico: `especialista123`

| Tipo | Email | Proyecto |
|------|-------|----------|
| Consorcio | cliente@eltipal.com.ar | proj-demo-3 |
| Industria | cliente@cronec.com.ar | proj-cronec |
| Publico | cliente@gobiernosalta.gov.ar | proj-gob-salta |
| Particular | cliente@particular.demo | proj-particular |
| Comercio | cliente@farmacia.demo | proj-farmacia |
| Empresa | cliente@empresa.demo | proj-empresa |
| Fundacion | cliente@fundacion.demo | proj-fundacion |

## Fase posterior (no bloquea operacion real)

| Area | Fase roadmap |
|------|--------------|
| Keycloak + MFA | Fase 3 |
| Elasticsearch | Fase 3 |
| Textract OCR produccion | Config AWS |
| WebRTC / IA corporativa | Fase 4-5 |
| Dominios custom tenant | Schema listo, UI fija Emprenor |
| Mobile PWA offline | Fase 4 |

## Post-deploy

1. Programar cron: `POST /api/cron/maintenance` con header `Authorization: Bearer $CRON_SECRET` (diario).
2. Configurar webhook Stripe y bucket S3.
3. Tras `prisma migrate` / `db push`: reiniciar proceso Node (regenerar cliente Prisma).
