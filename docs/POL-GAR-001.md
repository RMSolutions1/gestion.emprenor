# POL-GAR-001 — Política de garantía de servicios

**Código:** POL-GAR-001  
**Revisión:** 01 — 2025  
**Estado:** Vigente  
**Alcance:** Grupo Emprenor — todas las obras y servicios entregados al cliente final  
**Documentos relacionados:** PAC-EL-003 Rev.3 §13 (CONF-EL-001), SIGCE-GE-001, PS-EL-001

## 1. Objeto

Establecer la **garantía mínima de 120 (ciento veinte) días corridos** sobre trabajos y servicios ejecutados, contados desde la **recepción final conforme** del cliente, registrada en plataforma y documentada con certificado CONF-EL-xxx.

## 2. Inicio de la garantía

- La garantía **solo** comienza cuando el cliente con firma electrónica en plataforma confirma la recepción (acta CONF-EL-001).
- El proveedor puede marcar previamente la obra como **lista para recepción**; eso no inicia el plazo.
- Mientras existan adicionales en estado `PENDIENTE_CLIENTE`, se recomienda no habilitar recepción final.

## 3. Alcance de la garantía

Cubre defectos de ejecución, fallas atribuibles al proveedor y no conformidades del alcance contratado y aprobado, dentro del marco técnico AEA/IRAM aplicable y del legajo QA/QC de la obra.

**Exclusiones (no exhaustivas):**

- Daños por terceros, vandalismo o uso distinto al acordado.
- Modificaciones realizadas por el cliente u otros sin autorización.
- Desgaste normal y mantenimiento del cliente.
- Hechos de fuerza mayor.

## 4. Plazo

| Concepto | Valor |
|----------|--------|
| Mínimo legal interno | **120 días corridos** |
| Campo en sistema | `warrantyDays` (default 120) |
| Fin de garantía | `receptionAt` + `warrantyDays` |

## 5. Registros y retención

- Certificado HTML/PDF: `CONF-EL-YYYYMMDD-XXXXXXXX`
- Auditoría en `AuditLog` y feed operativo
- Registros QA/QC del PAC: retención **10 años** (independiente del plazo de garantía comercial)

## 6. Responsabilidades

| Rol | Acción |
|-----|--------|
| QA/QC / Admin tenant | Verificar legajo, marcar lista para recepción |
| Cliente | Confirmar recepción y descargar certificado |
| Plataforma Emprenor | Calcular vencimiento, alertas, trazabilidad |

## 7. Implementación en Emprenor Nexus

- Pestaña **Recepción y garantía** en el proyecto
- API: `PUT/GET /api/projects/[id]/reception`
- Certificado: `GET /api/projects/[id]/reception/certificado`
