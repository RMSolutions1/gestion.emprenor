/**
 * Ejecuta flujo completo POL-GAR-001 / CONF-EL-001 en demo proj-demo-3
 */
const BASE = process.env.BASE_URL || "http://localhost:3001";
const PROJECT_ID = "proj-demo-3";
const EXTRA_ID = "extra-demo-pending";

function parseCookies(headers) {
  const jar = {};
  for (const h of headers) {
    const part = h.split(";")[0];
    const eq = part.indexOf("=");
    if (eq > 0) jar[part.slice(0, eq)] = part.slice(eq + 1);
  }
  return jar;
}

function cookieHeader(jar) {
  return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; ");
}

async function login(email, password) {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  const jar = parseCookies(csrfRes.headers.getSetCookie?.() ?? []);
  const body = new URLSearchParams({
    csrfToken: csrfData.csrfToken,
    email,
    password,
    callbackUrl: `${BASE}/dashboard`,
    json: "true",
  });
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookieHeader(jar) },
    body,
    redirect: "manual",
  });
  const all = { ...jar, ...parseCookies(res.headers.getSetCookie?.() ?? []) };
  const session = await (await fetch(`${BASE}/api/auth/session`, { headers: { Cookie: cookieHeader(all) } })).json();
  if (!session?.user) throw new Error(`Login fallo: ${email}`);
  return { cookies: all, session };
}

async function jsonFetch(path, cookies, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader(cookies),
      ...(opts.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

async function main() {
  console.log(`\n=== Flujo recepción + garantía 120 días ===\n${BASE} / ${PROJECT_ID}\n`);

  const admin = await login("admin@emprenor.com", "admin2024");
  console.log("OK Admin login →", admin.session.user.role);

  let { res, data } = await jsonFetch(`/api/projects/${PROJECT_ID}/reception`, admin.cookies);
  console.log(`Recepción estado: ${data.status} | lista: ${!!data.receptionReadyAt} | recibida: ${!!data.receptionAt}`);

  if (!data.receptionReadyAt && !data.receptionAt) {
    ({ res, data } = await jsonFetch(`/api/projects/${PROJECT_ID}/reception`, admin.cookies, {
      method: "PUT",
      body: JSON.stringify({ receptionReady: true }),
    }));
    if (!res.ok) throw new Error(`Habilitar recepción: ${data.error}`);
    console.log("OK Admin habilitó recepción →", data.status);
  } else if (data.receptionAt) {
    console.log("INFO Obra ya recibida:", data.receptionReference, "hasta", data.warrantyEndAt);
    const cert = await fetch(`${BASE}/api/projects/${PROJECT_ID}/reception/certificado`, {
      headers: { Cookie: cookieHeader(admin.cookies) },
    });
    console.log("OK Certificado HTTP", cert.status, cert.headers.get("content-type"));
    return;
  } else {
    console.log("OK Recepción ya estaba habilitada");
  }

  const cliente = await login("cliente@ejemplo.com", "cliente123");
  console.log("OK Cliente login →", cliente.session.user.role);

  ({ res, data } = await jsonFetch(`/api/projects/${PROJECT_ID}/reception`, cliente.cookies));
  if (data.pendingExtras?.length) {
    console.log(`Paso: aprobar adicional "${data.pendingExtras[0].title}"...`);
    ({ res, data } = await jsonFetch(`/api/work-extras/${EXTRA_ID}`, cliente.cookies, {
      method: "PUT",
      body: JSON.stringify({ status: "APROBADO", acceptanceConfirmed: true }),
    }));
    if (!res.ok) throw new Error(`Aprobar adicional: ${data.error}`);
    console.log("OK Adicional aprobado →", data.approvalReference);
  }

  ({ res, data } = await jsonFetch(`/api/projects/${PROJECT_ID}/reception`, cliente.cookies));
  console.log(`Antes recepción: ${data.status} | pendientes: ${data.pendingExtras?.length ?? 0}`);

  ({ res, data } = await jsonFetch(`/api/projects/${PROJECT_ID}/reception`, cliente.cookies, {
    method: "PUT",
    body: JSON.stringify({
      confirmReception: true,
      acceptanceConfirmed: true,
      receptionNotes: "Recepción conforme ejecutada desde script de verificación Emprenor Nexus.",
    }),
  }));
  if (!res.ok) throw new Error(`Confirmar recepción: ${data.error}`);
  console.log("OK Recepción confirmada");
  console.log("   Referencia:", data.receptionReference);
  console.log("   Garantía:", data.warrantyDays, "días hasta", data.warrantyEndAt);
  console.log("   Días restantes:", data.daysRemaining);

  const certRes = await fetch(`${BASE}/api/projects/${PROJECT_ID}/reception/certificado`, {
    headers: { Cookie: cookieHeader(cliente.cookies) },
  });
  const html = await certRes.text();
  const okCert =
    certRes.status === 200 &&
    html.includes("POL-GAR-001") &&
    html.includes(data.receptionReference);
  console.log(okCert ? "OK Certificado CONF-EL generado (HTML)" : `FAIL Certificado ${certRes.status}`);

  const page = await fetch(`${BASE}/dashboard/projects/${PROJECT_ID}?tab=reception`, {
    headers: { Cookie: cookieHeader(cliente.cookies) },
  });
  console.log(page.status === 200 ? "OK Página recepción carga 200" : `WARN Página ${page.status}`);

  console.log("\n=== Flujo completado ===\n");
}

main().catch((e) => {
  console.error("FAIL", e.message);
  process.exit(1);
});
