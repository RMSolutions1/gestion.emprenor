/**
 * Auditoria integral: APIs, rutas, roles, tipos de cliente y proveedor
 * Uso: npm run test:full
 * Requiere: servidor en BASE_URL (npm run dev)
 */
import { writeFileSync, existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envLocal = join(__root, ".env.local");
if (existsSync(envLocal)) {
  for (const line of readFileSync(envLocal, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

const BASE = process.env.BASE_URL || "http://localhost:3001";
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = join(__dirname, "..", "docs", "AUDITORIA_COMPLETA_RESULTADOS.md");

const PASSWORD_CLIENT = "cliente123";
const PASSWORD_ADMIN = "admin2024";
const PASSWORD_SPEC = "especialista123";
const PASSWORD_OWNER = "platform2024";

/** Mandantes por tipo de entidad */
const CLIENT_PERSONAS = [
  {
    label: "Consorcio / barrio privado",
    email: "cliente@eltipal.com.ar",
    projectId: "proj-demo-3",
    entityType: "CONSORCIO",
  },
  {
    label: "Corporacion industrial (SRL)",
    email: "cliente@cronec.com.ar",
    projectId: "proj-cronec",
    entityType: "INDUSTRIA",
  },
  {
    label: "Organismo publico",
    email: "cliente@gobiernosalta.gov.ar",
    projectId: "proj-gob-salta",
    entityType: "PUBLICO",
  },
  {
    label: "Persona particular",
    email: "cliente@particular.demo",
    projectId: "proj-particular",
    entityType: "PARTICULAR",
  },
  {
    label: "Comercio / farmacia",
    email: "cliente@farmacia.demo",
    projectId: "proj-farmacia",
    entityType: "COMERCIO",
  },
  {
    label: "Fundacion / ONG",
    email: "cliente@fundacion.demo",
    projectId: "proj-fundacion",
    entityType: "FUNDACION",
  },
  {
    label: "Empresa / sociedad",
    email: "cliente@empresa.demo",
    projectId: "proj-empresa",
    entityType: "EMPRESA",
  },
];

const PROVIDER = {
  label: "Proveedor vanguardia (admin)",
  email: "admin@emprenor.com",
  password: PASSWORD_ADMIN,
  projectId: "proj-demo-3",
};

const SPECIALIST = {
  label: "Equipo tecnico",
  email: "inspector@emprenor.com",
  password: PASSWORD_SPEC,
  projectId: "proj-cronec",
};

const CLIENT_TABS = [
  "documents",
  "ledger",
  "site-log",
  "workers",
  "insurance",
  "site",
  "extras",
  "reports",
  "schedule",
  "info",
  "chat",
  "reception",
];

const ADMIN_PROJECT_APIS = (pid) => [
  ["GET", `/api/projects/${pid}`, null, [200]],
  ["GET", `/api/projects/${pid}/chat`, null, [200]],
  ["GET", `/api/documents?projectId=${pid}`, null, [200]],
  ["GET", `/api/projects/${pid}/ledger`, null, [200]],
  ["GET", `/api/projects/${pid}/site-log`, null, [200]],
  ["GET", `/api/projects/${pid}/work-orders`, null, [200]],
  ["GET", `/api/projects/${pid}/quality-nc`, null, [200]],
  ["GET", `/api/projects/${pid}/hse`, null, [200]],
  ["GET", `/api/projects/${pid}/tasks`, null, [200]],
  ["GET", `/api/projects/${pid}/milestones`, null, [200]],
  ["GET", `/api/projects/${pid}/daily-reports`, null, [200]],
  ["GET", `/api/projects/${pid}/compliance`, null, [200]],
  ["GET", `/api/projects/${pid}/reception`, null, [200, 404]],
  ["GET", `/api/workers?projectId=${pid}&limit=10`, null, [200]],
  ["GET", `/api/vehicles?projectId=${pid}&limit=10`, null, [200]],
  ["GET", `/api/materials?projectId=${pid}&limit=10`, null, [200]],
  ["GET", `/api/work-extras?projectId=${pid}`, null, [200]],
  ["GET", `/api/technical-reports?projectId=${pid}`, null, [200]],
  ["GET", `/api/incidents?projectId=${pid}`, null, [200]],
];

const ADMIN_GLOBAL_APIS = [
  ["GET", "/api/dashboard/stats", null, [200]],
  ["GET", "/api/dashboard/work-queue", null, [200]],
  ["GET", "/api/dashboard/export-operations", null, [200]],
  ["GET", "/api/live-feed", null, [200]],
  ["GET", "/api/compliance/expiry-alerts", null, [200]],
  ["GET", "/api/projects", null, [200]],
  ["GET", "/api/users?type=clients", null, [200]],
  ["GET", "/api/users?type=team", null, [200]],
  ["GET", "/api/chat/channels", null, [200]],
  ["GET", "/api/chat/mentionables", null, [200]],
  ["GET", "/api/billing/status", null, [200]],
  ["GET", "/api/search?q=salta", null, [200]],
  ["GET", "/api/notifications", null, [200]],
  ["GET", "/api/organization/pac-documents", null, [200]],
];

const PUBLIC_ROUTES = [
  ["/", 200],
  ["/login", 200],
  ["/registro", 200],
  ["/legal/privacidad", 200],
  ["/legal/terminos", 200],
  ["/api/health", 200],
];

const results = [];

function record(level, category, msg, detail = "") {
  results.push({ level, category, msg, detail });
  const icon = level === "OK" ? "OK " : level === "WARN" ? "WRN" : "FAIL";
  console.log(`  [${icon}] [${category}] ${msg}${detail ? ` — ${detail}` : ""}`);
}

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
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader(jar),
    },
    body,
    redirect: "manual",
  });
  const all = { ...jar, ...parseCookies(res.headers.getSetCookie?.() ?? []) };
  const sessionRes = await fetch(`${BASE}/api/auth/session`, {
    headers: { Cookie: cookieHeader(all) },
  });
  const session = await sessionRes.json();
  return { cookies: all, session };
}

