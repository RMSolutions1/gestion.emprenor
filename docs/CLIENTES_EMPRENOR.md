# Emprenor.com.ar — Relación proveedor / cliente

## Rol de la plataforma

La plataforma es **exclusivamente comunicación y documentación entre cliente y proveedor** en cada proyecto (electricidad, obra, refacción, etc.). El cliente puede ser particular, sociedad, comercio o industria.

Ver definición completa: [PLATAFORMA_CLIENTE_PROVEEDOR.md](./PLATAFORMA_CLIENTE_PROVEEDOR.md).

**Emprenor** actúa como proveedor ejecutor en la demo; cada **cliente** accede solo a **sus obras**: planos, legajo de personal, presupuesto, consultas, adicionales y recepción (POL-GAR-001).

## Cartera demo (Salta)

| Cliente | Email portal | Contraseña | Proyecto | Tipo sitio |
|---------|--------------|------------|----------|------------|
| **CRONEC S.R.L.** | cliente@cronec.com.ar | cliente123 | `proj-cronec` | Industrial |
| **Gobierno de Salta** | cliente@gobiernosalta.gov.ar | cliente123 | `proj-gob-salta` | Servicios públicos |
| **Barrio Privado El Tipal** | cliente@eltipal.com.ar | cliente123 | `proj-demo-3` | Barrio privado |
| Alias demo El Tipal | cliente@ejemplo.com | cliente123 | `proj-demo-3` | Barrio privado |

## Operador Emprenor

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administración | admin@emprenor.com | admin2024 |

## Qué ve cada cliente

- **CRONEC SRL**: nave industrial, planos, OT, materiales trazables, HSE industrial.
- **Gobierno de Salta**: obra pública, presupuesto, documentación para auditoría, cronograma.
- **El Tipal**: legajo ingreso, antecedentes, lista materiales con remito, adicionales con aprobación, recepción CONF-EL.

## Código

- `lib/emprenor-clients.ts` — perfiles y copy comercial
- `app/dashboard/_components/emprenor-clients-panel.tsx` — panel admin
- `app/dashboard/_components/client-emprenor-welcome.tsx` — bienvenida cliente

## Regenerar demo

```bash
npx dotenv -e .env --override -- tsx scripts/seed.ts
```
