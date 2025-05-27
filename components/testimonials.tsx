import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export function Testimonials() {
  return (
    <section className="bg-muted/50 py-12 md:py-16 lg:py-20">
      <div className="container px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">O que nossos clientes dizem</h2>
          <p className="text-muted-foreground">
            Depoimentos de pessoas que encontraram os melhores profissionais em nossa plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full">
              <CardHeader className="pb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating ? "fill-primary text-primary" : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{testimonial.content}</p>
              </CardContent>
              <CardFooter>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

const testimonials = [
  {
    content:
      "Encontrei um eletricista excelente através do EncontraMais. O serviço foi rápido, de qualidade e com preço justo. Recomendo a todos!",
    rating: 5,
    name: "Juliana Mendes",
    location: "São Paulo, SP",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    content:
      "Precisava de um professor particular de matemática para meu filho e encontrei profissionais qualificados rapidamente. A plataforma é muito fácil de usar.",
    rating: 5,
    name: "Roberto Almeida",
    location: "Rio de Janeiro, RJ",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    content:
      "Contratei uma designer de interiores para renovar meu apartamento. O resultado foi incrível e todo o processo de contratação foi simples e seguro.",
    rating: 4,
    name: "Fernanda Costa",
    location: "Belo Horizonte, MG",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    content:
      "Como desenvolvedor freelancer, a plataforma me ajudou a encontrar novos clientes e expandir meu negócio. A interface é intuitiva e as ferramentas são excelentes.",
    rating: 5,
    name: "Lucas Oliveira",
    location: "Curitiba, PR",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    content:
      "Encontrei uma diarista maravilhosa que agora trabalha regularmente em minha casa. O sistema de avaliações me ajudou a escolher a profissional certa.",
    rating: 5,
    name: "Mariana Santos",
    location: "Brasília, DF",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    content:
      "A plataforma facilitou muito a busca por um encanador para resolver um problema urgente. Em poucas horas, o serviço estava resolvido.",
    rating: 4,
    name: "Pedro Henrique",
    location: "Salvador, BA",
    avatar: "/placeholder.svg?height=100&width=100",
  },
]
