/**
 * Auditoria completa del dashboard por rol
 * Uso: node scripts/dashboard-audit.mjs
 */
const BASE = process.env.BASE_URL || "http://localhost:3001";

const ROLES = [
  {
    name: "PLATFORM_OWNER",
    email: "owner@emprenor.com",
    password: "platform2024",
    pages: ["/platform", "/dashboard"],
    apis: ["/api/platform/stats", "/api/health"],
  },
  {
    name: "ADMIN",
    email: "admin@emprenor.com",
    password: "admin2024",
    pages: [
      "/dashboard",
      "/dashboard/command",
      "/dashboard/comunicaciones",
      "/dashboard/search",
      "/dashboard/projects",
      "/dashboard/administracion",
      "/dashboard/billing",
      "/dashboard/compliance",
    ],
    apis: [
      "/api/dashboard/stats",
      "/api/live-feed",
      "/api/compliance/expiry-alerts",
      "/api/projects",
      "/api/users?type=clients",
      "/api/users?type=team",
      "/api/chat/channels",
      "/api/billing/status",
      "/api/search?q=acacias",
      "/api/notifications",
    ],
    projectId: "proj-demo-3",
    projectTabs: [
      "info",
      "site",
      "documents",
      "materials",
      "ledger",
      "site-log",
      "chat",
      "work-orders",
      "quality",
      "hse",
      "schedule",
    ],
  },
  {
    name: "ESPECIALISTA",
    email: "inspector@emprenor.com",
    password: "especialista123",
    pages: ["/dashboard", "/dashboard/comunicaciones", "/dashboard/projects"],
    apis: ["/api/projects", "/api/live-feed"],
    projectId: "proj-demo-3",
    projectTabs: ["info", "documents", "quality", "hse"],
  },
  {
    name: "CLIENTE",
    email: "cliente@ejemplo.com",
    password: "cliente123",
    pages: ["/dashboard", "/dashboard/comunicaciones", "/dashboard/projects"],
    apis: [
      "/api/dashboard/client-alerts",
      "/api/projects",
      "/api/notifications",
    ],
    projectId: "proj-demo-3",
    projectTabs: [
      "documents",
      "workers",
      "insurance",
      "materials",
      "ledger",
      "site-log",
      "extras",
      "reception",
      "info",
      "reports",
      "chat",
    ],
    forbiddenPages: ["/dashboard/clients", "/dashboard/team", "/dashboard/billing"],
    forbiddenApis: ["/api/users?type=team", "/api/billing/status"],
  },
];

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
  const sessionRes = await fetch(`${BASE}/api/auth/session`, { headers: { Cookie: cookieHeader(all) } });
  const session = await sessionRes.json();
  return { cookies: all, session };
}

async function getPage(path, cookies, expectOk = true) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Cookie: cookieHeader(cookies) },
    redirect: "manual",
  });
  const ok = res.status === 200;
  const html = ok ? await res.text() : "";
  const hasError =
    html.includes("Application error") ||
    html.includes("Unhandled Runtime Error") ||
    html.includes('statusCode":500');
  return { path, status: res.status, ok: expectOk ? ok && !hasError : res.status === 403 || res.status === 302, hasError };
}

async function getApi(path, cookies, expectOk = true) {
  const res = await fetch(`${BASE}${path}`, { headers: { Cookie: cookieHeader(cookies) } });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* */
  }
  const ok = expectOk ? res.status >= 200 && res.status < 300 : res.status === 403;
  return { path, status: res.status, ok, json };
}

const results = [];
const log = (level, msg) => {
  results.push({ level, msg });
  const icon = level === "OK" ? "  OK " : level === "WARN" ? " WARN" : " FAIL";
  console.log(`${icon} ${msg}`);
};

async function main() {
  console.log(`\n=== Auditoria Dashboard Emprenor Nexus ===\n${BASE}\n`);

  const health = await fetch(`${BASE}/api/health`);
  if (health.status === 200) log("OK", "Servidor /api/health");
  else {
    log("FAIL", `Servidor no disponible (${health.status})`);
    process.exit(1);
  }

  for (const role of ROLES) {
    console.log(`\n--- ${role.name} (${role.email}) ---\n`);
    const { cookies, session } = await login(role.email, role.password);
    if (!session?.user?.role) {
      log("FAIL", `${role.name}: login sin sesion`);
      continue;
    }
    log("OK", `Login → role=${session.user.role}`);

    for (const path of role.pages) {
      const r = await getPage(path, cookies, true);
      if (r.ok) log("OK", `Pagina ${path} → ${r.status}`);
      else log("FAIL", `Pagina ${path} → ${r.status}${r.hasError ? " (error runtime)" : ""}`);
    }

    if (role.forbiddenPages) {
      for (const path of role.forbiddenPages) {
        const r = await getPage(path, cookies, false);
        if (r.status === 403 || r.status === 302 || r.status === 307)
          log("OK", `Bloqueo esperado ${path} → ${r.status}`);
        else log("WARN", `Cliente accedio ${path} → ${r.status} (revisar permisos UI)`);
      }
    }

    for (const path of role.apis ?? []) {
      const r = await getApi(path, cookies, true);
      if (r.ok) log("OK", `API ${path} → ${r.status}`);
      else log("FAIL", `API ${path} → ${r.status}`);
    }

    if (role.forbiddenApis) {
      for (const path of role.forbiddenApis) {
        const r = await getApi(path, cookies, false);
        if (r.status === 403) log("OK", `API bloqueada ${path} → 403`);
        else log("WARN", `API ${path} → ${r.status} (cliente no deberia acceder)`);
      }
    }

    if (role.projectId) {
      const projPage = `/dashboard/projects/${role.projectId}`;
      const pr = await getPage(projPage, cookies);
      if (pr.ok) log("OK", `Proyecto ${projPage}`);
      else log("FAIL", `Proyecto ${projPage} → ${pr.status}`);

      for (const tab of role.projectTabs ?? []) {
        const tr = await getPage(`${projPage}?tab=${tab}`, cookies);
        if (tr.ok) log("OK", `  tab=${tab}`);
        else log("FAIL", `  tab=${tab} → ${tr.status}`);
      }

      const chat = await getApi(`/api/projects/${role.projectId}/chat`, cookies);
      if (chat.ok) log("OK", `  API chat → ${chat.status}`);
      else log("FAIL", `  API chat → ${chat.status}`);
    }
  }

  const failed = results.filter((r) => r.level === "FAIL").length;
  const warns = results.filter((r) => r.level === "WARN").length;
  const oks = results.filter((r) => r.level === "OK").length;
  console.log(`\n=== Resumen: ${oks} OK | ${warns} WARN | ${failed} FAIL ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
