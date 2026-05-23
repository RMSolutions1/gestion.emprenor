# Auditoría de veracidad — Emprenor Nexus

**Principio:** confianza y profesionalismo. Solo prometemos en la web lo que el código y las pruebas confirman.  
**Fecha:** 2026-05-20  
**Método:** revisión de código + `scripts/smoke-test.mjs` + `scripts/dashboard-audit.mjs` contra `http://localhost:3001`

---

## Resumen ejecutivo

| Nivel | Significado |
|-------|-------------|
| **Operativo hoy** | Funciona en demo/producción MVP con PostgreSQL y usuarios reales |
| **Parcial** | Existe pero limitado o sin infra de producción |
| **Roadmap** | Documentado, no implementado |
| **No prometer** | No está o es simulación |

**Veredicto honesto:** el sistema **sí cumple el núcleo** “cliente ↔ proveedor en obra” (documentos, personal, consultas, presupuesto, adicionales, recepción). **No** está al 100 % del discurso “competidor global de Monday/Jira” ni de infra enterprise (multi-región, ISO, API pública, IA).

---

## Lo que la web promete vs hechos

### Canal cliente ↔ proveedor

| Promesa | Estado | Evidencia |
|---------|--------|-----------|
| Portal del cliente por obra | **Operativo** | Rol CLIENTE, tabs documentos/ledger/chat/workers |
| Consultas y justificaciones | **Operativo** | Chat por proyecto, plantillas, historial |
| Ficha del cliente (más datos = mejor) | **Operativo** | Modelo `ClientProfile`, % completitud |
| Documentación obra + personal | **Operativo** | `Document`, `Worker` legajo ART/seguros |

### Documentos y cumplimiento (legajo no empleado = personal en obra)

| Promesa | Estado | Evidencia |
|---------|--------|-----------|
| Subir planos, facturas, remitos | **Operativo** | API presigned + categorías |
| Versionado de documentos | **Operativo** | `DocumentVersion` |
| Firma digital en plataforma | **Operativo** | `documents/[id]/sign` |
| OCR automático | **Parcial** | `lib/document-ocr.ts` — **metadatos locales**, no Textract hasta configurar AWS |
| Legajo personal (ART, seguros, antecedentes) | **Operativo** | `Worker` + `evaluateWorkerCompliance` |
| Vehículos y vencimientos | **Operativo** | `Vehicle` + alertas compliance |
| HSE / permisos / inspecciones | **Operativo** | APIs `hse`, tabs proyecto |
| Calidad NC / CAPA | **Operativo** | APIs `quality-nc` |
| Biblioteca PAC por tenant | **Operativo** | `TenantPacDocument` |

### Comercial y cierre

| Promesa | Estado | Evidencia |
|---------|--------|-----------|
| Presupuesto y cuenta corriente | **Operativo** | `ProjectLedgerEntry`, tab ledger cliente |
| Adicionales con aprobación cliente | **Operativo** | `WorkExtra` PENDIENTE_CLIENTE |
| Recepción y garantía 120 días | **Operativo** | Campos recepción + POL-GAR-001 |
| Informes técnicos | **Operativo** | `TechnicalReport` |

### Plataforma SaaS

| Promesa | Estado | Evidencia |
|---------|--------|-----------|
| Multi-tenant (organizaciones) | **Operativo** | `Organization`, `orgFilter` |
| Registro de tenant | **Operativo** | `/registro` |
| Owner `/platform` | **Operativo** | Stats tenants (MRR puede ser métrica demo) |
| Billing Stripe | **Parcial** | UI planes; cobro real solo con claves Stripe |
| White-label (logo/colores por tenant) | **Parcial** | Schema `TenantBranding`; UI global usa marca Emprenor fija |
| Búsqueda global | **Operativo** | `/api/search` |
| Cola de trabajo admin | **Operativo** | `work-queue` panel |

### Comunicación y tiempo real

| Promesa | Estado | Evidencia |
|---------|--------|-----------|
| Chat por obra y canales | **Operativo** | Socket.io + REST |
| Chat en producción multi-instancia | **Parcial** | Requiere Redis adapter (roadmap) |
| Notificaciones | **Operativo** | Modelo `Notification` |

