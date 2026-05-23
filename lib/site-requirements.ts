/** Requisitos tipicos segun tipo de sitio (checklist para admin) */

export type SiteRequirementItem = {
  id: string;
  label: string;
  category: "personal" | "vehiculo" | "materiales" | "documentacion" | "informes";
};

export const BARRIO_PRIVADO_REQUIREMENTS: SiteRequirementItem[] = [
  { id: "dni", label: "DNI de cada operario", category: "personal" },
  { id: "cuil_cuit", label: "CUIL/CUIT del personal (si corresponde)", category: "personal" },
  { id: "antecedentes", label: "Antecedentes penales / policiales vigentes", category: "personal" },
  { id: "art", label: "ART vigente por trabajador", category: "personal" },
  { id: "seguro_vida", label: "Seguro de vida", category: "personal" },
  { id: "epp", label: "EPP entregado y registrado", category: "personal" },
  { id: "vehiculo_docs", label: "Documentacion completa de vehiculos (patente, VTV, seguro, ART)", category: "vehiculo" },
  { id: "licencia", label: "Licencia de conducir del chofer vigente", category: "vehiculo" },
  { id: "lista_materiales", label: "Lista de materiales y herramientas a ingresar al predio", category: "materiales" },
  { id: "planos", label: "Planos o alcance del trabajo a ejecutar", category: "documentacion" },
  { id: "informe_conformidad", label: "Informes / conformidades de especialistas", category: "informes" },
];

const INDUSTRIAL_EXTRA: SiteRequirementItem[] = [
  { id: "permiso_trabajo", label: "Permiso de trabajo / ATS vigente (HSE)", category: "documentacion" },
  { id: "poliza_rc", label: "Poliza responsabilidad civil del contratista", category: "documentacion" },
  { id: "itp", label: "Plan de inspeccion y ensayo (ITP) aprobado", category: "informes" },
];

const MINERIA_OIL_EXTRA: SiteRequirementItem[] = [
  ...INDUSTRIAL_EXTRA,
  { id: "ingreso_site", label: "Autorizacion de ingreso a site / cliente minero", category: "documentacion" },
  { id: "induccion_hse", label: "Induccion HSE site completada", category: "personal" },
];

export function getRequirementsForSiteType(siteType: string): SiteRequirementItem[] {
  if (siteType === "BARRIO_PRIVADO" || siteType === "RESIDENCIAL") {
    return BARRIO_PRIVADO_REQUIREMENTS;
  }
  if (siteType === "MINERIA" || siteType === "OIL_GAS") {
    return [...BARRIO_PRIVADO_REQUIREMENTS.slice(0, 8), ...MINERIA_OIL_EXTRA];
  }
  if (
    siteType === "INDUSTRIA" ||
    siteType === "ENERGIA" ||
    siteType === "INFRAESTRUCTURA" ||
    siteType === "AGRO" ||
    siteType === "SERVICIOS_PUBLICOS"
  ) {
    return [...BARRIO_PRIVADO_REQUIREMENTS.slice(0, 9), ...INDUSTRIAL_EXTRA];
  }
  return BARRIO_PRIVADO_REQUIREMENTS.slice(0, 8);
}
