import type { Document, DocumentCategory } from "@prisma/client";

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  PLANOS: "Planos de obra",
  FACTURAS: "Factura",
  REMITOS: "Remito",
  ORDENES_TRABAJO: "Orden de trabajo",
  PROCEDIMIENTOS: "Procedimiento",
  ART: "ART",
  SEGUROS: "Seguro",
  LEGAJO_PERSONAL: "Legajo personal",
  VEHICULO: "Documentacion vehicular",
  ADICIONAL_OBRA: "Adicional de obra",
  ANTECEDENTES: "Antecedentes",
  LISTA_MATERIALES: "Lista de materiales",
  INFORME_TECNICO: "Informe tecnico",
  CONFORMIDAD: "Conformidad",
  OTROS: "Documento general",
};

/** Extraccion estructurada local (sin Textract). En produccion conectar AWS Textract o similar. */
export function extractDocumentMetadata(doc: Pick<Document, "fileName" | "category" | "version">) {
  const ext = doc.fileName.includes(".") ? doc.fileName.split(".").pop()?.toUpperCase() : "BIN";
  const categoryLabel = CATEGORY_LABELS[doc.category] ?? doc.category;

  const lines = [
    `[OCR Emprenor Nexus — modo desarrollo]`,
    `Archivo: ${doc.fileName}`,
    `Tipo: ${categoryLabel}`,
    `Extension: ${ext ?? "N/A"}`,
    `Version documental: v${doc.version}`,
    `Fecha procesamiento: ${new Date().toISOString()}`,
    ``,
    `Palabras clave detectadas: ${categoryLabel}, ${ext}, version-${doc.version}`,
    `Nota: Configure AWS Textract o DOCUMENT_AI_ENDPOINT para OCR completo en PDF/imagenes.`,
  ];

  return lines.join("\n");
}
