# Plataforma cliente ↔ proveedor

## Que es

**Emprenor Nexus** no es un marketplace ni una red social de obras. Es un **canal privado de comunicacion y documentacion** entre:

- **Proveedor**: empresa o profesional que ejecuta un trabajo (electricidad, construccion, refaccion, montaje, gas, mantenimiento, etc.).
- **Cliente**: quien contrata el servicio — puede ser una persona, una sociedad, un comercio, una industria, un consorcio u organismo.

Cada proyecto en la plataforma representa **un contrato de servicio en curso** entre esas dos partes.

## Que se sube y comparte

| Ambito | Contenido tipico |
|--------|------------------|
| **Proyecto** | Planos, presupuesto, remitos, facturas, informes, conformidades, cronograma, fotos de avance |
| **Personal** | Legajo del equipo: ART, seguros, antecedentes, habilitaciones (visible al cliente segun politica del proveedor) |

El proveedor (rol administrador / tecnico) carga la documentacion. El cliente accede en modo **solo lectura** y aprobaciones donde corresponda.

## Ficha del cliente (cuanto mas info, mejor)

Cada usuario **CLIENTE** tiene una ficha en `ClientProfile`:

- Tipo: particular, empresa, comercio, industria, publico, consorcio
- Razon social, CUIT, telefonos, direccion, rubro
- **Completitud %** visible para el proveedor (administracion y obra)

El cliente puede completar su ficha desde el panel; el proveedor la edita en **Administracion → Clientes → Ficha**.

## Consultas y justificaciones

Si el cliente tiene una duda o necesita una justificacion, lo hace **dentro de la plataforma**:

- Chat trazable por proyecto (`?tab=chat`)
- Mensajes con fecha, autor y rol
- Sin depender de WhatsApp o correo informal

Plantillas sugeridas: ver `lib/platform-positioning.ts` → `CONSULTATION_HINTS`.

## Roles

| Rol | Funcion |
|-----|---------|
| Admin / equipo proveedor | Sube docs, gestiona personal, responde consultas |
| Cliente | Ve su obra, documentacion, presupuesto, personal asignado; consulta y aprueba |

## Codigo relacionado

- `lib/platform-positioning.ts` — copy y plantillas
- `components/platform/client-provider-mission.tsx` — UI portal cliente
- `components/chat/project-chat-panel.tsx` — canal de consultas por obra
