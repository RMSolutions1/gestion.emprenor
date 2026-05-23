# Competencia global — Emprenor Nexus vs Monday, Asana, ClickUp, Jira

## Tesis

No ganamos siendo **el tablero más bonito**. Ganamos siendo el **sistema operativo de la relación cliente–proveedor** cuando el trabajo ocurre **en sitio** (obra, planta, instalación, refacción).

Los gigantes resuelven **coordinación interna**. Nexus resuelve **confianza externa**: documentación compartida, personal habilitado, cobros transparentes y consultas con registro.

## Mapa de competidores

| Producto | Fortaleza | Por qué no nos reemplaza |
|----------|-----------|---------------------------|
| **Monday.com** | Automatización visual, CRM ligero | Sin modelo de mandante, legajo de obra ni cuenta corriente contractual |
| **Asana** | Proyectos de conocimiento / marketing | Sin HSE, recepción de obra ni portal de cliente industrial |
| **ClickUp** | Docs + chat + tareas unificados | Chat interno; no canal auditado cliente–proveedor ni compliance de sitio |
| **Jira** | Software / ITSM a escala | Dominio dev; inadecuado para contratista con cliente externo no técnico |

## Matriz de capacidades

Ver `lib/global-competition.ts` → `COMPARISON_ROWS`.

**Regla de producto:** mantener ventaja en filas `full`; cerrar brecha en `partial` (Gantt/Kanban) sin copiar toda la complejidad de Monday; acelerar `roadmap` (API, i18n, IA, mobile).

## Estrategia de escala mundial

### Fase A — Wedge (ahora → 6 meses)

- Argentina + LATAM: proveedores de servicios con cliente exigente
- Demo investor: multi-tenant, billing, owner `/platform`
- Mensaje único en marketing: **cliente ↔ proveedor**, no “project management genérico”

### Fase B — Paridad competitiva (6–18 meses)

- Gantt / dependencias de tareas (paridad mínima con Asana/Monday)
- API pública + webhooks + Zapier/Make
- EN + PT-BR UI
- Apps PWA offline (parte diario, fotos, chat)
- IA: resumen semanal de obra, clasificación de documentos

### Fase C — Escala enterprise (18–36 meses)

- Multi-región activa (SA, US, EU)
- SSO SAML, SCIM, MFA
- Conectores SAP / Oracle / Microsoft
- Marketplace de partners certificados
- SLA 99.9 %, SOC2 / ISO 27001

**KPI norte:** ARR global, NRR > 110 %, tiempo de onboarding tenant < 48 h.

## Qué NO hacer (anti-patterns)

- Competir solo por precio contra ClickUp
- Clonar Jira para equipos de software (desvía el wedge)
- Sacrificar el portal del cliente por “más columnas en el tablero”
- Multi-tenant sin tests de aislamiento (riesgo fatal en enterprise)

## Código y docs relacionados

| Recurso | Uso |
|---------|-----|
| `lib/global-competition.ts` | Marketing, ventas, pitch |
| `lib/platform-positioning.ts` | Definición cliente–proveedor |
| `docs/GLOBAL_ROADMAP.md` | Fases técnicas 2025–2027 |
| `docs/MULTI_TENANT_ARCHITECTURE.md` | Base SaaS global |

## Mensaje para inversores / enterprise

> **Emprenor Nexus es para empresas que venden servicios en sitio y necesitan que su cliente vea, apruebe y consulte sin fricción — algo que Monday y Jira nunca priorizaron porque su usuario es el empleado interno, no el mandante.**
