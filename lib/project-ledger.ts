import type { LedgerEntryType, WorkExtraStatus } from "@prisma/client";

export type LedgerLineSource = "project" | "work_extra" | "manual";

export type LedgerStatementLine = {
  id: string;
  source: LedgerLineSource;
  type: LedgerEntryType | "ADICIONAL_AUTO";
  amount: number;
  currency: string;
  description: string;
  reference?: string | null;
  createdAt: string;
  debit: boolean;
};

export type LedgerSummary = {
  currency: string;
  budget: number;
  extrasApproved: number;
  charges: number;
  payments: number;
  balance: number;
};

type WorkExtraRow = {
  id: string;
  title: string;
  amount: unknown;
  status: WorkExtraStatus;
  approvalReference?: string | null;
  approvedAt?: Date | null;
};

type LedgerRow = {
  id: string;
  type: LedgerEntryType;
  amount: unknown;
  currency: string;
  description: string;
  reference?: string | null;
  createdAt: Date;
};

function toNum(v: unknown): number {
  if (v == null) return 0;
  return typeof v === "object" && v !== null && "toNumber" in v
    ? (v as { toNumber: () => number }).toNumber()
    : Number(v);
}

const CHARGE_TYPES: LedgerEntryType[] = ["FACTURA", "ADICIONAL", "AJUSTE"];
const CREDIT_TYPES: LedgerEntryType[] = ["PAGO", "NOTA_CREDITO"];

export function buildProjectLedgerStatement(input: {
  budgetAmount?: unknown;
  budgetCurrency?: string;
  workExtras: WorkExtraRow[];
  entries: LedgerRow[];
}): { lines: LedgerStatementLine[]; summary: LedgerSummary } {
  const currency = input.budgetCurrency ?? "ARS";
  const lines: LedgerStatementLine[] = [];

  const budget = toNum(input.budgetAmount);
  if (budget > 0) {
    lines.push({
      id: "budget",
      source: "project",
      type: "PRESUPUESTO",
      amount: budget,
      currency,
      description: "Presupuesto base de obra",
      createdAt: new Date(0).toISOString(),
      debit: true,
    });
  }

  for (const extra of input.workExtras) {
    if (!["APROBADO", "EN_EJECUCION", "COMPLETADO"].includes(extra.status)) continue;
    const amt = toNum(extra.amount);
    lines.push({
      id: `extra-${extra.id}`,
      source: "work_extra",
      type: "ADICIONAL_AUTO",
      amount: amt,
      currency,
      description: `Adicional: ${extra.title}`,
      reference: extra.approvalReference ?? null,
      createdAt: (extra.approvedAt ?? new Date()).toISOString(),
      debit: true,
    });
  }

  for (const e of input.entries) {
    const amt = toNum(e.amount);
    const debit = CHARGE_TYPES.includes(e.type);
    lines.push({
      id: e.id,
      source: "manual",
      type: e.type,
      amount: amt,
      currency: e.currency,
      description: e.description,
      reference: e.reference,
      createdAt: e.createdAt.toISOString(),
      debit,
    });
  }

  lines.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const extrasApproved = input.workExtras
    .filter((x) => ["APROBADO", "EN_EJECUCION", "COMPLETADO"].includes(x.status))
    .reduce((s, x) => s + toNum(x.amount), 0);

  const manualCharges = input.entries
    .filter((e) => CHARGE_TYPES.includes(e.type))
    .reduce((s, e) => s + toNum(e.amount), 0);

  const manualCredits = input.entries
    .filter((e) => CREDIT_TYPES.includes(e.type))
    .reduce((s, e) => s + toNum(e.amount), 0);

  const charges = budget + extrasApproved + manualCharges;
  const payments = manualCredits;
  const balance = charges - payments;

  return {
    lines,
    summary: {
      currency,
      budget,
      extrasApproved,
      charges,
      payments,
      balance,
    },
  };
}
