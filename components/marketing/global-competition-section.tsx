"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  COMPARISON_ROWS,
  GLOBAL_COMPETITORS,
  GLOBAL_VISION,
  SCALE_PILLARS,
  WIN_STRATEGY,
} from "@/lib/global-competition";
import { Check, Minus, ArrowRight, Globe2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

function NexusCell({ level }: { level: "full" | "partial" | "roadmap" }) {
  if (level === "full") {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
        <Check className="h-3.5 w-3.5" /> Incluido
      </span>
    );
  }
  if (level === "partial") {
    return (
      <span className="inline-flex items-center gap-1 text-amber-400 text-xs">
        <Minus className="h-3.5 w-3.5" /> En expansion
      </span>
    );
  }
  return (
    <span className="text-xs text-blue-300">Roadmap 2026</span>
  );
}

export function GlobalCompetitionSection() {
  return (
    <section id="escala-global" className="py-20 md:py-28 px-6 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="outline" className="border-emprenor/50 text-blue-200 gap-1">
            <Globe2 className="h-3 w-3" />
            Ambicion global
          </Badge>
          <Badge variant="outline" className="border-white/15 text-slate-400">
            vs Monday · Asana · ClickUp · Jira
          </Badge>
        </div>

        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight max-w-3xl">
          {GLOBAL_VISION.headline}
        </h2>
        <p className="mt-4 text-slate-400 max-w-2xl leading-relaxed">{GLOBAL_VISION.subhead}</p>
        <p className="mt-2 text-sm text-slate-500">{GLOBAL_VISION.scaleTarget}</p>
        <p className="mt-3 text-xs text-slate-500 max-w-2xl leading-relaxed border-l-2 border-emprenor/40 pl-3">
          Compromiso de transparencia: solo marcamos &quot;Incluido&quot; lo verificado en producto y pruebas
          automaticas. Lo demas figura como expansion o roadmap — sin promesas vacias.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {GLOBAL_COMPETITORS.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-white/10 bg-slate-900/60 p-4"
            >
              <p className="font-semibold text-sm text-white">{c.name}</p>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{c.strength}</p>
              <p className="text-[11px] text-emprenor-light/90 mt-2 leading-relaxed border-t border-white/5 pt-2">
                Brecha: {c.gap}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/80 text-left">
                <th className="p-4 font-medium text-slate-300">Capacidad</th>
                <th className="p-4 font-medium text-blue-300">Emprenor Nexus</th>
                <th className="p-4 font-medium text-slate-500">Monday / Asana / ClickUp / Jira</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.capability} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-4 text-slate-300">{row.capability}</td>
                  <td className="p-4">
                    <NexusCell level={row.nexus} />
                  </td>
                  <td className="p-4 text-slate-500 text-xs">{row.others}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-emprenor-light" />
              Pilares de escala
            </h3>
            <ul className="mt-4 space-y-3">
              {SCALE_PILLARS.map((p) => (
                <li
                  key={p.id}
                  className="flex gap-3 text-sm border border-white/10 rounded-lg p-3 bg-slate-900/40"
                >
                  <Badge
                    className={cn(
                      "shrink-0 h-5 text-[10px]",
                      p.status === "live"
                        ? "bg-emerald-900/50 text-emerald-300"
                        : "bg-blue-900/40 text-blue-300"
                    )}
                  >
                    {p.status === "live" ? "Hoy" : "Roadmap"}
                  </Badge>
                  <div>
                    <p className="font-medium text-slate-200">{p.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Como ganamos mercado</h3>
            <ol className="mt-4 space-y-3 list-decimal list-inside text-sm text-slate-400 leading-relaxed">
              {WIN_STRATEGY.map((s) => (
                <li key={s} className="pl-1">
                  {s}
                </li>
              ))}
            </ol>
            <Button className="mt-6 bg-emprenor hover:bg-emprenor-light" asChild>
              <Link href="/registro">
                Registrar organizacion <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
