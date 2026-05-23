import Link from "next/link";

export const metadata = { title: "Politica de Privacidad — Emprenor Nexus" };

export default function PrivacidadPage() {
  return (
    <article className="min-h-screen bg-slate-950 text-slate-200 px-6 py-16">
      <div className="max-w-3xl mx-auto prose prose-invert prose-sm">
        <Link href="/" className="text-blue-400 text-sm no-underline hover:underline">
          ← Volver al inicio
        </Link>
        <h1 className="font-display text-3xl font-bold mt-6">Politica de Privacidad</h1>
        <p className="text-slate-400">Ultima actualizacion: mayo 2025</p>
        <section className="mt-8 space-y-4 text-slate-300 leading-relaxed">
          <p>
            Emprenor Nexus (&quot;nosotros&quot;) trata datos personales conforme a la Ley 25.326 de
            Proteccion de Datos Personales de la Republica Argentina y principios compatibles con
            GDPR para clientes internacionales.
          </p>
          <h2 className="text-xl font-semibold text-white">Datos que recopilamos</h2>
          <p>
            Identificacion, contacto, datos de uso de la plataforma, documentacion operativa cargada
            por su organizacion y registros de auditoria tecnica.
          </p>
          <h2 className="text-xl font-semibold text-white">Finalidad</h2>
          <p>
            Prestacion del servicio SaaS, seguridad, soporte, facturacion y cumplimiento legal.
          </p>
          <h2 className="text-xl font-semibold text-white">Derechos del titular</h2>
          <p>
            Acceso, rectificacion, actualizacion y supresion. Contacto: privacy@emprenor.com
          </p>
          <p className="text-xs text-slate-500 border-t border-white/10 pt-6">
            Documento orientativo. Requiere revision legal antes de produccion comercial.
          </p>
        </section>
      </div>
    </article>
  );
}
