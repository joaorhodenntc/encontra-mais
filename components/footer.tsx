import Link from "next/link"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">EncontraMais</h3>
            <p className="text-sm text-muted-foreground">
              Conectando profissionais e clientes de forma simples e eficiente.
            </p>
            <div className="mt-4 flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Navegação</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/buscar" className="text-muted-foreground hover:text-primary">
                  Buscar Profissionais
                </Link>
              </li>
              <li>
                <Link href="/categorias" className="text-muted-foreground hover:text-primary">
                  Categorias
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="text-muted-foreground hover:text-primary">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="/precos" className="text-muted-foreground hover:text-primary">
                  Preços
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Recursos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/para-profissionais" className="text-muted-foreground hover:text-primary">
                  Para Profissionais
                </Link>
              </li>
              <li>
                <Link href="/para-clientes" className="text-muted-foreground hover:text-primary">
                  Para Clientes
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/ajuda" className="text-muted-foreground hover:text-primary">
                  Central de Ajuda
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/termos" className="text-muted-foreground hover:text-primary">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-muted-foreground hover:text-primary">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-primary">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EncontraMais. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
