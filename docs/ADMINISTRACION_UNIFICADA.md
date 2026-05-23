# Administración unificada — una sola BD `emprenor`

## Principio

Todo (empresa, empleados, clientes, obras, legajo en obra) vive en **PostgreSQL** vía Prisma.  
No hay bases paralelas ni APIs duplicadas para el directorio maestro.

## Pantalla

**`/dashboard/administracion`** — Server Components + **Server Actions** (`lib/actions/directory.ts`).

| Pestaña | Contenido |
|---------|-----------|
| Resumen | KPIs y acceso rápido a obras |
| Clientes | Usuarios `CLIENTE` |
| Empleados | Admin + especialistas |
| Obras | Proyectos del tenant |
| Empresa | Datos del tenant |

## Variables de entorno

En `.env.local` debe existir **`DATABASE_URL`** apuntando a la BD `emprenor`.

`MONGODB_URI` **no** alimenta Nexus (legacy u otros servicios).

## Acceso

- `ADMIN` — solo su organización (`organizationId`)
- `PLATFORM_OWNER` — toda la plataforma

Rutas antiguas redirigen:

- `/dashboard/clients` → `?tab=clientes`
- `/dashboard/team` → `?tab=empleados`
