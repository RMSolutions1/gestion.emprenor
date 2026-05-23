/**
 * Smoke tests E2E via HTTP (sin navegador)
 * Uso: node scripts/smoke-test.mjs
 */
const BASE = process.env.BASE_URL || "http://localhost:3001";

const accounts = [
  { name: "PLATFORM_OWNER", email: "owner@emprenor.com", password: "platform2024", expectPath: "/platform" },
  { name: "ADMIN", email: "admin@emprenor.com", password: "admin2024", expectPath: "/dashboard" },
  { name: "CLIENTE", email: "cliente@ejemplo.com", password: "cliente123", expectPath: "/dashboard" },
];

function parseCookies(setCookieHeaders) {
  const jar = {};
  for (const h of setCookieHeaders) {
    const part = h.split(";")[0];
    const eq = part.indexOf("=");
    if (eq > 0) jar[part.slice(0, eq)] = part.slice(eq + 1);
  }
  return jar;
}

function cookieHeader(jar) {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function getCsrf() {
  const res = await fetch(`${BASE}/api/auth/csrf`);
  const data = await res.json();
  const cookies = parseCookies(res.headers.getSetCookie?.() ?? []);
  return { csrf: data.csrfToken, cookies };
}

async function login(email, password) {
  const { csrf, cookies: csrfCookies } = await getCsrf();
  const body = new URLSearchParams({
    csrfToken: csrf,
    email,
    password,
    callbackUrl: `${BASE}/dashboard`,
    json: "true",
  });
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader(csrfCookies),
    },
    body,
    redirect: "manual",
  });
  const allCookies = { ...csrfCookies, ...parseCookies(res.headers.getSetCookie?.() ?? []) };
  const sessionRes = await fetch(`${BASE}/api/auth/session`, {
    headers: { Cookie: cookieHeader(allCookies) },
  });
  const session = await sessionRes.json();
  return { cookies: allCookies, session };
}

async function apiGet(path, cookies) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Cookie: cookieHeader(cookies) },
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* */
  }
  return { status: res.status, json };
}

const results = [];

function pass(msg) {
  results.push({ ok: true, msg });
  console.log(`  OK  ${msg}`);
}
function fail(msg) {
  results.push({ ok: false, msg });
  console.log(`  FAIL ${msg}`);
}

