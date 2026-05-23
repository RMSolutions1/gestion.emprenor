/**
 * Auditoria de veracidad — resumen ejecutivo en consola
 * Uso: node scripts/veracity-audit.mjs
 */
import { spawn } from "child_process";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const CLAIMS = [
  { claim: "Portal cliente por obra", expect: "smoke CLIENTE + tabs", status: "?" },
  { claim: "Chat consultas trazable", expect: "smoke chat POST", status: "?" },
  { claim: "Legajo personal ART/seguros", expect: "schema Worker + compliance", status: "ok" },
  { claim: "Cuenta corriente / presupuesto", expect: "ledger API", status: "?" },
  { claim: "OCR documentos", expect: "lib/document-ocr dev", status: "partial" },
  { claim: "Multi-tenant", expect: "Organization + orgFilter", status: "ok" },
  { claim: "White-label UI", expect: "TenantBranding schema only", status: "partial" },
  { claim: "Stripe cobro real", expect: "STRIPE_SECRET en env", status: "?" },
  { claim: "API publica v1", expect: "no /api/v1", status: "roadmap" },
  { claim: "Gantt MS Project", expect: "barra temporal simple", status: "partial" },
];

function run(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: root, shell: true, stdio: "pipe" });
    let out = "";
    child.stdout?.on("data", (d) => (out += d));
    child.stderr?.on("data", (d) => (out += d));
    child.on("close", (code) => resolve({ code, out }));
  });
}

async function main() {
  console.log("\n=== Auditoria de veracidad Emprenor Nexus ===\n");

  const envLocal = join(root, ".env.local");
  try {
    const env = readFileSync(envLocal, "utf8");
    const stripe = /STRIPE_SECRET_KEY=\s*\S+/.test(env) && !env.includes("STRIPE_SECRET_KEY=sk_test_xxx");
    CLAIMS.find((c) => c.claim.includes("Stripe")).status = stripe ? "ok" : "partial";
  } catch {
    CLAIMS.find((c) => c.claim.includes("Stripe")).status = "partial";
  }

  try {
    readFileSync(join(root, "lib/document-ocr.ts"), "utf8");
    if (readFileSync(join(root, "lib/document-ocr.ts"), "utf8").includes("modo desarrollo")) {
      CLAIMS.find((c) => c.claim.includes("OCR")).status = "partial";
    }
  } catch {
    /* */
  }

  console.log("Matriz promesa vs realidad:\n");
  for (const c of CLAIMS) {
    const icon =
      c.status === "ok"
        ? "OK "
        : c.status === "partial"
          ? "~~"
          : c.status === "roadmap"
            ? ">>"
            : "??";
    console.log(`  [${icon}] ${c.claim}`);
    console.log(`       ${c.expect}\n`);
  }

  console.log("Ejecutando smoke-test.mjs ...\n");
  const smoke = await run("node", ["scripts/smoke-test.mjs"]);
  const smokeOk = smoke.out.match(/(\d+)\/(\d+) pruebas OK/);
  if (smokeOk) {
    console.log(smoke.out.trim().split("\n").slice(-3).join("\n"));
    if (smoke.code !== 0) {
      console.log("\nAccion: corregir FAIL antes de publicitar 100%.\n");
    }
  } else {
    console.log(smoke.out.slice(-500));
  }

  console.log("\nDocumento completo: docs/AUDITORIA_VERACIDAD.md\n");
  process.exit(smoke.code ?? 0);
}

main();
