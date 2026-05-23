import { createHash } from "crypto";
import { MIN_WARRANTY_DAYS } from "@/lib/warranty";

export function generateReceptionReference(projectId: string, receptionAt: Date): string {
  const stamp = receptionAt.toISOString().slice(0, 10).replace(/-/g, "");
  const hash = createHash("sha256")
    .update(`CONF-${projectId}-${receptionAt.toISOString()}`)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();
  return `CONF-EL-${stamp}-${hash}`;
}

export type ReceptionCertInput = {
  reference: string;
  projectName: string;
  projectAddress: string;
  projectType: string;
  organizationName?: string | null;
  clientName: string;
  clientEmail: string;
  receptionAt: Date;
  warrantyDays: number;
  warrantyEndAt: Date;
  clientIp?: string | null;
  notes?: string | null;
};

export function buildReceptionCertHtml(data: ReceptionCertInput): string {
  const fecha = data.receptionAt.toLocaleString("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  });
  const fin = data.warrantyEndAt.toLocaleDateString("es-AR", {
    dateStyle: "long",
    timeZone: "America/Argentina/Buenos_Aires",
  });
  const proveedor = data.organizationName ?? "Grupo Emprenor";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${data.reference} — Recepción y garantía</title>
  <style>
    body { font-family: Georgia, serif; max-width: 720px; margin: 40px auto; padding: 24px; color: #0f172a; line-height: 1.5; }
    h1 { font-size: 1.25rem; text-align: center; }
    .ref { text-align: center; color: #475569; font-size: 0.85rem; margin-bottom: 24px; }
    .box { border: 1px solid #cbd5e1; padding: 16px; margin: 16px 0; border-radius: 4px; }
    .highlight { background: #ecfdf5; border-color: #6ee7b7; }
    footer { margin-top: 28px; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>Certificado de conformidad final y acta de recepción</h1>
  <p class="ref">Documento ${data.reference} · POL-GAR-001 · PAC-EL-003 §13 (CONF-EL-001)</p>

  <p>El/la cliente <strong>${escapeHtml(data.clientName)}</strong> (${escapeHtml(data.clientEmail)})
  declara haber <strong>recibido conforme</strong> los trabajos y servicios ejecutados por
  <strong>${escapeHtml(proveedor)}</strong> en el siguiente inmueble/obra:</p>

  <div class="box">
    <p><strong>${escapeHtml(data.projectName)}</strong><br/>${escapeHtml(data.projectAddress)}<br/>
    Tipo: ${escapeHtml(data.projectType)}</p>
  </div>

  <div class="box highlight">
    <p><strong>Garantía de servicio (POL-GAR-001):</strong> ${data.warrantyDays} días corridos
    como mínimo, contados desde la fecha y hora de esta recepción.</p>
    <p><strong>Inicio de garantía:</strong> ${fecha}</p>
    <p><strong>Vencimiento de garantía:</strong> ${fin}</p>
  </div>

  ${data.notes ? `<p><strong>Observaciones:</strong> ${escapeHtml(data.notes)}</p>` : ""}

  <p>La recepción no reemplaza las obligaciones de mantenimiento del cliente ni exclusiones por
  uso indebido, fuerza mayor o terceros no autorizados, conforme política interna y marco QA/QC vigente.</p>

  <footer>
    <p><strong>Fecha y hora de recepción:</strong> ${fecha} (Argentina)</p>
    ${data.clientIp ? `<p><strong>Registro de conexión:</strong> ${escapeHtml(data.clientIp)}</p>` : ""}
    <p><strong>Integridad:</strong> ${data.reference}</p>
    <p>Generado por Emprenor Nexus. Conserve este documento junto con planos y legajo de obra.</p>
  </footer>
  <script>if (location.search.includes('print=1')) window.print();</script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export { MIN_WARRANTY_DAYS };
