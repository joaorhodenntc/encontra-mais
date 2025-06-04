"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Search,
  Filter,
  MessageCircle,
  User,
  Loader2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { setCookie, getCookie } from "cookies-next";
import { supabase } from "@/lib/supabase/client";

type Professional = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  description: string;
  category_id: string;
  available: boolean;
  verified: boolean;
  avatar_url: string | null;
  subscription_status: "free" | "premium";
  category?: {
    name: string;
  };
};

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string }[]
  >([]);

  // Carregar profissionais e categorias
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Buscar categorias
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("id, name, slug")
          .eq("active", true)
          .order("name", { ascending: true });

        if (categoriesError) {
          console.error("Erro ao buscar categorias:", categoriesError);
          return;
        }

        setCategories(categoriesData);

        // Buscar profissionais
        const { data: professionalsData, error: professionalsError } =
          await supabase
            .from("professionals")
            .select(
              `
            *,
            category:categories(name)
          `
            )
            .eq("subscription_status", "premium")
            .eq("verified", true)
            .eq("available", true);

        if (professionalsError) {
          console.error("Erro ao buscar profissionais:", professionalsError);
          return;
        }

        setProfessionals(professionalsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Verificar se já temos a localização do usuário em cookies
  useEffect(() => {
    const locationCookie = getCookie("user-location");
    if (locationCookie) {
      try {
        setUserLocation(JSON.parse(locationCookie as string));
      } catch (e) {
        console.error("Erro ao processar cookie de localização:", e);
      }
    } else {
      // Se não temos a localização, solicitar permissão
      requestUserLocation();
    }
  }, []);

  // Função para solicitar a localização do usuário
  const requestUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setCookie("user-location", JSON.stringify(location), {
            maxAge: 60 * 60 * 24 * 30,
          }); // 30 dias
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
        }
      );
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredProfessionals = professionals.filter((professional) => {
    // Filter by search term
    if (
      searchTerm &&
      !professional.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      !professional.category?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      !professional.city.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !professional.state.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Filter by categories
    if (
      selectedCategories.length > 0 &&
      !selectedCategories.includes(professional.category_id)
    ) {
      return false;
    }

    return true;
  });

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
                <SheetDescription>
                  Refine sua busca por profissionais
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Categorias</h3>
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() =>
                          handleCategoryChange(category.id)
                        }
                      />
                      <Label htmlFor={`category-${category.id}`}>
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>

                <Button className="w-full">Aplicar Filtros</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProfessionals.length > 0 ? (
            filteredProfessionals.map((professional) => (
              <Card key={professional.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-[#f97316]">
                      <AvatarImage
                        src={professional.avatar_url || undefined}
                        alt={professional.full_name}
                      />
                      <AvatarFallback>
                        {professional.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">
                        {professional.full_name}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {professional.category && (
                          <Badge
                            variant="outline"
                            className="bg-[#fff7ed] text-[#f97316]"
                          >
                            {professional.category.name}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-4 w-4" />
                        {`${professional.city} - ${professional.state}`}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {professional.description}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/profissionais/${professional.id}`}>
                        <User className="mr-2 h-4 w-4" />
                        Ver Perfil
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      asChild
                    >
                      <a
                        href={`https://wa.me/${professional.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <h3 className="mb-2 text-xl font-semibold">
                Nenhum profissional encontrado
              </h3>
              <p className="text-muted-foreground">
                Tente ajustar seus filtros ou buscar por outros termos.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
