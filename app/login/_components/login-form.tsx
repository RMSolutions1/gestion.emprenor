"use client";

import { useState } from "react";
import Image from "next/image";
import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error(
          "Credenciales invalidas. Use http://localhost:3001 y ejecute npm run reset-owner si es la cuenta owner."
        );
        return;
      }

      let role: string | undefined;
      for (let i = 0; i < 8; i++) {
        const session = await getSession();
        role = (session?.user as { role?: string } | undefined)?.role;
        if (role) break;
        await new Promise((r) => setTimeout(r, 150));
      }

      router.refresh();
      if (role === "PLATFORM_OWNER") {
        router.replace("/platform");
      } else if (callbackUrl.startsWith("/platform")) {
        router.replace("/dashboard");
      } else {
        router.replace(callbackUrl);
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      toast.error("Error al iniciar sesion. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] animate-fade-in">
      <div className="rounded-2xl border border-white/[0.08] bg-white p-8 shadow-2xl shadow-black/40 sm:p-10">
        <header className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/brand/logo-small.png"
            alt="Emprenor"
            width={200}
            height={48}
            className="hidden h-10 w-auto lg:block"
            priority
          />
          <Image
            src="/brand/logo-icon.png"
            alt=""
            width={56}
            height={56}
            className="mb-4 h-14 w-14 lg:hidden"
            aria-hidden
          />
          <h2 className="font-display text-2xl font-bold tracking-tight text-emprenor">
            Iniciar sesion
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Ingresa tus credenciales para acceder al portal
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset className="space-y-2" disabled={loading}>
            <Label htmlFor="email" className="text-slate-700">
              Correo electronico
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nombre@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-slate-200 bg-slate-50/80 pl-10 focus-visible:border-emprenor focus-visible:ring-emprenor/25"
                required
              />
            </div>
          </fieldset>

          <fieldset className="space-y-2" disabled={loading}>
            <Label htmlFor="password" className="text-slate-700">
              Contrasena
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-slate-200 bg-slate-50/80 pl-10 pr-11 focus-visible:border-emprenor focus-visible:ring-emprenor/25"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition-colors hover:text-emprenor"
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </fieldset>

          <Button
            type="submit"
            disabled={loading}
            className={cn(
              "group mt-2 h-11 w-full bg-emprenor text-base font-medium text-white",
              "hover:bg-emprenor-light focus-visible:ring-emprenor/30",
              "transition-all duration-200"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ingresando...
              </>
            ) : (
              <>
                Ingresar al portal
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 rounded-lg border border-emprenor/15 bg-emprenor/5 p-3 text-xs text-slate-600">
            <p className="mb-2 font-semibold text-emprenor">Cuentas de prueba (local)</p>
            <p className="mb-2 text-amber-800">
              Use la misma URL siempre: <strong>http://localhost:3001</strong> (debe coincidir con NEXTAUTH_URL en .env)
            </p>
            <p><span className="font-medium">Owner global:</span> owner@emprenor.com / platform2024</p>
            <p className="mt-1"><span className="font-medium">Admin:</span> admin@emprenor.com / admin2024</p>
            <p className="mt-1"><span className="font-medium">Cliente:</span> cliente@ejemplo.com / cliente123</p>
          </div>
        )}

        <p className="mt-4 text-center text-xs leading-relaxed text-slate-400">
          Acceso restringido a usuarios autorizados. Contacta al administrador si necesitas una cuenta.
        </p>
      </div>
    </div>
  );
}
