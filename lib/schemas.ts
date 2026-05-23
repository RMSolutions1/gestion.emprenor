import { z } from "zod";

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  address: z.string().min(5, "La dirección es requerida"),
  projectType: z.string().min(2, "El tipo de proyecto es requerido"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["PLANIFICACION", "EN_CURSO", "PAUSADO", "FINALIZADO"]).default("PLANIFICACION"),
  siteType: z
    .enum([
      "OBRA_GENERAL",
      "BARRIO_PRIVADO",
      "INDUSTRIA",
      "COMERCIAL",
      "RESIDENCIAL",
      "OIL_GAS",
      "MINERIA",
      "ENERGIA",
      "AGRO",
      "INFRAESTRUCTURA",
      "SERVICIOS_PUBLICOS",
    ])
    .default("OBRA_GENERAL"),
  siteRequirementsNotes: z.string().optional(),
  budgetAmount: z.coerce.number().nonnegative().optional(),
  budgetCurrency: z.string().optional(),
  liabilityInsurancePolicy: z.string().optional(),
  liabilityInsuranceInsurer: z.string().optional(),
  liabilityInsuranceExpiry: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

// User schemas
export const clientEntityTypeEnum = z.enum([
  "PARTICULAR",
  "EMPRESA",
  "COMERCIO",
  "INDUSTRIA",
  "PUBLICO",
  "CONSORCIO",
  "FUNDACION",
]);

export const upsertClientProfileSchema = z.object({
  entityType: clientEntityTypeEnum.optional(),
  legalName: z.string().max(200).optional().nullable(),
  taxId: z.string().max(20).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  mobilePhone: z.string().max(40).optional().nullable(),
  contactRole: z.string().max(120).optional().nullable(),
  billingAddress: z.string().max(300).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().max(2).optional(),
  sector: z.string().max(120).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(2, "El nombre es requerido"),
  role: z
    .enum([
      "ADMIN",
      "CLIENTE",
      "INGENIERO_CIVIL",
      "ARQUITECTO",
      "INGENIERO_ELECTRICO",
      "INSPECTOR_CALIDAD",
      "INSPECTOR_OBRA",
    ])
    .default("CLIENTE"),
});

// Document schemas
const documentCategoryEnum = z.enum([
  "PLANOS",
  "FACTURAS",
  "REMITOS",
  "ORDENES_TRABAJO",
  "PROCEDIMIENTOS",
  "ART",
  "SEGUROS",
  "LEGAJO_PERSONAL",
  "VEHICULO",
  "ADICIONAL_OBRA",
  "ANTECEDENTES",
  "LISTA_MATERIALES",
  "INFORME_TECNICO",
  "CONFORMIDAD",
  "OTROS",
]);

export const createDocumentSchema = z.object({
  fileName: z.string().min(1, "El nombre del archivo es requerido"),
  category: documentCategoryEnum,
  projectId: z.string().cuid("ID de proyecto inválido"),
  cloudStoragePath: z.string(),
  isPublic: z.boolean().default(false),
  workerId: z.string().cuid().optional(),
  vehicleId: z.string().cuid().optional(),
  workExtraId: z.string().cuid().optional(),
});

// Incident schemas
export const createIncidentSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  status: z.enum(["PENDIENTE", "EN_PROCESO", "RESUELTA"]).default("PENDIENTE"),
  projectId: z.string().cuid("ID de proyecto inválido"),
});

export const updateIncidentSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").optional(),
  description: z.string().optional(),
  status: z.enum(["PENDIENTE", "EN_PROCESO", "RESUELTA"]).optional(),
});

const workerComplianceFields = {
  cuil: z.string().optional(),
  cuit: z.string().optional(),
  artNumber: z.string().optional(),
  artExpiry: z.string().optional(),
  lifeInsuranceExpiry: z.string().optional(),
  eppComplete: z.boolean().optional(),
  backgroundCheckStatus: z
    .enum(["NO_APLICA", "PENDIENTE", "APROBADO", "RECHAZADO"])
    .optional(),
  backgroundCheckDate: z.string().optional(),
  backgroundCheckNotes: z.string().optional(),
  habilitationNotes: z.string().optional(),
  complianceNotes: z.string().optional(),
};

// Worker schemas
export const createWorkerSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  workerRole: z.string().min(2, "El puesto es requerido").optional(),
  certifications: z.string().optional(),
  dni: z.string().min(7, "DNI inválido"),
  projectId: z.string().cuid("ID de proyecto inválido"),
  ...workerComplianceFields,
});

export const updateWorkerSchema = z.object({
  name: z.string().min(2, "El nombre es requerido").optional(),
  workerRole: z.string().min(2, "El puesto es requerido").optional(),
  certifications: z.string().optional(),
  dni: z.string().min(7, "DNI inválido").optional(),
  ...workerComplianceFields,
});

