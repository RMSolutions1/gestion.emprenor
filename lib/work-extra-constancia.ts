import { createHash } from "crypto";

export function generateApprovalReference(extraId: string, approvedAt: Date): string {
  const stamp = approvedAt.toISOString().slice(0, 10).replace(/-/g, "");
  const hash = createHash("sha256")
    .update(`${extraId}-${approvedAt.toISOString()}`)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();
  return `CONST-${stamp}-${hash}`;
}

export type ConstanciaInput = {
  reference: string;
  projectName: string;
  projectAddress: string;
  organizationName?: string | null;
  title: string;
  description?: string | null;
  amount: string | number;
  currency?: string;
  clientName: string;
  clientEmail: string;
  approvedAt: Date;
  clientIp?: string | null;
};

export function buildConstanciaHtml(data: ConstanciaInput): string {
  const amount = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: data.currency ?? "ARS",
  }).format(Number(data.amount));

  const fecha = data.approvedAt.toLocaleString("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  });

  const proveedor = data.organizationName ?? "Proveedor del servicio";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Constancia ${data.reference}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; max-width: 720px; margin: 40px auto; padding: 24px; color: #0f172a; line-height: 1.5; }
    h1 { font-size: 1.35rem; text-align: center; margin-bottom: 8px; }
    .ref { text-align: center; font-size: 0.85rem; color: #475569; margin-bottom: 24px; }
    .box { border: 1px solid #cbd5e1; padding: 16px; margin: 16px 0; border-radius: 4px; }
    .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    .amount { font-size: 1.5rem; font-weight: bold; color: #b45309; }
    footer { margin-top: 32px; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>Constancia de aprobacion de trabajo adicional</h1>
  <p class="ref">N° ${data.reference}</p>

  <p>En la ciudad y fecha indicadas al pie, el/la cliente <strong>${escapeHtml(data.clientName)}</strong>
  (${escapeHtml(data.clientEmail)}) <strong>APRUEBA</strong> el siguiente trabajo adicional propuesto por
  <strong>${escapeHtml(proveedor)}</strong> para la obra:</p>

  <div class="box">
    <p class="label">Obra / proyecto</p>
    <p><strong>${escapeHtml(data.projectName)}</strong><br/>${escapeHtml(data.projectAddress)}</p>
    <p class="label" style="margin-top:12px">Concepto</p>
    <p><strong>${escapeHtml(data.title)}</strong></p>
    ${data.description ? `<p>${escapeHtml(data.description)}</p>` : ""}
    <p class="label" style="margin-top:12px">Monto aprobado</p>
    <p class="amount">${amount}</p>
  </div>

  <p>La aprobacion autoriza al proveedor a <strong>ejecutar</strong> el trabajo descrito por el monto indicado.
  Si el cliente hubiera rechazado el adicional, el proveedor no debiera ejecutarlo.</p>

  <footer>
    <p><strong>Fecha y hora de aprobacion:</strong> ${fecha} (Argentina)</p>
    ${data.clientIp ? `<p><strong>Registro de conexion:</strong> ${escapeHtml(data.clientIp)}</p>` : ""}
    <p><strong>Integridad del registro:</strong> ${data.reference}</p>
    <p style="margin-top:12px">Documento generado electronicamente por Emprenor Nexus. Conserve este comprobante
    como constancia de su conformidad con el presupuesto del adicional de obra.</p>
  </footer>
  <script>window.onload = () => { if (location.search.includes('print=1')) window.print(); }</script>
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
