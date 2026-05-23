/** Convierte Decimal de Prisma y BigInt para respuestas JSON estables */
export function serializeForJson<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) => {
      if (v !== null && typeof v === "object") {
        if (typeof (v as { toNumber?: () => number }).toNumber === "function") {
          return (v as { toNumber: () => number }).toNumber();
        }
        if (typeof (v as { toString?: () => string }).toString === "function" && "d" in (v as object)) {
          return String(v);
        }
      }
      if (typeof v === "bigint") return v.toString();
      return v;
    })
  ) as T;
}