export const createVehicleSchema = z.object({
  label: z.string().min(2, "Identificacion del vehiculo requerida"),
  plate: z.string().optional(),
  driverName: z.string().optional(),
  driverLicense: z.string().optional(),
  driverLicenseExpiry: z.string().optional(),
  technicalReviewExpiry: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  artExpiry: z.string().optional(),
  notes: z.string().optional(),
  projectId: z.string().cuid("ID de proyecto inválido"),
});

export const updateVehicleSchema = createVehicleSchema.omit({ projectId: true }).partial();

export const createWorkExtraSchema = z.object({
  title: z.string().min(3, "Titulo requerido"),
  description: z.string().optional(),
  amount: z.coerce.number().positive("Monto debe ser mayor a 0"),
  status: z
    .enum([
      "BORRADOR",
      "PENDIENTE_CLIENTE",
      "APROBADO",
      "RECHAZADO",
      "EN_EJECUCION",
      "COMPLETADO",
    ])
    .default("PENDIENTE_CLIENTE"),
  projectId: z.string().cuid("ID de proyecto inválido"),
});

export const updateWorkExtraSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  amount: z.coerce.number().positive().optional(),
  status: z
    .enum([
      "BORRADOR",
      "PENDIENTE_CLIENTE",
      "APROBADO",
      "RECHAZADO",
      "EN_EJECUCION",
      "COMPLETADO",
    ])
    .optional(),
  acceptanceConfirmed: z.boolean().optional(),
});

// Assignment schemas
export const createAssignmentSchema = z.object({
  userId: z.string().cuid("ID de usuario inválido"),
  projectId: z.string().cuid("ID de proyecto inválido"),
});

export const createMaterialSchema = z.object({
  itemName: z.string().min(2, "Nombre requerido"),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  category: z.enum(["HERRAMIENTA", "MATERIAL", "EPP", "EQUIPO", "OTRO"]).default("MATERIAL"),
  supplier: z.string().optional(),
  brand: z.string().optional(),
  unitPrice: z.coerce.number().nonnegative().optional(),
  deliveryStatus: z.enum(["PENDIENTE", "PARCIAL", "ENTREGADO"]).optional(),
  receivedQuantity: z.string().optional(),
  notes: z.string().optional(),
  workerId: z.string().cuid().optional(),
  projectId: z.string().cuid("ID de proyecto inválido"),
});

export const updateMaterialSchema = createMaterialSchema.omit({ projectId: true }).partial();

export const createLedgerEntrySchema = z.object({
  projectId: z.string().cuid(),
  type: z.enum(["FACTURA", "PAGO", "AJUSTE", "NOTA_CREDITO", "ADICIONAL"]),
  amount: z.coerce.number().positive(),
  currency: z.string().default("ARS"),
  description: z.string().min(2),
  reference: z.string().optional(),
});

export const createSiteLogSchema = z.object({
  projectId: z.string().cuid(),
  phase: z.enum(["ANTES", "DURANTE", "DESPUES"]),
  title: z.string().min(2),
  notes: z.string().optional(),
  fileName: z.string().optional(),
  cloudStoragePath: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const createPacDocumentSchema = z.object({
  code: z.string().min(2),
  title: z.string().min(2),
  revision: z.string().optional(),
  fileName: z.string().min(1),
  cloudStoragePath: z.string().min(1),
});

export const createTechnicalReportSchema = z.object({
  title: z.string().min(3, "Titulo requerido"),
  description: z.string().optional(),
  reportType: z.enum([
    "INFORME",
    "CONFORMIDAD",
    "NO_CONFORMIDAD",
    "SOLICITUD_CORRECCION",
    "ACTA_INSPECCION",
  ]),
  status: z
    .enum(["BORRADOR", "PENDIENTE_CLIENTE", "APROBADO", "RECHAZADO", "EN_CORRECCION"])
    .optional(),
  requiresClientApproval: z.boolean().optional(),
  projectId: z.string().cuid("ID de proyecto inválido"),
});

export const updateTechnicalReportSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  reportType: z
    .enum([
      "INFORME",
      "CONFORMIDAD",
      "NO_CONFORMIDAD",
      "SOLICITUD_CORRECCION",
      "ACTA_INSPECCION",
    ])
    .optional(),
  status: z
    .enum(["BORRADOR", "PENDIENTE_CLIENTE", "APROBADO", "RECHAZADO", "EN_CORRECCION"])
    .optional(),
  requiresClientApproval: z.boolean().optional(),
});

// Login schemas
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

// Signup schemas
export const signupSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(2, "El nombre es requerido"),
});
