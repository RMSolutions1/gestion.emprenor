/**
 * Cartera de clientes Emprenor.com.ar — referencia comercial y demo.
 */

export type EmprenorClientProfile = {
  id: string;
  legalName: string;
  shortName: string;
  sector: string;
  siteType: string;
  location: string;
  contactName: string;
  contactEmail: string;
  portalPassword: string;
  projectId: string;
  projectName: string;
  projectAddress: string;
  tagline: string;
};

export const EMPRENOR_BRAND = {
  domain: "emprenor.com.ar",
  name: "Emprenor Servicios",
  product: "Emprenor Nexus",
  legalName: "Emprenor S.R.L.",
  tagline: "Ingenieria, obra y compliance digital — Argentina",
  phone: "+54 387 242-4161",
  email: "info@emprenor.com.ar",
};

export const EMPRENOR_CLIENTS: EmprenorClientProfile[] = [
  {
    id: "cronec",
    legalName: "CRONEC S.R.L.",
    shortName: "CRONEC SRL",
    sector: "Industrial / montaje",
    siteType: "INDUSTRIA",
    location: "Salta Capital y zona industrial",
    contactName: "Ing. Roberto Cronenberg",
    contactEmail: "cliente@cronec.com.ar",
    portalPassword: "cliente123",
    projectId: "proj-cronec",
    projectName: "Ampliacion nave industrial — CRONEC",
    projectAddress: "Parque Industrial Salta, Lote 8",
    tagline: "Estructuras metalicas, montaje y obra llave en mano para industria local.",
  },
  {
    id: "gob-salta",
    legalName: "Gobierno de la Provincia de Salta",
    shortName: "Gobierno de Salta",
    sector: "Sector publico / infraestructura",
    siteType: "SERVICIOS_PUBLICOS",
    location: "Salta Capital",
    contactName: "Direccion de Obras Publicas",
    contactEmail: "cliente@gobiernosalta.gov.ar",
    portalPassword: "cliente123",
    projectId: "proj-gob-salta",
    projectName: "Refaccion edilicia — Edificio administrativo",
    projectAddress: "Centro Civico, Salta Capital",
    tagline: "Obra publica con transparencia documental, PAC y auditoria estatal.",
  },
  {
    id: "el-tipal",
    legalName: "Administracion Barrio Privado El Tipal",
    shortName: "Barrio Privado El Tipal",
    sector: "Barrio cerrado / residencial",
    siteType: "BARRIO_PRIVADO",
    location: "Salta — acceso Ruta 51",
    contactName: "Sr. Martin Lopez — Comision Directiva",
    contactEmail: "cliente@eltipal.com.ar",
    portalPassword: "cliente123",
    projectId: "proj-demo-3",
    projectName: "Refaccion y ampliacion — Lote 24 El Tipal",
    projectAddress: "Barrio Privado El Tipal, Salta",
    tagline: "Legajo de ingreso, antecedentes, materiales y garantia 120 dias para consorcio.",
  },
  {
    id: "empresa-sin",
    legalName: "Servicios Integrales del Norte S.A.",
    shortName: "SIN S.A.",
    sector: "Servicios / facilities",
    siteType: "COMERCIAL",
    location: "Salta Capital",
    contactName: "Gerencia de operaciones",
    contactEmail: "cliente@empresa.demo",
    portalPassword: "cliente123",
    projectId: "proj-empresa",
    projectName: "Mantenimiento sede corporativa",
    projectAddress: "Av. del Bicentenario 200, Salta",
    tagline: "Empresa: mantenimiento, legajo de contratistas y cuenta corriente de obra.",
  },
  {
    id: "particular-mendoza",
    legalName: "Carlos Mendoza",
    shortName: "Particular",
    sector: "Vivienda",
    siteType: "RESIDENCIAL",
    location: "Salta",
    contactName: "Propietario",
    contactEmail: "cliente@particular.demo",
    portalPassword: "cliente123",
    projectId: "proj-particular",
    projectName: "Refaccion vivienda Mendoza",
    projectAddress: "Calle Belgrano 450, Salta",
    tagline: "Cliente particular: refaccion integral con presupuesto trazable.",
  },
  {
    id: "farmacia-pueblo",
    legalName: "Farmacia del Pueblo S.A.",
    shortName: "Farmacia del Pueblo",
    sector: "Farmacia / comercio",
    siteType: "COMERCIAL",
    location: "Salta",
    contactName: "Encargado de sucursal",
    contactEmail: "cliente@farmacia.demo",
    portalPassword: "cliente123",
    projectId: "proj-farmacia",
    projectName: "Instalacion electrica y climatizacion",
    projectAddress: "Av. Mitre 1200, Salta",
    tagline: "Comercio: obra en horario restringido y documentacion de personal.",
  },
  {
    id: "fundacion-edu",
    legalName: "Fundacion Educativa del Norte Argentino",
    shortName: "Fundacion Educativa NOA",
    sector: "Educacion / ONG",
    siteType: "OBRA_GENERAL",
    location: "Salta",
    contactName: "Director ejecutivo",
    contactEmail: "cliente@fundacion.demo",
    portalPassword: "cliente123",
    projectId: "proj-fundacion",
    projectName: "Acondicionamiento sede fundacion",
    projectAddress: "Pasaje Pedagogico 88, Salta",
    tagline: "Fundacion: obra social con transparencia documental para donantes.",
  },
];

const CLIENT_EMAIL_ALIASES: Record<string, string> = {
  "cliente@ejemplo.com": "cliente@eltipal.com.ar",
};

export function clientByEmail(email: string): EmprenorClientProfile | undefined {
  const resolved = CLIENT_EMAIL_ALIASES[email] ?? email;
  return EMPRENOR_CLIENTS.find((c) => c.contactEmail === resolved);
}

export function clientByProjectId(projectId: string): EmprenorClientProfile | undefined {
  return EMPRENOR_CLIENTS.find((c) => c.projectId === projectId);
}
