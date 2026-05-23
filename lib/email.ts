/**
 * Capa de email — en dev loguea; en prod configure SMTP_* o integrar Resend/SendGrid.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    // Placeholder: integrar nodemailer cuando SMTP este configurado
    console.log("[email:smtp]", params.to, params.subject);
    return { sent: true, provider: "smtp" };
  }

  if (process.env.NODE_ENV === "production") {
    console.warn("[email] Sin SMTP configurado — email no enviado:", params.subject);
  } else {
    console.log("[email:dev]", params.to, params.subject);
  }
  return { sent: false, provider: "log" };
}

export function trialExpiredEmail(orgName: string) {
  return {
    subject: `Trial finalizado — ${orgName}`,
    html: `<p>Su periodo de prueba en Emprenor Nexus finalizo. Ingrese a Facturacion para activar su plan.</p>`,
  };
}
