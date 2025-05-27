import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Droplet, Paintbrush, Hammer, Scissors, Trash2 } from "lucide-react"

export function Categories() {
  return (
    <section className="container px-4 py-16">
      <div className="mb-10 text-center">
        <h2 className="mb-2 text-3xl font-bold tracking-tight">Categorias de Serviços</h2>
        <p className="text-muted-foreground">Encontre o profissional ideal para o serviço que você precisa</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {categories.map((category) => (
          <Link key={category.title} href={`/buscar?q=${category.slug}`}>
            <Card className="h-full transition-all hover:shadow-md border hover:border-[#f97316] group">
              <CardHeader className="pb-2 text-center p-4">
                <div className="mb-3 mx-auto flex justify-center">
                  <div className="p-3 rounded-full bg-gray-50 group-hover:bg-[#fff7ed] transition-colors">
                    <category.icon className="h-6 w-6 text-[#f97316]" strokeWidth={1.5} />
                  </div>
                </div>
                <CardTitle className="text-base">{category.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-xs text-center text-muted-foreground">{category.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

const categories = [
  {
    title: "Eletricista",
    description: "Instalações e reparos elétricos",
    icon: Zap,
    slug: "eletricista",
  },
  {
    title: "Encanador",
    description: "Reparos hidráulicos",
    icon: Droplet,
    slug: "encanador",
  },
  {
    title: "Pintor",
    description: "Pintura residencial",
    icon: Paintbrush,
    slug: "pintor",
  },
  {
    title: "Pedreiro",
    description: "Construções e reformas",
    icon: Hammer,
    slug: "pedreiro",
  },
  {
    title: "Marceneiro",
    description: "Móveis sob medida",
    icon: Scissors,
    slug: "marceneiro",
  },
  {
    title: "Diarista",
    description: "Limpeza residencial",
    icon: Trash2,
    slug: "diarista",
  },
]