### “Escala global” (marketing)

| Promesa | Estado | Evidencia |
|---------|--------|-----------|
| vs Monday / Asana / Jira | **Estrategia** | Diferenciador válido en vertical obra+mandante |
| API abierta + webhooks | **Roadmap** | No hay OpenAPI pública ni webhooks |
| i18n EN/PT | **Roadmap** | Solo español en UI |
| Multi-región / 99.9 % SLA | **Roadmap** | Docker local; sin K8s prod documentado aquí |
| IA clasificación docs | **Roadmap** | OCR es plantilla dev |
| Gantt profesional | **Parcial** | Barra temporal + OT; no MS Project |
| App mobile offline | **Roadmap** | Web responsive, sin PWA offline |

---

## Pruebas automáticas (última corrida)

```bash
node scripts/smoke-test.mjs      # HTTP E2E
node scripts/dashboard-audit.mjs # páginas + APIs por rol
node scripts/db-audit.mjs        # tablas PostgreSQL
```

Corregido en auditoría: error **500** en `/api/dashboard/stats` y listado proyectos por serialización **Decimal** de Prisma (fix `lib/serialize-json.ts`).

Redirects `/dashboard/clients` y `/dashboard/team` → **307 a administración** es comportamiento **intencional**, no fallo.

---

## Certificados y legajo (lo que pedís explícitamente)

**Sí está en el producto** (no es humo):

- Personal: DNI, CUIL, ART, vencimiento ART, seguro de vida, EPP, antecedentes (barrio privado), notas de habilitación.
- Vehículos: patente, licencia conductor, RTO, seguro, ART.
- Motor `lib/compliance.ts` con niveles COMPLETO / INCOMPLETO / VENCIDO.
- Dashboard admin muestra alertas de legajo incompleto.

**Falta para “certificación enterprise”:** integración con registros externos (REBA, SRT en línea), firma cualificada AFIP, ISO 27001 — eso es **infra + legal**, no solo software.

---

## Desarrollo e infraestructura (honesto)

| Área | Hoy | Para producción seria |
|------|-----|------------------------|
| Código aplicación | Next.js 14 + Prisma | OK |
| Base de datos | PostgreSQL | OK con backups |
| Archivos | S3 presigned (si AWS configurado) | Requiere bucket y políticas |
| Auth | NextAuth credenciales | MFA/SSO roadmap |
| HTTPS / dominio | Responsabilidad deploy | Certificado TLS en reverse proxy |
| Secretos | `.env.local` | Vault / CI secrets |
| Monitoreo | `/api/health` | APM, logs centralizados |
| Legal | TyC / privacidad páginas | Revisión abogado local |

---

## Qué decir en ventas (sin exagerar)

> **Emprenor Nexus** es el canal donde su cliente ve la obra, el legajo del personal, el presupuesto y las consultas — con registro. No reemplaza aún a un ERP ni a Monday en tableros genéricos; **sí reemplaza** WhatsApp + carpetas + disputas sin constancia.

---

## Acciones recomendadas (prioridad)

1. **Marketing:** etiquetar “Incluido / Parcial / Próximamente” (ya ajustado en `lib/global-competition.ts`).
2. **Producción:** configurar AWS S3 + Textract o quitar “OCR” del hero hasta tenerlo.
3. **Stripe:** activar claves o texto “facturación manual en demo”.
4. **White-label:** aplicar `TenantBranding` en `dashboard-shell` o no prometerlo.
5. **API pública:** primera versión `/api/v1` + documentación cuando busquen escala.
6. **Re-ejecutar** smoke tras cada release: `node scripts/smoke-test.mjs`.

---

## Archivos de referencia

- Matriz competencia: `lib/global-competition.ts`
- Producto cliente-proveedor: `docs/PLATAFORMA_CLIENTE_PROVEEDOR.md`
- Preparación prod: `docs/PRODUCTION_READINESS.md`
- Roadmap: `docs/GLOBAL_ROADMAP.md`
