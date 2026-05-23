"use client";

import Link from "next/link";
import { EmprenorLogo } from "@/components/brand/emprenor-logo";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Building2,
  Zap,
  Flame,
  Mountain,
  Droplets,
  Wheat,
  Landmark,
  MessageSquare,
  Shield,
  FileCheck,
  BarChart3,
  CheckCircle2,
  Factory,
  ListTodo,
  Users,
  Wallet,
  ClipboardCheck,
  Layers,
} from "lucide-react";
import {
  COMPETITIVE_PILLARS,
  ENTERPRISE_SECTORS,
  TRUST_MARKET_SEGMENTS,
} from "@/lib/enterprise-sectors";
import {
  CLIENT_EXAMPLES,
  DOCUMENTATION_SCOPE,
  PLATFORM_MISSION,
  PROVIDER_EXAMPLES,
} from "@/lib/platform-positioning";
import { PlatformEssenceStrip } from "@/components/platform/client-provider-mission";
import { GlobalCompetitionSection } from "@/components/marketing/global-competition-section";

const PRODUCT_NAME = BRAND.product;
const PRODUCT_TAGLINE = BRAND.tagline;

const SECTOR_ICONS: Record<string, typeof Zap> = {
  energia: Zap,
  oil_gas: Flame,
  mineria: Mountain,
  industrial: Factory,
  construccion: Building2,
  agro: Wheat,
  servicios_publicos: Droplets,
  residencial: Building2,
};

const CAPABILITIES = [
  {
    icon: MessageSquare,
    title: "Canal cliente ↔ proveedor",
    desc: "Cada obra es un vinculo privado: el cliente consulta y pide justificaciones; el proveedor responde con trazabilidad. Sin WhatsApp suelto.",
  },
  {
    icon: FileCheck,
    title: "Documentacion de obra y personal",
    desc: "Planos, presupuestos, remitos y legajo del equipo (ART, seguros, antecedentes). Todo lo que el mandante debe ver, en un solo lugar.",
  },
  {
    icon: ListTodo,
    title: "Operacion del proveedor",
    desc: "Cola de trabajo, vencimientos y aprobaciones para electricistas, constructoras, refaccionistas y cualquier empresa de servicios.",
  },
  {
    icon: Shield,
    title: "HSE y cumplimiento normativo",
    desc: "Permisos de trabajo, inspecciones, vencimientos y checklist por tipo de sitio. Ley 19.587, SRT y buenas practicas.",
  },
  {
    icon: BarChart3,
    title: "Calidad y no conformidades",
    desc: "QMS integrado: NC, CAPA, informes tecnicos y flujo de aprobacion del cliente en un solo lugar.",
  },
  {
    icon: Wallet,
    title: "Presupuesto y cobros transparentes",
    desc: "El cliente ve presupuesto, adicionales aprobados y saldo. El proveedor registra facturas y pagos con respaldo.",
  },
  {
    icon: ClipboardCheck,
    title: "Recepcion y garantia",
    desc: "Acta CONF-EL, politica de garantia 120 dias y trazabilidad horaria. Cierre de obra con respaldo legal.",
  },
  {
    icon: Users,
    title: "Cualquier tipo de cliente",
    desc: "Particular, sociedad, comercio, industria o organismo: entra solo a sus obras y habla con su proveedor desde el portal.",
  },
];

const PAIN_POINTS = [
  "Consultas del cliente por WhatsApp sin registro ni respuesta formal",
  "Planos y legajo del personal repartidos en correos y carpetas",
  "El cliente no sabe si el presupuesto o un adicional fue realmente acordado",
  "Imposible demostrar que se entrego documentacion y justificacion a tiempo",
];

const STEPS = [
  {
    step: "01",
    title: "Configure su organizacion",
    desc: "Alta de obras, equipos y clientes en una sola base de datos. Roles y permisos desde el primer dia.",
  },
  {
    step: "02",
    title: "Ejecute con trazabilidad",
    desc: "Tareas, parte diario, materiales, HSE y documentos vinculados a cada proyecto en tiempo real.",
  },
  {
    step: "03",
    title: "Cierre con respaldo",
    desc: "Aprobaciones digitales, cuenta corriente cerrada y recepcion formal. El mandante queda conforme.",
  },
];

