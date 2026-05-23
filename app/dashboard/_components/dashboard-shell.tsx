"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  LogOut,
  Menu,
  X,
  HardHat,
  ChevronRight,
  Radio,
  MessageSquare,
  CreditCard,
  Search,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isAdmin, isSpecialist, roleLabel } from "@/lib/roles";
import { NotificationBell } from "@/components/command/notification-bell";
import { ThemeToggle } from "@/components/command/theme-toggle";
import { EmprenorLogo } from "@/components/brand/emprenor-logo";
import { BRAND } from "@/lib/brand";

const adminLinks = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/dashboard/command", label: "Centro comando", icon: Radio },
  { href: "/dashboard/comunicaciones", label: "Comunicaciones", icon: MessageSquare },
  { href: "/dashboard/search", label: "Busqueda", icon: Search },
  { href: "/dashboard/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/dashboard/compliance", label: "PAC / Calidad", icon: BookOpen },
  { href: "/dashboard/administracion", label: "Administracion", icon: Users },
  { href: "/dashboard/billing", label: "Facturacion", icon: CreditCard },
];

const specialistLinks = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/dashboard/comunicaciones", label: "Comunicaciones", icon: MessageSquare },
  { href: "/dashboard/projects", label: "Mis obras", icon: FolderKanban },
];

const clientLinks = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/dashboard/comunicaciones", label: "Comunicaciones", icon: MessageSquare },
  { href: "/dashboard/projects", label: "Mis Proyectos", icon: FolderKanban },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession() || {};
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastRole, setLastRole] = useState<string | undefined>();
  const role = (session?.user as { role?: string })?.role;

  useEffect(() => {
    if (role) setLastRole(role);
  }, [role]);

  const effectiveRole = role ?? lastRole;
  const links = isAdmin(effectiveRole)
    ? adminLinks
    : isSpecialist(effectiveRole)
      ? specialistLinks
      : clientLinks;
  const userName = session?.user?.name ?? "Usuario";
  const displayRole = roleLabel(effectiveRole ?? (status === "loading" ? "" : "CLIENTE"));

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-slate-950 text-white border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 dark:bg-slate-950",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <EmprenorLogo
            variant="icon"
            href="/dashboard"
            className="h-9 w-9 shrink-0"
            priority
          />
          <div className="min-w-0 flex-1 overflow-hidden pr-8 lg:pr-1">
            <p className="truncate text-sm font-semibold leading-tight text-white">Emprenor</p>
            <p className="truncate text-[11px] text-blue-200/90">Nexus</p>
          </div>
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/80 hover:bg-white/10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 space-y-1 overflow-y-auto p-3 pb-28">
          {links?.map((link: any) => {
            const Icon = link?.icon;
            const isActive = pathname === link?.href || (link?.href !== "/dashboard" && pathname?.startsWith?.(link?.href));
            return (
              <Link
                key={link?.href}
                href={link?.href ?? "#"}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-blue-100 hover:bg-blue-800 hover:text-white"
                )}
              >
                {Icon && <Icon className="h-5 w-5" />}
                {link?.label}
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-emprenor flex items-center justify-center text-sm font-bold">
              {userName?.charAt?.(0)?.toUpperCase?.() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-blue-300 truncate">{displayRole}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full text-slate-300 hover:text-white hover:bg-white/10 justify-start"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesion
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border h-14 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-muted"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <EmprenorLogo variant="icon" className="h-7 w-7 hidden sm:block" />
            <span className="text-sm font-medium text-muted-foreground">
              {isAdmin(effectiveRole)
                ? `${BRAND.product} — Operaciones`
                : isSpecialist(effectiveRole)
                  ? "Portal tecnico"
                  : "Portal del cliente"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
          </div>
        </header>

        <main className="p-4 lg:p-6 max-w-[1200px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
