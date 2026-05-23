/**
 * Validacion de variables de entorno para produccion.
 */
const REQUIRED_PROD = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"] as const;

export function validateEnv() {
  const missing = REQUIRED_PROD.filter((k) => !process.env[k]?.trim());
  if (process.env.NODE_ENV === "production" && missing.length > 0) {
    throw new Error(`Variables requeridas faltantes: ${missing.join(", ")}`);
  }
  if (process.env.NODE_ENV === "production" && process.env.NEXTAUTH_SECRET!.length < 32) {
    console.warn("[env] NEXTAUTH_SECRET deberia tener al menos 32 caracteres en produccion");
  }
  return { ok: missing.length === 0, missing };
}

export function getAppUrl() {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "http://localhost:3001";
}
