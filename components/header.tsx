import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo-e.png"
              alt="Encontra+ Logo"
              width={50}
              height={50}
              className="mt-1 md:hidden"
            />
            <span className="hidden md:block text-2xl font-bold text-[#f97316]">
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
              href="/como-funciona"
              className="text-sm font-medium transition-colors hover:text-[#f97316]"
            >
              Como Funciona
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="bg-[#f97316] hover:bg-[#ea580c] text-white"
            asChild
          >
            <Link href="/area-profissional">Área do Profissional</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/"
                  className="text-foreground hover:text-[#f97316] py-2"
                >
                  Início
                </Link>
                <Link
                  href="/buscar"
                  className="text-foreground hover:text-[#f97316] py-2"
                >
                  Buscar
                </Link>
                <Link
                  href="/planos"
                  className="text-foreground hover:text-[#f97316] py-2"
                >
                  Planos
                </Link>
                <Link
                  href="/como-funciona"
                  className="text-foreground hover:text-[#f97316] py-2"
                >
                  Como Funciona
                </Link>
                <Link
                  href="/area-profissional"
                  className="text-foreground hover:text-[#f97316] py-2"
                >
                  Área do Profissional
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
