import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, MessageCircle } from "lucide-react"
import Link from "next/link"

export function FeaturedProfessionals() {
  return (
    <section className="container px-4 py-16">
      <div className="mb-10 text-center">
        <h2 className="mb-2 text-3xl font-bold tracking-tight">Profissionais em Destaque</h2>
        <p className="text-muted-foreground">Conheça alguns dos nossos profissionais qualificados</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {professionals.map((professional) => (
          <Card key={professional.id} className="overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-[#f97316]">
                  <AvatarImage
                    src={professional.avatar || "/placeholder.svg?height=40&width=40"}
                    alt={professional.name}
                  />
                  <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{professional.name}</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {professional.categories.map((category) => (
                      <Badge key={category} variant="outline" className="bg-[#fff7ed] text-[#f97316]">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    {professional.location}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{professional.description}</p>
              </div>
              <div className="mt-4">
                <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                  <a href={`https://wa.me/${professional.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contatar via WhatsApp
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <Link href="/buscar">Ver todos os profissionais</Link>
        </Button>
      </div>
    </section>
  )
}

const professionals = [
  {
    id: 1,
    name: "João Silva",
    avatar: "/placeholder.svg?height=40&width=40",
    categories: ["Eletricista"],
    location: "Vila Mariana - SP",
    description:
      "Eletricista com mais de 10 anos de experiência em instalações residenciais e comerciais. Atendimento rápido e serviço de qualidade.",
    whatsapp: "5511987654321",
  },
  {
    id: 2,
    name: "Maria Santos",
    avatar: "/placeholder.svg?height=40&width=40",
    categories: ["Diarista"],
    location: "Copacabana - RJ",
    description:
      "Diarista com experiência em limpeza residencial e comercial. Atendimento personalizado e produtos de qualidade.",
    whatsapp: "5521987654321",
  },
  {
    id: 3,
    name: "Carlos Oliveira",
    avatar: "/placeholder.svg?height=40&width=40",
    categories: ["Pedreiro", "Pintor"],
    location: "Savassi - MG",
    description:
      "Pedreiro especializado em reformas e construções. Também realizo serviços de pintura com acabamento de qualidade.",
    whatsapp: "5531987654321",
  },
]
