/**
 * Definicion de producto: canal exclusivo entre quien contrata (cliente)
 * y quien ejecuta el trabajo (proveedor). Sin marketplace ni red social.
 */

export const PLATFORM_MISSION = {
  headline: "Comunicacion y documentacion entre su cliente y su empresa",
  subhead:
    "Un solo lugar para compartir la obra en curso, el legajo del personal y responder consultas con trazabilidad.",
  essence:
    "La plataforma existe unicamente para vincular a un cliente con su proveedor de servicios en un proyecto concreto.",
} as const;

export const PROVIDER_EXAMPLES = [
  "Instalacion electrica",
  "Obra y construccion",
  "Refacciones y mantenimiento",
  "Montaje industrial",
  "Gas y climatizacion",
  "Limpieza y facilities",
] as const;

export const CLIENT_EXAMPLES = [
  "Persona particular",
  "Sociedad o empresa",
  "Comercio (farmacia, local)",
  "Industria y planta",
  "Consorcio y barrio privado",
  "Organismo publico",
] as const;

export const DOCUMENTATION_SCOPE = [
  {
    title: "Documentacion del proyecto",
    desc: "Planos, presupuestos, remitos, facturas, informes, conformidades y todo el legajo de la obra que el proveedor comparte con el cliente.",
  },
  {
    title: "Documentacion del personal",
    desc: "ART, seguros, antecedentes, habilitaciones y certificados de quienes ingresan al sitio — visible para el cliente cuando corresponde.",
  },
] as const;

export const CONSULTATION_HINTS = [
  "Consulta sobre el avance de la obra",
  "Solicito justificacion del siguiente punto: ",
  "Necesito aclaracion sobre un documento del proyecto",
  "Consulta sobre un concepto del presupuesto o cuenta corriente",
  "Solicito detalle del personal asignado a la obra",
] as const;

export const CLIENT_PORTAL_INTRO =
  "Usted contrata un servicio; su proveedor publica documentacion y responde por este canal. Sin grupos de WhatsApp ni correos perdidos.";

export const PROVIDER_PORTAL_INTRO =
  "Publique documentacion de la obra y del personal; el cliente consulta y aprueba desde su portal con registro de cada mensaje.";
