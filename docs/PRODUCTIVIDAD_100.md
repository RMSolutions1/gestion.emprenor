# Productividad operativa 100%

## Una sola BD PostgreSQL `emprenor`

Toda la operacion (empresa, empleados, clientes, obras, tareas, partes, materiales, pagos) vive en **una base**. Configurar `DATABASE_URL` en `.env.local`.

## Modulos de productividad

| Modulo | Ruta / API | Uso |
|--------|------------|-----|
| Cola de trabajo | Panel admin + `GET /api/dashboard/work-queue` | Lista priorizada: que hacer hoy |
| Tareas | Proyecto → pestaña Tareas + `/api/projects/[id]/tasks` | Pendientes con vencimiento y prioridad |
| Hitos | Misma pestaña + `/api/projects/[id]/milestones` | Cronograma % avance |
| Parte diario | Proyecto → Parte diario + `/api/projects/[id]/daily-reports` | Registro de jornada |
| Administracion | `/dashboard/administracion` | Clientes, empleados, obras (Server Actions) |
| Export CSV | `GET /api/dashboard/export-operations` | Resumen obras para Excel |

## Cola de trabajo (automatica)

Agrega desde la BD sin carga manual:

- Tareas vencidas
- Adicionales / informes pendientes de cliente
- Legajo y vehiculos incompletos
- Materiales sin entregar
- NC y OT fuera de SLA
- Hitos atrasados
- Obras sin planos
- Poliza RC vencida

## Tablas

- `ProjectTask` (ya en BD)
- `ProjectMilestone`
- `DailyFieldReport`

## Comandos

```bash
npm run db:push
npx dotenv -e .env.local -- tsx scripts/seed.ts
npm run dev
```
