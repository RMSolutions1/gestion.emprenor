/**
 * Sectores enterprise Argentina — referencia de mercado (energía, minería, oil & gas, utilities, EPC).
 * Uso: marketing, alta de proyectos, checklists y copy de producto.
 */

export type EnterpriseSector = {
  id: string;
  name: string;
  tagline: string;
  compliance: string[];
  projectTypes: string[];
  siteType: string;
  examples: string;
};

export const ENTERPRISE_SECTORS: EnterpriseSector[] = [
  {
    id: "energia",
    name: "Energía y utilities",
    tagline: "Distribución, generación y mantenimiento de redes",
    compliance: ["AEA 90364", "ISO 9001", "Ley 19.587", "SRT", "POL-GAR-001"],
    projectTypes: ["Subestación", "Línea MT/BT", "Mantenimiento red", "Medición"],
    siteType: "ENERGIA",
    examples: "Pampa Energía, EDESA, EJESA, distribuidoras regionales",
  },
  {
    id: "oil_gas",
    name: "Oil & Gas",
    tagline: "Piping, montaje industrial y plantas de proceso",
    compliance: ["API / ISO", "HSE", "Permisos de trabajo", "ITP", "SIGCE"],
    projectTypes: ["Piping", "Montaje", "PCI", "Obra civil en site"],
    siteType: "OIL_GAS",
    examples: "YPF, Refinor, plantas de proceso, contratistas EPC",
  },
  {
    id: "mineria",
    name: "Minería",
    tagline: "Obras en site, infraestructura y sistemas críticos",
    compliance: ["HSE minero", "ART", "Legajo ingreso site", "Auditoría cliente"],
    projectTypes: ["Infraestructura mina", "Planta procesos", "Acueducto", "Estructura metálica"],
    siteType: "MINERIA",
    examples: "Operadores NOA/NEA, contratistas tipo IMEC, Sales de Jujuy",
  },
  {
    id: "industrial",
    name: "Industrial y manufactura",
    tagline: "Plantas, líneas, expansión y llave en mano",
    compliance: ["ISO 9001", "QMS", "NC/CAPA", "Trazabilidad materiales"],
    projectTypes: ["Planta industrial", "Línea producción", "Depósito", "Refacción"],
    siteType: "INDUSTRIA",
    examples: "CRONEC SRL, Techint, cementeras, alimenticias",
  },
  {
    id: "construccion",
    name: "Construcción e infraestructura",
    tagline: "Obra civil, arquitectura y proyectos llave en mano",
    compliance: ["RNC", "Seguros RC", "Recepción CONF-EL", "Adicionales cliente"],
    projectTypes: ["Obra civil", "Edificio", "Infraestructura vial", "Refacción"],
    siteType: "INFRAESTRUCTURA",
    examples: "Skanska, Milicic, constructoras regionales",
  },
  {
    id: "agro",
    name: "Agro e industria agropecuaria",
    tagline: "Silo, secadero, riego y plantas de acopio",
    compliance: ["HSE rural", "Documentación maquinaria", "Planos y remitos"],
    projectTypes: ["Silo", "Planta acopio", "Riego", "Galpón logístico"],
    siteType: "AGRO",
    examples: "Acopios, ingenios, agroexportadores",
  },
  {
    id: "servicios_publicos",
    name: "Servicios públicos y regulados",
    tagline: "Agua, saneamiento y obras con auditoría estatal",
    compliance: ["AySA / entes reguladores", "Transparencia documental", "HSE"],
    projectTypes: ["Red agua", "Planta potabilización", "Cloacas", "Mantenimiento"],
    siteType: "SERVICIOS_PUBLICOS",
    examples: "Gobierno de Salta, AySA, municipios",
  },
  {
    id: "residencial",
    name: "Residencial y desarrollos",
    tagline: "Vivienda, countries y barrios privados",
    compliance: ["Legajo personal", "Antecedentes", "Planos", "Garantía 120 días"],
    projectTypes: ["Vivienda unifamiliar", "Country", "Edificio baja altura"],
    siteType: "BARRIO_PRIVADO",
    examples: "Barrio Privado El Tipal, countries, desarrollistas",
  },
];

export const TRUST_MARKET_SEGMENTS = [
  "Energía",
  "Oil & Gas",
  "Minería",
  "Industrial",
  "Agro",
  "Utilities",
  "EPC / Llave en mano",
  "Sector público",
];

export const COMPETITIVE_PILLARS = [
  {
    title: "Un solo sistema, toda la cadena",
    desc: "Dueño de plataforma, empresa ejecutora, cliente final y subcontratistas con roles y datos aislados por tenant.",
  },
  {
    title: "Compliance Argentina nativo",
    desc: "AEA, IRAM, Ley 19.587, SRT, ISO 9001, PAC/SIGCE, garantía POL-GAR-001 y constancias legales.",
  },
  {
    title: "Aprobaciones con valor legal",
    desc: "Adicionales, recepción CONF-EL y trazabilidad horaria — no solo chat.",
  },
  {
    title: "Listo para auditoría",
    desc: "ITP, legajo digital, vencimientos ART/seguros y feed operativo en tiempo real.",
  },
];

export function sectorBySiteType(siteType: string): EnterpriseSector | undefined {
  return ENTERPRISE_SECTORS.find((s) => s.siteType === siteType);
}
