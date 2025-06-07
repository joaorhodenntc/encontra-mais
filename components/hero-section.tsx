"use client"

import type React from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const serviceCategories = [
  { name: "Eletricista", slug: "eletricista", icon: "/raio.png" },
  { name: "Encanador", slug: "encanador", icon: "/agua.png" },
  { name: "Pintor", slug: "pintor", icon: "/pincel.png" },
  { name: "Pedreiro", slug: "pedreiro", icon: "/martelo.png" },
  { name: "Marceneiro", slug: "marceneiro", icon: "/tesoura.png" },
  { name: "Diarista", slug: "diarista", icon: "/lixeira.png" },
]

export function HeroSection() {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = () => {
    // Construir a URL de busca com os parâmetros
    const searchParams = new URLSearchParams()
    if (searchTerm) searchParams.set("q", searchTerm)

    // Redirecionar para a página de busca com os parâmetros
    window.location.href = `/buscar?${searchParams.toString()}`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <section className="relative bg-gradient-to-b from-[#f97316] to-[#ea580c] text-white pb-24">
      <div className="container px-4 py-16 md:py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Encontre os melhores profissionais gratuitamente
            </h1>
            <p className="mb-10 text-xl text-white/90">
            Seu marketplace de serviços: encontre ou divulgue com praticidade.
            </p>

            <div className="bg-white rounded-lg p-2 flex shadow-lg mb-8">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="O que você está procurando? Ex: Eletricista"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white" onClick={handleSearch}>
                Buscar
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button className="bg-white text-[#f97316] hover:bg-white/90" asChild>
                <Link href="/buscar">Explorar serviços</Link>
              </Button>
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
                <Link href="/planos">Sou profissional</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 mx-auto">
            {serviceCategories.map((category) => (
              <Link key={category.name} href={`/buscar?q=${category.slug}`}>
                <div className="rounded-xl w-[120px] h-[120px] md:w-[144px] md:h-[144px] flex items-center justify-center transition-all hover:scale-105">
                  <Image
                    src={category.icon}
                    alt={category.name}
                    width={144}
                    height={144}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-white/80">Mais de 500 profissionais cadastrados em todo o Brasil</p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16">
        <svg
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%", transform: "rotate(180deg)" }}
        >
          <path d="M0 120L1200 16.48V0L0 0z" fill="white" />
        </svg>
      </div>
    </section>
  )
}