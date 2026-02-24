
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Suspense } from "react";

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/profile", label: "Perfil" },
  ];
  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-zinc-50/80 backdrop-blur dark:border-white/15 dark:bg-black/60">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          BetDay Lite
        </Link>
        <Suspense fallback={<span className="ml-4 text-zinc-400 text-sm">Cargando...</span>}>
          <nav className="flex items-center gap-2">
            {navLinks.map(({ href, label }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    `rounded-xl px-3 py-2 text-sm font-medium transition-colors relative ` +
                    (isActive
                      ? "text-white  shadow font-bold dark:text-white"
                      : "text-zinc-700 hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white")
                  }
                  aria-current={isActive ? "page" : undefined}
                >
                  {label}
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-blue-500 rounded-full" />
                  )}
                </Link>
              );
            })}
            {status === "loading" ? (
              <span className="ml-4 text-zinc-400 text-sm">...</span>
            ) : session ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="cursor-pointer ml-4 rounded-xl px-3 py-2 text-sm font-medium bg-zinc-200 text-zinc-800 hover:bg-red-100 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-red-900 dark:hover:text-red-300 transition-colors"
              >
                Cerrar sesión
              </button>
            ) : (
              <button
                onClick={() => signIn()}
                className="cursor-pointer ml-4 rounded-xl px-3 py-2 text-sm font-medium bg-emerald-400 text-emerald-900 hover:bg-emerald-500 transition-colors"
              >
                Iniciar sesión
              </button>
            )}
          </nav>
        </Suspense>
      </div>
    </header>
  );
}
