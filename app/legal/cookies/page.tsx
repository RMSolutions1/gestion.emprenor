import Link from "next/link";

export const metadata = { title: "Politica de Cookies — Emprenor Nexus" };

export default function CookiesPage() {
  return (
    <article className="min-h-screen bg-slate-950 text-slate-200 px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-400 text-sm hover:underline">
          ← Volver al inicio
        </Link>
        <h1 className="font-display text-3xl font-bold mt-6">Politica de Cookies</h1>
        <section className="mt-8 space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            Utilizamos cookies esenciales para autenticacion y sesion, y cookies analiticas
            anonimizadas para mejorar el producto. Puede gestionar preferencias desde su navegador.
          </p>
        </section>
      </div>
    </article>
  );
}
