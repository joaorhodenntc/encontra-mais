import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BadgeCheck } from "lucide-react"

export function CTASection() {
  return (
    <section className="bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white">
      <div className="container px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">É um profissional qualificado?</h2>
          <p className="mb-8 text-lg text-white/90">
            Cadastre-se na nossa plataforma e conecte-se com milhares de clientes em potencial todos os dias.
          </p>

          <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center">
              <BadgeCheck className="h-6 w-6 mr-2 text-white" />
              <span>Aumente sua visibilidade</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center">
              <BadgeCheck className="h-6 w-6 mr-2 text-white" />
              <span>Receba contatos via WhatsApp</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center">
              <BadgeCheck className="h-6 w-6 mr-2 text-white" />
              <span>Gerencie seus serviços</span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" className="bg-white text-[#f97316] hover:bg-white/90" asChild>
              <Link href="/planos">Ver Planos</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/cadastro/profissional">Cadastrar Agora</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
