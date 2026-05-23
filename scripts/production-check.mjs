/**
 * Verificacion pre-despliegue
 */
const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
let ok = true;

for (const k of required) {
  if (!process.env[k]?.trim()) {
    console.log(`FAIL falta ${k}`);
    ok = false;
  } else {
    console.log(`OK  ${k}`);
  }
}

if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
  console.log("WARN NEXTAUTH_SECRET < 32 chars");
}

if (!process.env.CRON_SECRET?.trim()) {
  console.log("WARN CRON_SECRET no configurado (trials no auto-suspenden)");
}

if (!process.env.AWS_BUCKET_NAME?.trim()) {
  console.log("WARN AWS_BUCKET_NAME vacio — uploads locales limitados");
}

if (!process.env.DATABASE_URL?.includes("localhost")) {
  console.log("INFO DATABASE_URL apunta a host remoto — OK para prod");
} else {
  console.log("INFO Para auditoria local: npm run db:up && npm run db:seed");
}

console.log(ok ? "\nListo para deploy (revisar WARN)" : "\nCorrija FAIL antes de produccion");
process.exit(ok ? 0 : 1);