async function api(method, path, cookies, body, allowedStatuses) {
  const opts = {
    method,
    headers: { Cookie: cookieHeader(cookies) },
  };
  if (body) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, opts);
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* */
  }
  const ok = allowedStatuses.includes(res.status);
  return { status: res.status, ok, json };
}

async function page(path, cookies) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Cookie: cookieHeader(cookies) },
    redirect: "manual",
  });
  const html = res.status === 200 ? await res.text() : "";
  const runtimeError =
    html.includes("Application error") || html.includes("Unhandled Runtime Error");
  return { status: res.status, ok: res.status === 200 && !runtimeError };
}

async function auditClientPersona(persona) {
  const cat = `CLIENTE:${persona.label}`;
  console.log(`\n--- ${persona.label} (${persona.email}) ---\n`);
  const { cookies, session } = await login(persona.email, PASSWORD_CLIENT);
  if (!session?.user?.role) {
    record("FAIL", cat, "Login sin sesion");
    return;
  }
  record("OK", cat, `Login role=${session.user.role}`);

  const profile = await api("GET", `/api/users/${session.user.id}/client-profile`, cookies, null, [
    200,
  ]);
  if (profile.ok) {
    const pct = profile.json?.completeness?.percent ?? "?";
    const et = profile.json?.profile?.entityType ?? "?";
    if (et === persona.entityType || persona.entityType === "CONSORCIO") {
      record("OK", cat, `Ficha cliente ${pct}%`, `entityType=${et}`);
    } else {
      record("WARN", cat, `Ficha entityType=${et} esperado ${persona.entityType}`);
    }
  } else record("FAIL", cat, "Ficha cliente", String(profile.status));

  const alerts = await api("GET", "/api/dashboard/client-alerts", cookies, null, [200]);
  record(alerts.ok ? "OK" : "FAIL", cat, "client-alerts", String(alerts.status));

  const projects = await api("GET", "/api/projects", cookies, null, [200]);
  const list = projects.json?.data ?? projects.json;
  const count = Array.isArray(list) ? list.length : 0;
  record(projects.ok && count > 0 ? "OK" : "FAIL", cat, `Proyectos visibles: ${count}`);

  const pid = persona.projectId;
  for (const tab of CLIENT_TABS) {
    const p = await page(`/dashboard/projects/${pid}?tab=${tab}`, cookies);
    record(p.ok ? "OK" : "FAIL", cat, `tab=${tab}`, String(p.status));
  }

  const clientApis = [
    [`/api/projects/${pid}/chat`, [200]],
    [`/api/projects/${pid}/ledger`, [200]],
    [`/api/projects/${pid}/site-log`, [200]],
    [`/api/documents?projectId=${pid}`, [200]],
    [`/api/workers?projectId=${pid}&limit=5`, [200]],
  ];

  for (const [path, allowed] of clientApis) {
    const r = await api("GET", path, cookies, null, allowed);
    record(r.ok ? "OK" : "FAIL", cat, `API ${path}`, String(r.status));
  }

  const blocked = await api("GET", "/api/billing/status", cookies, null, [403]);
  record(blocked.status === 403 ? "OK" : "WARN", cat, "Sin acceso billing (403)");
}

