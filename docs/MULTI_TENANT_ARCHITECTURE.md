# Arquitectura Multi-Tenant — Emprenor Nexus

## 1. Resolución de tenant

| Método | Ejemplo | Prioridad |
|--------|---------|-----------|
| Subdominio | `acme.emprenor.com` | 1 |
| Dominio custom | `portal.acme.com` | 2 |
| Header `X-Tenant-Id` | APIs machine-to-machine | 3 |
| JWT claim `orgId` | Sesión autenticada | 4 |

```typescript
// lib/tenant.ts — flujo
host → extractSlug() → Organization.findUnique({ slug })
session → user.organizationId
prisma.$extends({ query: { $allModels: { async $allOperations({ args, query }) {
  // inyectar where: { organizationId } si aplica
}}})
```

## 2. Modelo de datos (fase MVP)

```prisma
Organization { id, name, slug, plan, status, customDomain }
TenantBranding { organizationId, logoUrl, primaryColor, ... }
User { organizationId?, role }
Project { organizationId }
AuditLog { organizationId? }  // fase 2
```

## 3. Roles por nivel

| Nivel | Roles Prisma | Permisos clave |
|-------|--------------|----------------|
| 1 Platform | `PLATFORM_OWNER`, `PLATFORM_OPS` | `platform:*` |
| 2 Tenant | `ADMIN`, especialistas | `org:*`, `project:*` |
| 3 Cliente | `CLIENTE` | `project:read`, `approve:*` |

## 4. RBAC objetivo (fase 2)

```
permiso = recurso:acción
ej: document:approve, project:write, chat:moderate
```

Almacenado en `RolePermission` + cache Redis.

## 5. White-label

- CSS variables inyectadas desde `TenantBranding`
- Logo en sidebar y emails
- `metadata` por tenant en Next.js layout `(tenant)`

## 6. Billing por tenant

```
Subscription { organizationId, plan, stripeCustomerId, mrr }
UsageRecord { organizationId, metric, quantity, period }
```

Límites: usuarios, storage GB, proyectos activos.

## 7. Seguridad cross-tenant

- **Nunca** confiar en `organizationId` del body — siempre del JWT/host
- Tests de aislamiento: tenant A no lee datos de tenant B
- Row Level Security PostgreSQL (fase scale)

## 8. Onboarding tenant

1. Owner crea Organization en `/platform/tenants/new`
2. Email invitación al primer `ADMIN`
3. Wizard: branding → primer proyecto → invitar clientes
4. DNS CNAME para dominio custom (validación ACME)
