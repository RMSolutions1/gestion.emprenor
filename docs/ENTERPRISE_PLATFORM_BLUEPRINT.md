# EMPRENOR — Plataforma Enterprise de Comunicación Operativa

> Blueprint corporativo tipo PowerChina / Techint / Skanska  
> Extensión sobre el núcleo actual (Next.js 14 + Prisma + PostgreSQL)

---

## 1. Visión

**Centro de comando digital operativo** que conecta en tiempo real a la empresa constructora con clientes corporativos, contratistas y especialistas técnicos.

| Pilar | Descripción |
|-------|-------------|
| Transparencia | El cliente ve avance, evidencias, legajo y KPI sin pedir reportes por email |
| Trazabilidad | Cada aprobación, documento y mensaje queda auditado con SLA |
| Seguridad | RBAC, MFA, cifrado y cumplimiento documental por tipo de sitio |
| Escala | Arquitectura cloud-native, multi-obra, multi-país, alta disponibilidad |

---

## 2. Estado actual (Emprenor v1) vs objetivo enterprise

| Capacidad | Hoy (v1) | Objetivo enterprise |
|-----------|----------|---------------------|
| Dashboard operativo | KPIs admin/cliente estáticos | Live Operations Wall + WebSockets |
| Chat operativo | No | Salas por obra, hilos, adjuntos, lectura |
| Documentación | S3 + categorías | DMS + versionado + OCR + vencimientos |
| Personal / ART / seguros | Workers + compliance | Legajo completo + exámenes médicos |
| Vehículos / maquinaria | Vehículos | Flota + maquinaria + geolocalización opcional |
| Planos | Upload PLANOS | Centro de planos con versiones y markup |
| Timeline obra | No | Hitos, % avance, Gantt simplificado |
| Aprobaciones | Informes + adicionales | Workflow engine multi-nivel |
| Reportes PDF/Excel | No | Generación programada + plantillas |
| IA | No | Resúmenes, auditoría documental, alertas |
| Notificaciones | No | Email, push, in-app, reglas SLA |
| Contratistas | No | Portal subcontratista + delegación |
| Auth | NextAuth JWT | OAuth2 + MFA + RBAC granular |
| Búsqueda | No | Elasticsearch full-text |
| Infra | Local + Docker DB | AWS EKS + Terraform + Redis |

**Cobertura estimada actual:** ~25 % del alcance enterprise definido.

---

## 3. Arquitectura objetivo (C4 — Contenedores)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLIENTES (Web + PWA móvil)                          │
│   Portal Cliente │ Portal Admin │ Portal Especialista │ Portal Contratista │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ TLS 1.3
┌───────────────────────────────────▼─────────────────────────────────────────┐
│                         CDN + WAF (CloudFront)                              │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│  Web App      │           │  API Gateway  │           │  Realtime GW  │
│  Next.js 14   │           │  NestJS       │           │  Socket.io    │
│  (SSR/ISR)    │           │  REST+GraphQL │           │  + Redis Pub  │
└───────┬───────┘           └───────┬───────┘           └───────┬───────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ PostgreSQL    │           │ Redis         │           │ Elasticsearch │
│ (Prisma)      │           │ cache/sessions│           │ docs/messages │
│ + read replica│           │ pub/sub       │           │ KPI search    │
└───────────────┘           └───────────────┘           └───────────────┘
        │                           │
        ▼                           ▼
┌───────────────┐           ┌───────────────┐
│ S3 / Glacier  │           │ SQS / Workers │
│ media + docs  │           │ PDF, IA, mail │
└───────────────┘           └───────────────┘
```

### Estrategia de migración del monolito actual

1. **Fase A:** Mantener Next.js como BFF (Backend-for-Frontend) y APIs Route Handlers existentes.
2. **Fase B:** Extraer dominios a microservicios NestJS (`auth`, `projects`, `documents`, `realtime`, `reports`).
3. **Fase C:** GraphQL Federation o API Gateway unificado delante de servicios.

---

## 4. Módulos funcionales (15 capacidades)

| # | Módulo | Servicio | Prioridad |
|---|--------|----------|-----------|
| 1 | Chat operativo RT | `realtime-service` | P0 |
| 2 | Live Operations Dashboard | `analytics-service` + WS | P0 |
| 3 | DMS inteligente | `document-service` | P0 |
| 4 | Evidencias en vivo | `media-service` | P0 |
| 5 | Control personal | `workforce-service` | P1 (parcial hoy) |
| 6 | Control vehículos | `fleet-service` | P1 (parcial hoy) |
| 7 | Contratistas | `contractor-service` | P1 |
| 8 | Centro de planos | `drawings-service` | P1 |
| 9 | Timeline obra | `schedule-service` | P1 |
| 10 | Reportes automáticos | `reporting-service` | P2 |
| 11 | Aprobaciones digitales | `workflow-service` | P1 (parcial hoy) |
| 12 | Export PDF/Excel | `export-worker` | P2 |
| 13 | IA auditoría | `ai-service` | P2 |
| 14 | Notificaciones | `notification-service` | P0 |
| 15 | SLA y trazabilidad | `audit-service` | P0 |

---

## 5. Modelo de datos — extensiones Prisma (resumen)

```prisma
// Nuevos dominios enterprise (extracto conceptual)

