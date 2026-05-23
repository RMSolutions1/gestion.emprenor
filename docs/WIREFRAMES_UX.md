# Wireframes UX — Emprenor Nexus

## Owner Global (`/platform`)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo Nexus]  Global Command Center          [Alerts] [Profile] │
├──────────┬───────────────────────────────────────────────────────┤
│ Tenants  │  KPI ROW: MRR | ARR | Tenants | Users | Uptime 99.9% │
│ Billing  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐ │
│ Security │  │ Live tenant │ │ Revenue     │ │ System health   │ │
│ Logs     │  │ activity    │ │ chart       │ │ K8s / APIs      │ │
│ Support  │  └─────────────┘ └─────────────┘ └─────────────────┘ │
│ IA       │  TABLE: Tenants (name, plan, users, MRR, status)      │
└──────────┴───────────────────────────────────────────────────────┘
```

## Tenant Admin (`/dashboard`)

```
Sidebar oscuro | KPIs obra | Alertas vencimiento | Feed en vivo
Proyectos | Clientes | Equipo | Centro comando
```

## Cliente (`/dashboard`)

```
Mis obras | Pendientes aprobación | Timeline | Documentos | Chat proyecto
```

## Chat operativo

```
┌─ #obra-country-acacias ─────────────────────────────┐
│ [Sistema] Informe NC-2024 enviado a aprobación       │
│ [Ing. Pérez] @cliente revisar plano rev.3 adjunto    │
│ ── hilo (2 respuestas)                               │
│ [Input] + adjuntar + mención + prioridad             │
└──────────────────────────────────────────────────────┘
```

## Mobile (futuro PWA)

- Bottom nav: Inicio | Chat | Obras | Docs | Perfil
- Modo offline: checklist HSE + sync

## Principios UX

1. **Una acción primaria** por pantalla
2. **Estado siempre visible** (SLA, vencimientos, pendientes)
3. **Dark mode** default en operaciones
4. **Datos en monospace** para KPIs
5. **Cero modales anidados** — drawers laterales