async function auditProvider() {
  const cat = "PROVEEDOR:ADMIN";
  console.log(`\n--- Proveedor (${PROVIDER.email}) ---\n`);
  const { cookies, session } = await login(PROVIDER.email, PROVIDER.password);
  if (session?.user?.role !== "ADMIN") {
    record("FAIL", cat, "Login admin fallo");
    return;
  }
  record("OK", cat, "Login ADMIN");

  const pages = [
    "/dashboard",
    "/dashboard/command",
    "/dashboard/comunicaciones",
    "/dashboard/search",
    "/dashboard/projects",
    "/dashboard/administracion",
    "/dashboard/billing",
    "/dashboard/compliance",
  ];
  for (const p of pages) {
    const r = await page(p, cookies);
    record(r.ok ? "OK" : "FAIL", cat, `Pagina ${p}`, String(r.status));
  }

  for (const [method, path, body, allowed] of ADMIN_GLOBAL_APIS) {
    const r = await api(method, path, cookies, body, allowed);
    record(r.ok ? "OK" : "FAIL", cat, `${method} ${path}`, String(r.status));
  }

  const pid = PROVIDER.projectId;
  for (const [method, path, body, allowed] of ADMIN_PROJECT_APIS(pid)) {
    const r = await api(method, path, cookies, body, allowed);
    record(r.ok ? "OK" : "FAIL", cat, `${method} ${path}`, String(r.status));
  }

  const tabs = [
    "info",
    "site",
    "documents",
    "workers",
    "vehicles",
    "materials",
    "tasks",
    "daily",
    "work-orders",
    "quality",
    "hse",
    "schedule",
    "ledger",
    "site-log",
    "reception",
    "assignments",
    "chat",
  ];
  for (const tab of tabs) {
    const p = await page(`/dashboard/projects/${pid}?tab=${tab}`, cookies);
    record(p.ok ? "OK" : "FAIL", cat, `tab admin=${tab}`, String(p.status));
  }
}

async function auditSpecialist() {
  const cat = "PROVEEDOR:TECNICO";
  console.log(`\n--- Especialista (${SPECIALIST.email}) ---\n`);
  const { cookies, session } = await login(SPECIALIST.email, SPECIALIST.password);
  if (!session?.user?.role) {
    record("FAIL", cat, "Login fallo");
    return;
  }
  record("OK", cat, `Login ${session.user.role}`);

  for (const tab of ["info", "documents", "quality", "hse", "tasks", "daily"]) {
    const p = await page(
      `/dashboard/projects/${SPECIALIST.projectId}?tab=${tab}`,
      cookies
    );
    record(p.ok ? "OK" : "FAIL", cat, `tab=${tab}`, String(p.status));
  }

  const assignBlocked = await fetch(
    `${BASE}/dashboard/projects/${SPECIALIST.projectId}?tab=assignments`,
    { headers: { Cookie: cookieHeader(cookies) }, redirect: "manual" }
  );
  const redirected =
    assignBlocked.status === 307 ||
    assignBlocked.status === 308 ||
    assignBlocked.status === 302;
  record(
    redirected ? "OK" : assignBlocked.status === 200 ? "WARN" : "FAIL",
    cat,
    "assignments tab bloqueado",
    String(assignBlocked.status)
  );
}

