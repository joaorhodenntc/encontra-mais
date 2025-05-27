"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, MessageCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

// Tipo para o profissional
type Professional = {
  id: string
  name: string
  categories: string[]
  location: string
  avatar: string
  whatsapp: string
  description: string
}

export default function ProfessionalProfile() {
  const params = useParams()
  const { id } = params
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulando uma busca no banco de dados
    // Em uma implementação real, isso seria uma chamada de API
    const foundProfessional = professionals.find((p) => p.id === id)

    // Simulando um pequeno delay para mostrar o estado de carregamento
    setTimeout(() => {
      setProfessional(foundProfessional || null)
      setLoading(false)
    }, 500)
  }, [id])

  if (loading) {
    return (
      <div className="container flex items-center justify-center px-4 py-16">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-[#f97316] border-t-transparent mx-auto"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!professional) {
    return (
      <div className="container px-4 py-16">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Profissional não encontrado</h1>
          <p className="mb-8">O profissional que você está procurando não existe ou foi removido.</p>
          <Button asChild>
            <Link href="/buscar">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a busca
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/buscar">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a busca
          </Link>
        </Button>
      </div>

      <Card className="mx-auto max-w-3xl">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-[#f97316]">
              <AvatarImage src={professional.avatar || "/placeholder.svg?height=40&width=40"} alt={professional.name} />
              <AvatarFallback>{professional.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl md:text-3xl">{professional.name}</CardTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                {professional.categories.map((category) => (
                  <Badge key={category} variant="outline" className="bg-[#fff7ed] text-[#f97316]">
                    {category}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex items-center text-muted-foreground">
                <MapPin className="mr-1 h-5 w-5" />
                {professional.location}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-8">
            <h3 className="mb-2 text-lg font-medium">Sobre</h3>
            <p className="text-muted-foreground">{professional.description}</p>
          </div>

          <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" asChild>
            <a href={`https://wa.me/${professional.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              Contatar via WhatsApp
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Dados simulados dos profissionais
const professionals = [
  {
    id: "1",
    name: "Carlos Silva",
    categories: ["Eletricista"],
    location: "Vila Mariana - SP",
    avatar: "/placeholder.svg?height=40&width=40",
    whatsapp: "5511987654321",
    description:
      "Eletricista com mais de 10 anos de experiência em instalações residenciais e comerciais. Especializado em reparos elétricos, instalação de iluminação, quadros de energia e sistemas de segurança. Atendimento rápido e serviço de qualidade garantida. Disponível para emergências.",
  },
  {
    id: "2",
    name: "Ana Oliveira",
    categories: ["Diarista"],
    location: "Copacabana - RJ",
    avatar: "/placeholder.svg?height=40&width=40",
    whatsapp: "5521987654321",
    description:
      "Diarista com experiência em limpeza residencial e comercial. Atendimento personalizado e produtos de qualidade. Realizo limpeza completa, organização de ambientes, passadoria e limpezas pós-obra. Referências disponíveis e serviço de confiança.",
  },
  {
    id: "3",
    name: "Marcos Santos",
    categories: ["Pedreiro", "Pintor"],
    location: "Savassi - MG",
    avatar: "/placeholder.svg?height=40&width=40",
    whatsapp: "5531987654321",
    description:
      "Pedreiro especializado em reformas e construções. Também realizo serviços de pintura com acabamento de qualidade. Experiência em alvenaria, revestimentos, acabamentos e reformas em geral. Orçamento sem compromisso e trabalho com equipe qualificada quando necessário.",
  },
  {
    id: "4",
    name: "Roberto Almeida",
    categories: ["Encanador"],
    location: "Asa Sul - DF",
    avatar: "/placeholder.svg?height=40&width=40",
    whatsapp: "5561987654321",
    description:
      "Encanador com experiência em reparos de vazamentos, instalações hidráulicas e manutenção preventiva. Atendimento rápido e eficiente para problemas de encanamento, desentupimentos, instalação de pias, torneiras e chuveiros. Disponível para emergências.",
  },
  {
    id: "5",
    name: "Fernanda Lima",
    categories: ["Pintor"],
    location: "Barra - BA",
    avatar: "/placeholder.svg?height=40&width=40",
    whatsapp: "5571987654321",
    description:
      "Pintora profissional com experiência em pintura residencial e comercial. Trabalho limpo e acabamento perfeito. Especializada em texturas, efeitos decorativos, pintura de móveis e restauração. Utilizo materiais de qualidade e ofereço garantia do serviço.",
  },
  {
    id: "6",
    name: "José Pereira",
    categories: ["Marceneiro"],
    location: "Batel - PR",
    avatar: "/placeholder.svg?height=40&width=40",
    whatsapp: "5541987654321",
    description:
      "Marceneiro especializado em móveis planejados e restauração. Trabalho artesanal com materiais de qualidade. Faço móveis sob medida, restauração de peças antigas, instalação de armários e prateleiras. Atendimento personalizado e projetos exclusivos.",
  },
]