model Organization { id, name, tier, slaPolicyId }
model ProjectMilestone { id, projectId, name, percent, dueDate, status }
model LiveFeedEvent { id, projectId, type, payload, createdAt }
model ChatRoom { id, projectId, participants }
model ChatMessage { id, roomId, authorId, body, attachments }
model DocumentVersion { id, documentId, version, storageKey, checksum }
model Machinery { id, projectId, type, plate, compliance fields... }
model Contractor { id, orgId, legalName, complianceStatus }
model ApprovalWorkflow { id, entityType, entityId, steps, currentStep }
model AuditLog { id, actorId, action, resource, ip, metadata, createdAt }
model Notification { id, userId, channel, status, templateId }
model SlaTicket { id, projectId, type, dueAt, breachedAt }
```

---

## 6. Seguridad enterprise

| Capa | Implementación |
|------|----------------|
| Identidad | OAuth2 (Azure AD / Google Workspace) + credenciales legacy |
| Sesión | JWT access (15m) + refresh (7d) en Redis |
| MFA | TOTP obligatorio para admin y clientes tier-1 |
| RBAC | Roles + permisos por recurso (`project:read`, `doc:approve`) |
| Datos | AES-256 at-rest (S3 SSE-KMS), TLS 1.3 in-transit |
| Auditoría | `AuditLog` inmutable + export SIEM |

---

## 7. UX/UI — Command Center

### Design system «Emprenor Command»

- **Modo oscuro por defecto** para operaciones; claro opcional para clientes ejecutivos.
- Paleta: fondo `#0B0F14`, superficies `#151B23`, acento naranja Emprenor, estados semáforo.
- Tipografía: Plus Jakarta Sans (display) + DM Sans (UI).
- Layout: sidebar fija + top bar contextual + zona principal en grid 12 cols.
- Componentes: KPI tiles, feed en vivo, tablas densas, timeline vertical, visor planos.

### Pantallas wireframe (estructura)

1. **Command Home** — mapa obras + alertas SLA + feed RT  
2. **Obra 360** — tabs: Live | Chat | Docs | Personal | Flota | Planos | Timeline | Aprobaciones  
3. **Cliente ejecutivo** — solo lectura + aprobaciones 1-clic + reportes PDF  
4. **Contratista** — carga documentación delegada + chat restringido  

---

## 8. Realtime

```
Cliente WS ──► API Gateway ──► Socket.io cluster
                              │
                    Redis Pub/Sub (canales: project:{id})
                              │
              Eventos: message.new | progress.update | doc.uploaded
                       approval.pending | incident.created
```

---

## 9. Roadmap por fases (18 meses)

| Fase | Meses | Entregables |
|------|-------|-------------|
| **0 — Base** | 0-2 | Estabilizar v1, auth puerto/URL, tests E2E críticos |
| **1 — RT Core** | 2-5 | WebSockets, notificaciones, live feed, dark mode command UI |
| **2 — DMS+Workflow** | 5-8 | Versionado docs, vencimientos, workflow aprobaciones, timeline |
| **3 — Field** | 8-11 | App móvil PWA, fotos/video geo, maquinaria, contratistas |
| **4 — Intelligence** | 11-14 | Elasticsearch, reportes PDF/Excel, IA resúmenes |
| **5 — Enterprise** | 14-18 | NestJS split, K8s, Terraform, MFA/OAuth, multi-tenant |

---

## 10. Infraestructura AWS (referencia)

| Servicio | Uso |
|----------|-----|
| EKS | NestJS + Socket.io workers |
| RDS PostgreSQL | Datos transaccionales |
| ElastiCache Redis | Sesiones + pub/sub |
| OpenSearch | Elasticsearch managed |
| S3 + CloudFront | Media y documentos |
| SES / SNS | Notificaciones |
| Cognito (opcional) | OAuth2 + MFA |

---

## 11. Testing y calidad

- Unit: Jest (backend), Vitest (frontend)  
- Integration: Supertest + Testcontainers (Postgres/Redis)  
- E2E: Playwright (flujos admin/cliente/aprobación)  
- Load: k6 en APIs + WS (10k conexiones por región)  
- Security: OWASP ZAP, dependabot, SAST en CI  

---

## 12. Entregables del programa

| # | Entregable | Ubicación propuesta |
|---|------------|---------------------|
| 1 | Arquitectura | Este documento + diagramas canvas |
| 2 | Wireframes | `docs/wireframes/` (Figma export) |
| 3 | UI/UX | `packages/ui-command/` design tokens |
| 4-6 | FE/BE/APIs | `apps/web`, `apps/api`, `packages/shared` |
| 7 | BD | `prisma/schema.prisma` + migraciones |
| 8 | Realtime | `services/realtime/` |
| 9 | Dashboards | `apps/web/app/command/` |
| 10 | Docs técnicas | `docs/` |
| 11-13 | Docker/K8s/TF | `infra/docker`, `infra/k8s`, `infra/terraform` |
| 14-16 | Tests/Seguridad/Prod | CI/CD GitHub Actions + runbooks |

---

## 13. Próximo paso recomendado (sprint 1 — 4 semanas)

1. Módulo **Live Feed** + **notificaciones in-app** sobre stack actual (Next + Pusher/Ably o Socket.io en mismo monolito).  
2. **Dark mode Command UI** en dashboard admin/cliente.  
3. **AuditLog** en Prisma para trazabilidad mínima.  
4. **Document expiry** (ART, VTV, seguros) con alertas automáticas.  

Esto eleva la percepción «enterprise» sin reescribir todo el backend de inmediato.
