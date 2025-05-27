"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Filter, MessageCircle, User } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { setCookie, getCookie } from "cookies-next"

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Verificar se já temos a localização do usuário em cookies
  useEffect(() => {
    const locationCookie = getCookie("user-location")
    if (locationCookie) {
      try {
        setUserLocation(JSON.parse(locationCookie as string))
      } catch (e) {
        console.error("Erro ao processar cookie de localização:", e)
      }
    } else {
      // Se não temos a localização, solicitar permissão
      requestUserLocation()
    }
  }, [])

  // Função para solicitar a localização do usuário
  const requestUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(location)
          setCookie("user-location", JSON.stringify(location), { maxAge: 60 * 60 * 24 * 30 }) // 30 dias
        },
        (error) => {
          console.error("Erro ao obter localização:", error)
        },
      )
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const filteredProfessionals = professionals.filter((professional) => {
    // Filter by search term
    if (
      searchTerm &&
      !professional.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !professional.categories.some((category) => category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      !professional.location.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    // Filter by categories
    if (selectedCategories.length > 0 && !professional.categories.some((cat) => selectedCategories.includes(cat))) {
      return false
    }

    return true
  })

  return (
    <div className="container px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Buscar Profissionais</h1>

      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, categoria ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filtros
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>Refine sua busca por profissionais</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Categorias</h3>
                  {categories.map((category) => (
                    <div key={category.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.value}`}
                        checked={selectedCategories.includes(category.value)}
                        onCheckedChange={() => handleCategoryChange(category.value)}
                      />
                      <Label htmlFor={`category-${category.value}`}>{category.label}</Label>
                    </div>
                  ))}
                </div>

                <Button className="w-full">Aplicar Filtros</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProfessionals.length > 0 ? (
          filteredProfessionals.map((professional) => (
            <Card key={professional.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-[#f97316]">
                    <AvatarImage
                      src={professional.avatar || "/placeholder.svg?height=40&width=40"}
                      alt={professional.name}
                    />
                    <AvatarFallback>{professional.name.substring(0, 2)}</AvatarFallback>
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
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link href={`/profissionais/${professional.id}`}>
                      <User className="mr-2 h-4 w-4" />
                      Ver Perfil
                    </Link>
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" asChild>
                    <a href={`https://wa.me/${professional.whatsapp}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <h3 className="mb-2 text-xl font-semibold">Nenhum profissional encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar seus filtros ou buscar por outros termos.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const categories = [
  { value: "eletricista", label: "Eletricista" },
  { value: "encanador", label: "Encanador" },
  { value: "pintor", label: "Pintor" },
  { value: "pedreiro", label: "Pedreiro" },
  { value: "marceneiro", label: "Marceneiro" },
  { value: "diarista", label: "Diarista" },
]

// Dados simplificados dos profissionais
const professionals = [
  {
    id: "1",
    name: "Carlos Silva",
    categories: ["Eletricista"],
    location: "Vila Mariana - SP",
    avatar: "/placeholder.svg?height=40&width=40",
    whatsapp: "5511987654321",
    description: "Eletricista com mais de 10 anos de experiência em instalações residenciais e comerciais.",
  },
  {
    id: "2",
    name: "Ana Oliveira",
    categories: ["Diarista"],
    location: "Copacabana - RJ",
    avatar: "/placeholder.svg?height=40&width=40",
    whatsapp: "5521987654321",
    description: "Diarista com experiência em limpeza residencial e comercial. Atendimento personalizado.",
  },
  {
    id: "3",
    name: "Marcos Santos",
    categories: ["Pedreiro", "Pintor"],
    location: "Savassi - MG",
    avatar: "/placeholder.svg?height=40&width=40",
    whatsapp: "5531987654321",
    description: "Pedreiro especializado em reformas e construções. Também realizo serviços de pintura.",
  },
  {
    id: "4",
    name: "Roberto Almeida",
    categories: ["Encanador"],
    location: "Asa Sul - DF",
    avatar: "/placeholder.svg?height=40&width=40",
    whatsapp: "5561987654321",
    description: "Encanador com experiência em reparos de vazamentos e instalações hidráulicas.",
  },
  {
    id: "5",
    name: "Fernanda Lima",
    categories: ["Pintor"],
    location: "Barra - BA",
    avatar: "/placeholder.svg?height=40&width=40",
    whatsapp: "5571987654321",
    description: "Pintora profissional com experiência em pintura residencial e comercial.",
  },
  {
    id: "6",
    name: "José Pereira",
    categories: ["Marceneiro"],
    location: "Batel - PR",
    avatar: "/placeholder.svg?height=40&width=40",
    whatsapp: "5541987654321",
    description: "Marceneiro especializado em móveis planejados e restauração.",
  },
]
