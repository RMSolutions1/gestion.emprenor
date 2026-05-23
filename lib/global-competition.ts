/**
 * Posicionamiento global vs Monday, Asana, ClickUp, Jira y similares.
 * Emprenor no compite como "otro tablero": compite como OS cliente↔proveedor en sitio.
 */

export const GLOBAL_VISION = {
  headline: "El sistema operativo de la relacion cliente–proveedor en obra y servicios",
  subhead:
    "Monday, Asana, ClickUp y Jira organizan tareas internas. Emprenor Nexus une al mandante con quien ejecuta en sitio: documentacion, personal, cobros y consultas con trazabilidad legal.",
  scaleTarget: "Multi-tenant · multi-region · multi-idioma · API abierta",
} as const;

export type CompetitorId = "monday" | "asana" | "clickup" | "jira" | "generic";

export type CompetitorProfile = {
  id: CompetitorId;
  name: string;
  strength: string;
  gap: string;
};

export const GLOBAL_COMPETITORS: CompetitorProfile[] = [
  {
    id: "monday",
    name: "Monday.com",
    strength: "Tableros visuales y automatizaciones para equipos internos",
    gap: "No modela portal del cliente, legajo de obra ni cuenta corriente con mandante",
  },
  {
    id: "asana",
    name: "Asana",
    strength: "Gestion de proyectos y tareas para marketing y producto",
    gap: "Sin HSE, sin documentacion de personal en sitio ni recepcion formal de obra",
  },
  {
    id: "clickup",
    name: "ClickUp",
    strength: "Todo-en-uno con docs y chat interno",
    gap: "Chat no es canal auditado cliente–proveedor; sin compliance industrial argentino/global",
  },
  {
    id: "jira",
    name: "Jira",
    strength: "Flujos de desarrollo y ITSM a escala",
    gap: "Orientado a software, no a electricistas/constructoras con mandante externo",
  },
];

/** Filas de matriz comparativa (marketing / ventas) */
export const COMPARISON_ROWS: {
  capability: string;
  nexus: "full" | "partial" | "roadmap";
  others: string;
}[] = [
  {
    capability: "Canal trazable cliente ↔ proveedor por obra",
    nexus: "full",
    others: "Guest limitado o inexistente",
  },
  {
    capability: "Documentacion de proyecto + legajo de personal",
    nexus: "full",
    others: "Adjuntos genericos sin modelo de obra",
  },
  {
    capability: "Presupuesto, adicionales y cuenta corriente con mandante",
    nexus: "full",
    others: "Requiere integraciones y hojas aparte",
  },
  {
    capability: "Consultas y justificaciones auditables",
    nexus: "full",
    others: "Comentarios sin rol cliente formal",
  },
  {
    capability: "HSE, calidad (NC/CAPA) y permisos de trabajo",
    nexus: "full",
    others: "Plugins o no aplica",
  },
  {
    capability: "Multi-tenant SaaS (organizaciones aisladas)",
    nexus: "full",
    others: "Si (enterprise caro)",
  },
  {
    capability: "White-label (logo y colores por tenant)",
    nexus: "partial",
    others: "Si (planes superiores)",
  },
  {
    capability: "Tableros Kanban / Gantt universales",
    nexus: "partial",
    others: "Fortaleza principal",
  },
  {
    capability: "Marketplace de integraciones (Slack, SAP, ERP)",
    nexus: "roadmap",
    others: "Maduro",
  },
  {
    capability: "IA resumen de obra y clasificacion documental",
    nexus: "roadmap",
    others: "En expansion",
  },
  {
    capability: "Mobile offline en obra",
    nexus: "roadmap",
    others: "Apps propias",
  },
];

export const SCALE_PILLARS = [
  {
    id: "tenant",
    title: "SaaS multi-tenant",
    desc: "Organizaciones aisladas, planes, billing (Stripe con claves) y command center.",
    status: "live" as const,
  },
  {
    id: "realtime",
    title: "Tiempo real",
    desc: "Chat y notificaciones operativos; Redis adapter recomendado en produccion multi-servidor.",
    status: "partial" as const,
  },
  {
    id: "dms",
    title: "DMS industrial",
    desc: "Versionado, firma, categorias y PAC. OCR completo requiere Textract/AWS configurado.",
    status: "partial" as const,
  },
  {
    id: "api",
    title: "API e integraciones",
    desc: "REST abierto, webhooks, conectores ERP y marketplace (fase escala global).",
    status: "roadmap" as const,
  },
  {
    id: "i18n",
    title: "Localizacion",
    desc: "ES-AR, EN-US, PT-BR — misma base para LATAM, US y Europa.",
    status: "roadmap" as const,
  },
  {
    id: "infra",
    title: "Infra global",
    desc: "Multi-region (sa-east-1, us-east-1, eu-west-1), 99.9% SLA, ISO 27001.",
    status: "roadmap" as const,
  },
];

export const WIN_STRATEGY = [
  "Vertical primero: servicios en sitio (obra, electricidad, industrial) donde Jira/Monday no encajan.",
  "Mandante incluido: el cliente es usuario de primera clase, no un email en CC.",
  "Compliance empaquetado: HSE, legajo, recepcion — no 15 plugins.",
  "LATAM fuerte → expansion EN/PT con mismos modulos.",
  "API + partners: integradores locales empujan Nexus donde ERP no llega.",
] as const;
