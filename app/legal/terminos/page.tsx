import Link from "next/link";

export const metadata = { title: "Terminos y Condiciones — Emprenor Nexus" };

export default function TerminosPage() {
  return (
    <article className="min-h-screen bg-slate-950 text-slate-200 px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-400 text-sm hover:underline">
          ← Volver al inicio
        </Link>
        <h1 className="font-display text-3xl font-bold mt-6">Terminos y Condiciones</h1>
        <section className="mt-8 space-y-4 text-slate-300 leading-relaxed text-sm">
          <p>
            Al utilizar Emprenor Nexus usted acepta estos terminos. El servicio se provee bajo modelo
            SaaS por suscripcion con niveles Starter, Professional y Enterprise.
          </p>
          <h2 className="text-lg font-semibold text-white">Licencia de uso</h2>
          <p>
            Licencia limitada, no exclusiva e intransferible para uso interno de su organizacion
            durante la vigencia de la suscripcion.
          </p>
          <h2 className="text-lg font-semibold text-white">Propiedad de datos</h2>
          <p>
            Los datos cargados por el cliente son de su propiedad. El operador actua como encargado
            del tratamiento segun DPA enterprise.
          </p>
          <h2 className="text-lg font-semibold text-white">Limitacion de responsabilidad</h2>
          <p>
            En la maxima medida permitida por ley aplicable, la responsabilidad se limita al monto
            abonado en los ultimos 12 meses.
          </p>
          <p className="text-xs text-slate-500 border-t border-white/10 pt-6">
            Borrador orientativo — revision legal requerida.
          </p>
        </section>
      </div>
    </article>
  );
}
