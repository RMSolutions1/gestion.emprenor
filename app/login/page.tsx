import Image from "next/image";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./_components/login-form";
import { Zap, Shield, FolderKanban } from "lucide-react";

export const metadata: Metadata = {
  title: "Iniciar sesion | Emprenor Servicios",
  description: "Accede al portal Emprenor Nexus — planos, presupuestos y documentacion de obra",
};

const features = [
  {
    icon: FolderKanban,
    title: "Un proyecto, dos partes",
    description:
      "Canal privado entre quien contrata (cliente) y quien ejecuta el servicio (proveedor).",
  },
  {
    icon: Shield,
    title: "Documentacion completa",
    description: "Obra en curso y legajo del personal, visible para el cliente cuando corresponde.",
  },
  {
    icon: Zap,
    title: "Consultas con registro",
    description:
      "Dudas y pedidos de justificacion dentro de la plataforma — sin WhatsApp disperso.",
  },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-emprenor-surface">
      <aside className="relative flex flex-col justify-between overflow-hidden bg-emprenor login-brand-pattern px-8 py-10 lg:w-[52%] lg:min-h-screen lg:px-14 lg:py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-emprenor via-emprenor-dark to-[#0a0912] opacity-95" />
        <Image
          src="/brand/logo-icon-inverted.png"
          alt=""
          width={320}
          height={320}
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-16 z-0 h-64 w-64 opacity-[0.12] lg:h-80 lg:w-80"
        />

        <div className="relative z-10 max-w-[min(100%,17.5rem)]">
          <Image
            src="/brand/logo-white-large.png"
            alt="Emprenor"
            width={280}
            height={72}
            priority
            className="h-12 max-w-full w-auto object-contain object-left lg:h-14"
          />
        </div>

        <div className="relative z-10 hidden max-w-md flex-1 flex-col justify-center lg:flex">
          <p className="mb-8 text-sm font-medium uppercase tracking-[0.2em] text-white/50">
            Emprenor Servicios · Nexus
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight text-white xl:text-4xl">
            Su cliente y su empresa, siempre alineados.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            Electricidad, construccion, refacciones u otro servicio: comparta documentacion de la obra
            y del equipo, y responda consultas con trazabilidad.
          </p>

          <ul className="mt-10 space-y-5">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-0.5 text-sm text-white/60">{item.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative z-10 hidden text-xs text-white/40 lg:block">
          © {new Date().getFullYear()} Emprenor. Todos los derechos reservados.
        </p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-col items-center lg:hidden">
          <Image
            src="/brand/logo-large.png"
            alt="Emprenor Servicios"
            width={240}
            height={62}
            priority
            className="h-11 w-auto"
          />
          <p className="mt-3 text-center text-sm text-muted-foreground">Emprenor Nexus — Gestion de Obras</p>
        </div>

        <Suspense fallback={<div className="h-64 w-full max-w-[420px] animate-pulse rounded-2xl bg-white/10" />}>
          <LoginForm />
        </Suspense>

        <p className="mt-8 text-center text-xs text-white/30 lg:hidden">
          © {new Date().getFullYear()} Emprenor
        </p>
      </main>
    </div>
  );
}
