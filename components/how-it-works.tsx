import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, UserCheck, MessageCircle } from "lucide-react"

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-gray-50 py-16">
      <div className="container px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">Como Funciona</h2>
          <p className="text-muted-foreground">Encontrar o profissional ideal nunca foi tão fácil</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={index} className="border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff7ed]">
                  <step.icon className="h-6 w-6 text-[#f97316]" />
                </div>
                <CardTitle className="flex items-center text-xl">
                  <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#f97316] text-sm text-white">
                    {index + 1}
                  </span>
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{step.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

const steps = [
  {
    title: "Busque",
    description: "Pesquise pelo serviço que você precisa e encontre profissionais qualificados na sua região.",
    icon: Search,
  },
  {
    title: "Escolha",
    description: "Compare perfis, especialidades e preços para escolher o profissional ideal para o seu serviço.",
    icon: UserCheck,
  },
  {
    title: "Contate",
    description: "Entre em contato diretamente via WhatsApp para discutir detalhes e agendar o serviço.",
    icon: MessageCircle,
  },
]
