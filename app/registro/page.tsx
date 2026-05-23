import Link from "next/link";
import { RegisterTenantForm } from "./_components/register-tenant-form";

export const metadata = {
  title: "Registrar empresa | Emprenor Nexus",
};

export default function RegistroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col">
      <header className="p-6 flex items-center justify-between max-w-lg mx-auto w-full">
        <Link href="/" className="font-display font-bold text-lg text-blue-900 dark:text-white">
          Emprenor Nexus
        </Link>
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          Ingresar
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-12 w-full max-w-lg mx-auto">
        <RegisterTenantForm />
      </main>
    </div>
  );
}
