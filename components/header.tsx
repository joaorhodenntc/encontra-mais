"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";

export function Header() {
  const [session, setSession] = useState<Session | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleComoFuncionaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      const howItWorksSection = document.querySelector("#como-funciona");
      if (howItWorksSection) {
        howItWorksSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl md:block md:text-2xl font-bold text-[#f97316]">
              Encontra+
            </span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-[#f97316]"
            >
              Início
            </Link>
            <Link
              href="/buscar"
              className="text-sm font-medium transition-colors hover:text-[#f97316]"
            >
              Buscar
            </Link>
            <Link
              href="/planos"
              className="text-sm font-medium transition-colors hover:text-[#f97316]"
            >
              Planos
            </Link>
            <Link
              href="/#como-funciona"
              className="text-sm font-medium transition-colors hover:text-[#f97316]"
              onClick={handleComoFuncionaClick}
            >
              Como Funciona
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {session ? (
            <Button
              className="bg-[#f97316] hover:bg-[#ea580c] text-white"
              asChild
            >
              <Link href="/area-profissional">Área do Profissional</Link>
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="hover:bg-[#f97316] hover:text-white"
                asChild
              >
                <Link href="/entrar">Entrar</Link>
              </Button>
              <Button
                className="bg-[#f97316] hover:bg-[#ea580c] text-white"
                asChild
              >
                <Link href="/cadastro">Cadastrar</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