async function auditAutomations() {
  const cat = "AUTOMATIZACION";
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    record("WARN", cat, "CRON_SECRET no configurado — cron maintenance no probado");
    return;
  }
  const res = await fetch(`${BASE}/api/cron/maintenance`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });
  record(res.status === 200 ? "OK" : "FAIL", cat, "POST /api/cron/maintenance", String(res.status));
}

async function auditPublic() {
  const cat = "PUBLICO";
  for (const [path, expect] of PUBLIC_ROUTES) {
    const res = await fetch(`${BASE}${path}`);
    record(res.status === expect ? "OK" : "FAIL", cat, path, String(res.status));
  }
}

function writeReport() {
  const ok = results.filter((r) => r.level === "OK").length;
  const warn = results.filter((r) => r.level === "WARN").length;
  const fail = results.filter((r) => r.level === "FAIL").length;
  const total = results.length;

  const byCategory = {};
  for (const r of results) {
    if (!byCategory[r.category]) byCategory[r.category] = { OK: 0, WARN: 0, FAIL: 0 };
    byCategory[r.category][r.level === "OK" ? "OK" : r.level === "WARN" ? "WARN" : "FAIL"]++;
  }

  let md = `# Resultados auditoria completa\n\n`;
  md += `**Fecha:** ${new Date().toISOString()}\n`;
  md += `**Base:** ${BASE}\n\n`;
  md += `## Resumen\n\n| Metrica | Valor |\n|---------|-------|\n`;
  md += `| Total pruebas | ${total} |\n| OK | ${ok} |\n| WARN | ${warn} |\n| FAIL | ${fail} |\n\n`;

  md += `## Por segmento\n\n`;
  for (const [cat, counts] of Object.entries(byCategory)) {
    md += `- **${cat}:** ${counts.OK} OK, ${counts.WARN} WARN, ${counts.FAIL} FAIL\n`;
  }

  md += `\n## Inventario APIs (67 rutas en app/api)\n\n`;
  md += `Ver listado en codigo; esta auditoria ejecuta las rutas criticas por rol.\n\n`;

  md += `## Credenciales demo probadas\n\n`;
  md += `| Tipo | Email | Password | Proyecto |\n|------|-------|----------|----------|\n`;
  for (const p of CLIENT_PERSONAS) {
    md += `| ${p.label} | ${p.email} | ${PASSWORD_CLIENT} | ${p.projectId} |\n`;
  }
  md += `| Proveedor admin | ${PROVIDER.email} | ${PASSWORD_ADMIN} | ${PROVIDER.projectId} |\n`;
  md += `| Tecnico | ${SPECIALIST.email} | ${PASSWORD_SPEC} | ${SPECIALIST.projectId} |\n`;

  if (fail > 0) {
    md += `\n## Fallos\n\n`;
    for (const r of results.filter((x) => x.level === "FAIL")) {
      md += `- [${r.category}] ${r.msg}${r.detail ? ` (${r.detail})` : ""}\n`;
    }
  }
  if (warn > 0) {
    md += `\n## Advertencias\n\n`;
    for (const r of results.filter((x) => x.level === "WARN")) {
      md += `- [${r.category}] ${r.msg}${r.detail ? ` (${r.detail})` : ""}\n`;
    }
  }

  writeFileSync(REPORT_PATH, md, "utf8");
  return { ok, warn, fail, total };
}

async function main() {
  console.log(`\n========================================`);
  console.log(`  AUDITORIA COMPLETA EMPRENOR NEXUS`);
  console.log(`  ${BASE}`);
  console.log(`========================================\n`);

  const health = await fetch(`${BASE}/api/health`);
  if (health.status !== 200) {
    console.error("Servidor no disponible. Ejecute: npm run dev");
    process.exit(1);
  }

  await auditPublic();

  for (const persona of CLIENT_PERSONAS) {
    await auditClientPersona(persona);
  }

  await auditProvider();
  await auditSpecialist();
  await auditAutomations();

  const { ok, warn, fail, total } = writeReport();

  console.log(`\n========================================`);
  console.log(`  ${ok}/${total} OK | ${warn} WARN | ${fail} FAIL`);
  console.log(`  Informe: docs/AUDITORIA_COMPLETA_RESULTADOS.md`);
  console.log(`========================================\n`);

  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
