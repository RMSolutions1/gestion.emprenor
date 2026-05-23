import { isAdmin, isCliente, isSpecialist } from "@/lib/roles";

export type ProjectTabId =
  | "info"
  | "site"
  | "schedule"
  | "workers"
  | "vehicles"
  | "materials"
  | "work-orders"
  | "documents"
  | "insurance"
  | "quality"
  | "hse"
  | "incidents"
  | "reports"
  | "extras"
  | "chat"
  | "assignments"
  | "reception"
  | "ledger"
  | "site-log"
  | "tasks"
  | "daily";

export type ProjectNavItem = {
  value: ProjectTabId;
  label: string;
};

export type ProjectNavCategory = {
  id: string;
  label: string;
  description?: string;
  items: ProjectNavItem[];
};

export const PROJECT_TAB_IDS: ProjectTabId[] = [
  "info",
  "site",
  "documents",
  "workers",
  "vehicles",
  "materials",
  "reports",
  "extras",
  "incidents",
  "assignments",
  "chat",
  "work-orders",
  "insurance",
  "quality",
  "hse",
  "schedule",
  "reception",
  "ledger",
  "site-log",
  "tasks",
  "daily",
];

/** Visibilidad por rol — mismos tabs/API, distinta navegacion */
export function canAccessProjectTab(tab: ProjectTabId, role: string): boolean {
  if (isAdmin(role)) return true;

  if (isCliente(role)) {
    return [
      "documents",
      "ledger",
      "site-log",
      "workers",
      "insurance",
      "site",
      "extras",
      "reports",
      "schedule",
      "info",
      "chat",
      "reception",
    ].includes(tab);
  }

  if (isSpecialist(role)) {
    return tab !== "assignments";
  }

  return true;
}

export const PROJECT_NAV_CATEGORIES: ProjectNavCategory[] = [
  {
    id: "resumen",
    label: "Resumen",
    description: "Datos generales y planificacion",
    items: [
      { value: "info", label: "Informacion" },
      { value: "site", label: "Requisitos sitio" },
      { value: "schedule", label: "Cronograma" },
    ],
  },
  {
    id: "operacion",
    label: "Operacion",
    description: "Recursos y ejecucion en obra",
    items: [
      { value: "workers", label: "Personal" },
      { value: "vehicles", label: "Transporte" },
      { value: "materials", label: "Materiales" },
      { value: "tasks", label: "Tareas" },
      { value: "daily", label: "Parte diario" },
      { value: "work-orders", label: "Ordenes trabajo" },
    ],
  },
  {
    id: "documentos",
    label: "Documentacion",
    description: "Planos, presupuestos, facturas y legajo",
    items: [
      { value: "documents", label: "Planos y documentos" },
      { value: "ledger", label: "Presupuesto y cobros" },
      { value: "insurance", label: "Seguros proveedor" },
    ],
  },
  {
    id: "calidad-hse",
    label: "Calidad y HSE",
    description: "QMS, seguridad e incidencias",
    items: [
      { value: "quality", label: "Calidad QMS" },
      { value: "hse", label: "Seguridad HSE" },
      { value: "incidents", label: "Incidencias" },
    ],
  },
  {
    id: "comercial",
    label: "Comercial",
    description: "Cliente e informes",
    items: [
      { value: "reports", label: "Informes" },
      { value: "extras", label: "Adicionales $" },
      { value: "reception", label: "Recepción y garantía" },
    ],
  },
  {
    id: "bitacora",
    label: "Bitácora",
    description: "Registro fotográfico de obra",
    items: [{ value: "site-log", label: "Fotos obra" }],
  },
  {
    id: "comunicacion",
    label: "Consultas",
    description: "Canal directo cliente ↔ proveedor",
    items: [{ value: "chat", label: "Consultas al cliente" }],
  },
  {
    id: "admin",
    label: "Administracion",
    items: [{ value: "assignments", label: "Accesos" }],
  },
];

const CLIENT_TAB_LABELS: Partial<Record<ProjectTabId, string>> = {
  documents: "Planos y documentacion",
  ledger: "Presupuesto y cuenta corriente",
  workers: "Personal y legajo",
  "site-log": "Avance de obra (fotos)",
  reports: "Informes tecnicos",
  extras: "Adicionales y aprobaciones",
  reception: "Recepcion y garantia",
  chat: "Consultas y justificaciones",
};

export function getVisibleCategories(role: string): ProjectNavCategory[] {
  const cats = PROJECT_NAV_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items
      .filter((item) => canAccessProjectTab(item.value, role))
      .map((item) =>
        isCliente(role) && CLIENT_TAB_LABELS[item.value]
          ? { ...item, label: CLIENT_TAB_LABELS[item.value]! }
          : item
      ),
  })).filter((cat) => cat.items.length > 0);

  if (isCliente(role)) {
    const order = ["documentos", "bitacora", "comercial", "operacion", "resumen", "comunicacion"];
    return [...cats].sort((a, b) => {
      const ia = order.indexOf(a.id);
      const ib = order.indexOf(b.id);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }
  return cats;
}

export function findCategoryForTab(
  tab: ProjectTabId,
  categories: ProjectNavCategory[]
): string {
  return categories.find((c) => c.items.some((i) => i.value === tab))?.id ?? categories[0]?.id ?? "resumen";
}

export function resolveInitialTab(role: string, tabFromUrl: string | null): ProjectTabId {
  const categories = getVisibleCategories(role);
  const allVisible = categories.flatMap((c) => c.items.map((i) => i.value));
  if (tabFromUrl && allVisible.includes(tabFromUrl as ProjectTabId)) {
    return tabFromUrl as ProjectTabId;
  }
  if (isCliente(role) && allVisible.includes("documents")) {
    return "documents";
  }
  return allVisible[0] ?? "info";
}