const PERSONAS = [
  {
    title: "Proveedor de servicios",
    desc: "Electricidad, obra, refaccion, montaje: sube documentacion de la obra y del personal y responde consultas en la plataforma.",
  },
  {
    title: "Cliente",
    desc: "Particular, empresa, comercio o industria: ve su proyecto, revisa legajos y escribe consultas o pide justificaciones al proveedor.",
  },
  {
    title: "Equipo del proveedor",
    desc: "Tecnicos e inspectores cargan informes, HSE y respuestas en el mismo canal trazable con el cliente.",
  },
];

export function MarketingSite() {
  return (
    <div className="min-h-screen bg-slate-950 text-white antialiased">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <EmprenorLogo variant="white" href="/" className="h-9" priority />
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#que-es" className="hover:text-white transition-colors">
              Que es
            </a>
            <a href="#producto" className="hover:text-white transition-colors">
              Producto
            </a>
            <a href="#como-funciona" className="hover:text-white transition-colors">
              Como funciona
            </a>
            <a href="#escala-global" className="hover:text-white transition-colors">
              Escala global
            </a>
            <a href="#sectores" className="hover:text-white transition-colors">
              Sectores
            </a>
            <a href="#planes" className="hover:text-white transition-colors">
              Planes
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-slate-300 hover:text-white hidden sm:inline-flex" asChild>
              <Link href="/login">Ingresar</Link>
            </Button>
            <Button className="bg-emprenor hover:bg-emprenor-light font-medium" asChild>
              <Link href="/registro">Solicitar acceso</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,_rgba(46,42,110,0.45),_transparent)]" />
        <div className="max-w-6xl mx-auto relative">
          <p className="text-sm font-medium text-blue-300 tracking-wide uppercase mb-4">
            Alternativa global a tableros genericos · LATAM primero
          </p>
          <h1 className="text-4xl md:text-[3.25rem] font-display font-bold tracking-tight max-w-4xl leading-[1.1] text-white">
            {PLATFORM_MISSION.headline}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed font-light">
            {PLATFORM_MISSION.essence} Sube toda la documentacion del proyecto y del personal;
            el cliente consulta, pide justificaciones y aprueba desde un portal seguro.
          </p>
          <div className="mt-6">
            <PlatformEssenceStrip />
          </div>
          <ul className="mt-8 space-y-2 max-w-xl">
            {[
              DOCUMENTATION_SCOPE[0].title + ": planos, presupuestos, remitos, informes",
              DOCUMENTATION_SCOPE[1].title + ": ART, seguros y habilitaciones visibles al cliente",
              "Consultas y justificaciones por obra, con registro — no por WhatsApp",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                {line}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="bg-emprenor hover:bg-emprenor-light h-12 px-8 text-base" asChild>
              <Link href="/registro">
                Empezar ahora <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 border-slate-600 text-slate-200 hover:bg-white/5 text-base"
              asChild
            >
              <Link href="/login">Ya tengo cuenta</Link>
            </Button>
          </div>
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
            {[
              { value: "120 dias", label: "Garantia de servicio configurable" },
              { value: "1 BD", label: "Empresa, empleados, clientes y obras" },
              { value: "24/7", label: "Acceso web para mandante y equipo" },
              { value: "AR", label: "Compliance local integrado" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900/80 p-5 md:p-6">
                <p className="text-xl md:text-2xl font-display font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1.5 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 px-6 border-t border-white/10 bg-slate-900/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
              El costo de operar sin sistema
            </h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Cada obra que depende de planillas, correos y mensajes sueltos acumula riesgo: multas,
              reclamos, demoras en cobro y perdida de confianza del mandante.
            </p>
          </div>
          <ul className="space-y-3">
            {PAIN_POINTS.map((p) => (
              <li
                key={p}
                className="flex gap-3 p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-sm text-slate-300"
              >
                <span className="text-red-400 font-bold">×</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Que es */}
      <section id="que-es" className="py-16 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-display font-bold">Que es {PRODUCT_NAME}</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">{PLATFORM_MISSION.essence}</p>
            <p className="mt-3 text-slate-400 leading-relaxed text-sm">
              No es un directorio de empresas ni una red social: es el canal donde su cliente ve lo
              que usted ejecuta y le pregunta con respaldo escrito.
            </p>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 p-4 bg-slate-900/50">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Proveedor</p>
              <ul className="flex flex-wrap gap-2">
                {PROVIDER_EXAMPLES.map((p) => (
                  <li
                    key={p}
                    className="text-sm text-slate-300 px-2.5 py-1 rounded-md bg-white/5"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-emprenor/30 p-4 bg-emprenor/10">
              <p className="text-xs uppercase tracking-wide text-blue-300 mb-2">Cliente</p>
              <ul className="flex flex-wrap gap-2">
                {CLIENT_EXAMPLES.map((c) => (
                  <li
                    key={c}
                    className="text-sm text-slate-200 px-2.5 py-1 rounded-md bg-white/5"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section id="producto" className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              Por que eligen esta plataforma
            </h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              No es un CRM generico ni una carpeta en la nube. Es un sistema operativo de obra con
              reglas de negocio, flujos de aprobacion y evidencia lista para auditoria.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {COMPETITIVE_PILLARS.map((p) => (
              <div
                key={p.title}
                className="p-6 md:p-7 rounded-2xl border border-white/10 bg-slate-900/40"
              >
                <CheckCircle2 className="h-5 w-5 text-blue-400 mb-4" />
                <h3 className="font-display font-semibold text-lg">{p.title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 px-6 border-t border-white/10 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-4">Como funciona</h2>
          <p className="text-center text-slate-400 max-w-xl mx-auto mb-14">
            De la configuracion al cierre de obra en tres pasos. Sin implementaciones de meses.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.step} className="relative p-6 rounded-2xl border border-white/10">
                <span className="text-4xl font-display font-bold text-blue-500/30">{s.step}</span>
                <h3 className="font-semibold text-lg mt-2">{s.title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <Layers className="h-8 w-8 text-blue-400 mb-3" />
              <h2 className="text-3xl font-display font-bold">Todo lo que necesita en produccion</h2>
              <p className="text-slate-400 mt-2 max-w-lg">
                Modulos que trabajan juntos. Sin integraciones frágiles entre diez herramientas.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRUST_MARKET_SEGMENTS.map((s) => (
                <span
                  key={s}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-500"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAPABILITIES.map((f) => (
              <div
                key={f.title}
                className="p-5 rounded-xl border border-white/10 bg-slate-900/50 hover:border-blue-500/30 transition-colors"
              >
                <f.icon className="h-6 w-6 text-blue-400 mb-3" />
                <h3 className="font-semibold text-sm leading-snug">{f.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GlobalCompetitionSection />

      {/* Sectors - no company names */}
      <section id="sectores" className="py-20 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-3">
            Para cada industria, el checklist correcto
          </h2>
          <p className="text-center text-slate-400 max-w-2xl mx-auto mb-12 text-sm leading-relaxed">
            Plantillas de cumplimiento, tipo de sitio y documentacion adaptadas a energia, mineria,
            obra publica, industria, agro y barrios privados.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ENTERPRISE_SECTORS.map((sector) => {
              const Icon = SECTOR_ICONS[sector.id] ?? Building2;
              return (
                <div
                  key={sector.id}
                  className="p-5 rounded-xl border border-white/10 bg-slate-900/60"
                >
                  <Icon className="h-6 w-6 text-blue-400 mb-3" />
                  <h3 className="font-semibold text-sm">{sector.name}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{sector.tagline}</p>
                  <p className="text-[10px] text-slate-600 mt-3 line-clamp-2">
                    {sector.compliance.slice(0, 3).join(" · ")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Personas */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-10">
            Un sistema, tres niveles de valor
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {PERSONAS.map((p) => (
              <div key={p.title} className="text-center p-6 rounded-2xl border border-white/10">
                <h3 className="font-semibold text-blue-300">{p.title}</h3>
                <p className="text-sm text-slate-400 mt-3 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA block */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-950/60 to-slate-950 p-10 md:p-14">
          <Landmark className="h-10 w-10 text-blue-400 mx-auto mb-5" />
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
            Obra publica, industrial o privada: un solo estandar de excelencia
          </h2>
          <p className="mt-4 text-slate-400 leading-relaxed max-w-2xl mx-auto">
            El mandante accede a su portal. Usted controla documentacion, personal, cobranza y
            cierre. Menos friccion, mas obras ganadas y renovadas.
          </p>
          <Button className="mt-8 bg-emprenor hover:bg-emprenor-light h-12 px-10" asChild>
            <Link href="/registro">
              Registrar mi organizacion <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Pricing */}
      <section id="planes" className="py-20 md:py-28 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold">Planes transparentes</h2>
            <p className="text-slate-400 mt-2 text-sm">
              Escale segun obras activas y usuarios. Sin sorpresas en funcionalidad core.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Desde USD 299",
                desc: "Hasta 25 usuarios, obras activas, legajo digital y portal cliente base.",
                cta: "Comenzar",
                href: "/registro",
              },
              {
                name: "Professional",
                price: "Desde USD 899",
                desc: "Multi-obra, chat, QMS/HSE, cuenta corriente, recepcion y garantia 120 dias.",
                highlight: true,
                cta: "Mas elegido",
                href: "/registro",
              },
              {
                name: "Enterprise",
                price: "A medida",
                desc: "Dominio propio, SLA, integraciones y despliegue dedicado para grupos operativos.",
                cta: "Contactar",
                href: "/login",
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border flex flex-col ${
                  plan.highlight
                    ? "border-blue-500 bg-blue-500/10 shadow-xl shadow-blue-900/20"
                    : "border-white/10 bg-slate-900/30"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-medium uppercase tracking-wider bg-emprenor text-white px-3 py-1 rounded-full">
                    Recomendado
                  </span>
                )}
                <h3 className="font-display font-bold text-xl">{plan.name}</h3>
                <p className="text-3xl font-display font-bold mt-4 tracking-tight">{plan.price}</p>
                <p className="text-xs text-slate-500 mt-1">por mes</p>
                <p className="text-sm text-slate-400 mt-5 flex-1 leading-relaxed">{plan.desc}</p>
                <Button
                  className={`w-full mt-6 ${plan.highlight ? "bg-emprenor hover:bg-emprenor-light" : ""}`}
                  variant={plan.highlight ? "default" : "outline"}
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-2xl font-display font-bold">{PRODUCT_NAME}</p>
            <p className="text-slate-500 text-sm mt-1">{PRODUCT_TAGLINE}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-slate-600" asChild>
              <Link href="/login">Ingresar</Link>
            </Button>
            <Button className="bg-emprenor hover:bg-emprenor-light" asChild>
              <Link href="/registro">Solicitar demo</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6 text-sm text-slate-600">
          <div>
            <p className="font-display font-semibold text-slate-400">{PRODUCT_NAME}</p>
            <p className="text-xs mt-1 max-w-xs">{PRODUCT_TAGLINE}</p>
            <p className="text-xs mt-4">© {new Date().getFullYear()} Todos los derechos reservados.</p>
          </div>
          <div className="flex gap-8">
            <Link href="/legal/privacidad" className="hover:text-slate-300 transition-colors">
              Privacidad
            </Link>
            <Link href="/legal/terminos" className="hover:text-slate-300 transition-colors">
              Terminos de uso
            </Link>
            <a
              href="mailto:info@emprenor.com.ar"
              className="hover:text-slate-300 transition-colors"
            >
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
