# Roadmap Multinacional — Emprenor Nexus (2025–2027)

> Competencia declarada: **Monday, Asana, ClickUp, Jira**. Estrategia detallada: [COMPETENCIA_GLOBAL.md](./COMPETENCIA_GLOBAL.md).

## Fase 0 — Fundación (actual, 4–6 semanas)

- [x] Núcleo operativo: proyectos, legajo, vehículos, informes, feed
- [x] Documentación arquitectura enterprise
- [x] Multi-tenant schema + organizaciones
- [x] Owner Command Center `/platform`
- [x] Sitio marketing público + sección escala global
- [x] Posicionamiento cliente ↔ proveedor
- [ ] Legal templates (TyC, privacidad) firmes
- [ ] Tests aislamiento multi-tenant automatizados

**KPI:** Build verde, demo investor-ready, mensaje diferenciado vs PM genéricos

---

## Fase 1 — Comunicación RT (Q2 2025, 8 semanas)

- Socket.io + Redis adapter
- Chat: empresa, proyecto, DM, hilos
- Adjuntos en mensajes → DMS
- Notificaciones push (web)
- Reemplazo polling en feed crítico

**KPI:** < 200ms latencia mensaje p95

---

## Fase 2 — DMS + HSE + QMS base (Q3 2025, 12 semanas)

- Versionado documentos + OCR
- ATS digital + permisos trabajo
- NC / CAPA calidad
- Órdenes de trabajo completas
- NestJS API gateway (extracción gradual)

**KPI:** 10K documentos/tenant sin degradación

---

## Fase 3 — SaaS comercial (Q4 2025, 10 semanas)

- Stripe billing (MRR/ARR en owner dashboard)
- Planes Starter / Pro / Enterprise
- Dominios custom + white-label completo
- Keycloak + MFA obligatorio admin
- Elasticsearch búsqueda

**KPI:** Primer tenant pago externo

---

## Fase 4 — Escala global (2026 H1)

- Kubernetes EKS multi-región (sa-east-1 + us-east-1)
- Schema-per-tenant tier enterprise
- WebRTC videollamadas
- IA: resúmenes chat, clasificación docs, riesgos
- Mobile PWA offline-first
- ISO 27001 gap assessment

**KPI:** 99.9 % uptime SLA

---

## Fase 5 — Paridad + dominio (2026 H2 – 2027)

- Gantt / dependencias (paridad mínima Monday/Asana)
- Integraciones SAP / Oracle / Microsoft
- Marketplace integraciones (nivel ClickUp ecosystem)
- Certificaciones IRAM / ISO workflows auditables
- Localización PT-BR, EN-US, ES-419
- Posicionamiento G2/Capterra categoría "Construction PM" + "Client Portal"

**KPI:** ARR $1M+, 50+ tenants enterprise, win-rate vs Jira en RFP industrial

---

## Inversión estimada por fase

| Fase | Equipo | Duración |
|------|--------|----------|
| 0 | 2 dev + 1 diseño | 6 sem |
| 1–2 | 4 dev + 1 DevOps | 5 meses |
| 3–4 | 6 dev + 2 DevOps + 1 QA | 9 meses |
| 5 | 10+ equipo producto | 12+ meses |