async function main() {
  console.log(`\nSmoke tests — ${BASE}\n`);

  const publicChecks = [
    ["/", 200],
    ["/legal/privacidad", 200],
    ["/legal/terminos", 200],
    ["/login", 200],
    ["/registro", 200],
    ["/api/health", 200],
  ];
  for (const [path, expect] of publicChecks) {
    const res = await fetch(`${BASE}${path}`);
    if (res.status === expect) pass(`${path} → ${res.status}`);
    else fail(`${path} → ${res.status} (esperado ${expect})`);
  }

  const unauthRes = await fetch(`${BASE}/api/platform/stats`, { redirect: "manual" });
  if (unauthRes.status === 401 || unauthRes.status === 403) {
    pass(`API platform sin auth → ${unauthRes.status}`);
  } else fail(`API platform sin auth → ${unauthRes.status}`);

  let ownerCookies = null;
  for (const acc of accounts) {
    const { cookies, session } = await login(acc.email, acc.password);
    const role = session?.user?.role;
    if (role) pass(`Login ${acc.name} → role=${role}`);
    else fail(`Login ${acc.name} → sin sesion`);

    if (acc.name === "PLATFORM_OWNER") {
      ownerCookies = cookies;
      const plat = await apiGet("/api/platform/stats", cookies);
      if (plat.status === 200 && plat.json?.kpis) {
        pass(`API /api/platform/stats → tenants=${plat.json.kpis.tenants}`);
      } else fail(`API platform stats → ${plat.status}`);
    }

    if (acc.name === "ADMIN") {
      const stats = await apiGet("/api/dashboard/stats", cookies);
      if (stats.status === 200 && stats.json?.kpis) pass(`API dashboard/stats admin → OK`);
      else fail(`API dashboard/stats → ${stats.status}`);

      const feed = await apiGet("/api/live-feed", cookies);
      if (feed.status === 200 && Array.isArray(feed.json)) {
        pass(`API live-feed → ${feed.json.length} eventos`);
      } else fail(`API live-feed → ${feed.status}`);

      const alerts = await apiGet("/api/compliance/expiry-alerts", cookies);
      if (alerts.status === 200) pass(`API compliance/expiry-alerts → OK`);
      else fail(`API compliance → ${alerts.status}`);

      const demoProjectId = "proj-demo-3";
      const chat = await apiGet(`/api/projects/${demoProjectId}/chat`, cookies);
      if (chat.status === 200 && Array.isArray(chat.json?.messages)) {
        pass(`API chat proyecto → ${chat.json.messages.length} mensajes`);
      } else fail(`API chat → ${chat.status} ${JSON.stringify(chat.json)?.slice(0, 120)}`);

      const wo = await apiGet(`/api/projects/${demoProjectId}/work-orders`, cookies);
      if (wo.status === 200 && Array.isArray(wo.json)) {
        pass(`API work-orders → ${wo.json.length} OT`);
      } else fail(`API work-orders → ${wo.status}`);

      const qms = await apiGet(`/api/projects/${demoProjectId}/quality-nc`, cookies);
      if (qms.status === 200 && Array.isArray(qms.json)) {
        pass(`API quality-nc → ${qms.json.length} NC`);
      } else fail(`API quality-nc → ${qms.status}`);

      const hse = await apiGet(`/api/projects/${demoProjectId}/hse`, cookies);
      if (hse.status === 200 && hse.json?.incidents) {
        pass(
          `API hse → inc=${hse.json.incidents?.length ?? 0} perm=${hse.json.permits?.length ?? 0}`
        );
      } else fail(`API hse → ${hse.status}`);

      const channels = await apiGet("/api/chat/channels", cookies);
      if (channels.status === 200 && Array.isArray(channels.json)) {
        pass(`API chat/channels → ${channels.json.length} canales`);
      } else fail(`API chat/channels → ${channels.status}`);

      const orgCh = channels.json?.find((c) => c.type === "ORGANIZATION");
      if (orgCh?.id) {
        const postRes = await fetch(`${BASE}/api/chat/channels/${orgCh.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader(cookies),
          },
          body: JSON.stringify({ body: `Smoke test ${Date.now()}` }),
        });
        if (postRes.status === 200) pass("API chat POST mensaje → OK");
        else fail(`API chat POST → ${postRes.status}`);
      }

      const comPage = await fetch(`${BASE}/dashboard/comunicaciones`, {
        headers: { Cookie: cookieHeader(cookies) },
        redirect: "manual",
      });
      if (comPage.status === 200) pass("/dashboard/comunicaciones → 200");
      else fail(`/dashboard/comunicaciones → ${comPage.status}`);

      const mentionables = await apiGet("/api/chat/mentionables", cookies);
      if (mentionables.status === 200 && Array.isArray(mentionables.json)) {
        pass(`API mentionables → ${mentionables.json.length} usuarios`);
      } else fail(`API mentionables → ${mentionables.status}`);

      const billing = await apiGet("/api/billing/status", cookies);
      if (billing.status === 200 && billing.json?.organization) {
        pass(`API billing/status → plan=${billing.json.organization.plan}`);
      } else fail(`API billing/status → ${billing.status}`);

      const search = await apiGet("/api/search?q=country", cookies);
      if (search.status === 200 && search.json?.projects) {
        pass(`API search → ${search.json.projects.length} proyectos`);
      } else fail(`API search → ${search.status}`);
    }

    if (acc.name === "CLIENTE") {
      const alerts = await apiGet("/api/dashboard/client-alerts", cookies);
      if (alerts.status === 200) pass(`API client-alerts → OK`);
      else fail(`API client-alerts → ${alerts.status} (${JSON.stringify(alerts.json)?.slice(0, 80)})`);

      const notif = await apiGet("/api/notifications", cookies);
      if (notif.status === 200) pass(`API notifications → ${notif.json?.length ?? 0} items`);
      else fail(`API notifications → ${notif.status}`);
    }
  }

  if (ownerCookies) {
    const projects = await apiGet("/api/projects", ownerCookies);
    if (projects.status === 200) pass(`API projects (owner) → ${projects.json?.length ?? "?"} obras`);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} pruebas OK\n`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
