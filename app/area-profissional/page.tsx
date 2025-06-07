"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  User,
  LogOut,
  AlertCircle,
  Edit,
  MapPin,
  Phone,
  Instagram,
  Star,
  Shield,
  CreditCard,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { InstagramStoryModal } from "@/components/social/instagram-story-modal";

type Professional = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  category_id: string;
  available: boolean;
  verified: boolean;
  verification_status: "pending" | "submitted" | "approved" | "rejected";
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  subscription_status: "free" | "premium";
};

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
};

type Subscription = {
  id: string;
  professional_id: string;
  status: "active" | "cancelled" | "pending";
  start_date: string;
  end_date: string | null;
  created_at: string;
};

export default function ProfessionalAreaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [storyModalOpen, setStoryModalOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Verificar se o usuário está autenticado
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Erro ao verificar sessão:", sessionError);
          router.push("/entrar");
          return;
        }

        if (!session) {
          router.push("/entrar");
          return;
        }

        setUser(session.user);

        // Buscar dados do profissional
        const { data: professionalData, error: professionalError } =
          await supabase
            .from("professionals")
            .select("*")
            .eq("id", session.user.id)
            .single();

        if (professionalError) {
          console.error(
            "Erro ao buscar dados do profissional:",
            professionalError
          );
          router.push("/entrar");
          return;
        }

        if (!professionalData) {
          router.push("/entrar");
          return;
        }

        setProfessional(professionalData);

        // Buscar categoria
        if (professionalData.category_id) {
          const { data: categoryData, error: categoryError } = await supabase
            .from("categories")
            .select("*")
            .eq("id", professionalData.category_id)
            .single();

          if (categoryError) {
            console.error("Erro ao buscar categoria:", categoryError);
          } else {
            setCategory(categoryData);
          }
        }

        // Buscar assinatura
        const { data: subscriptionData, error: subscriptionError } =
          await supabase
            .from("subscriptions")
            .select("*")
            .eq("professional_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (subscriptionError && subscriptionError.code !== "PGRST116") {
          console.error("Erro ao buscar assinatura:", subscriptionError);
        } else {
          setSubscription(subscriptionData);
        }
      } catch (error) {
        console.error("Erro geral:", error);
        router.push("/entrar");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erro ao fazer logout:", error);
        toast({
          title: "Erro ao sair",
          description: "Ocorreu um erro ao fazer logout.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  };

  // Função para gerar as iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Função para formatar telefone
  const formatPhone = (phone: string) => {
    if (!phone) return "";
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 11) return phone;
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(
      2,
      7
    )}-${cleanPhone.slice(7)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Carregando suas informações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container px-4 py-8">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/entrar")}>
            Voltar para o login
          </Button>
        </div>
      </div>
    );
  }

  if (!user || !professional) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Carregando suas informações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4">
        {/* Header com cor sólida */}
        <div className="mb-8 rounded-xl bg-[#f97316] p-6 text-white shadow-lg">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-4 border-white/20">
                <AvatarImage src={professional.avatar_url || ""} alt={professional.full_name} />
                <AvatarFallback className="text-black">{getInitials(professional.full_name)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{professional.full_name}</h1>
                <p className="text-white/80">{category?.name || "Categoria não definida"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setStoryModalOpen(true)}>
                <Instagram className="mr-2 h-4 w-4" />
                Gerar Story
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/area-profissional/editar-perfil">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Perfil
                </Link>
              </Button>
              <Button variant="secondary" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna 1: Informações do Perfil */}
          <div className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <User className="mr-2 h-5 w-5 text-[#f97316]" />
                  Informações do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-4">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{professional.address || "Localização não informada"}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>
                      {professional.phone
                        ? formatPhone(professional.phone)
                        : "Telefone não informado"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        professional.available
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {professional.available ? "Disponível" : "Indisponível"}
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Sobre</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {professional.description || "Nenhuma descrição fornecida."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2: Plano */}
          <div className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CreditCard className="mr-2 h-5 w-5 text-[#f97316]" />
                  Seu Plano
                </CardTitle>
                <CardDescription>
                  {professional.subscription_status === "free"
                    ? "Plano Gratuito"
                    : "Plano Premium"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {professional.subscription_status === "free" ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">Plano atual: Gratuito</p>
                          <p className="text-sm text-muted-foreground">
                            Aproveite todos os recursos com nosso plano Premium
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">Plano Premium</p>
                          <p className="text-sm text-muted-foreground">
                            R$ 29,90/mês
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">Status: {subscription?.status === "active" ? "Ativo" : "Pendente"}</p>
                          {subscription?.end_date && (
                            <p className="text-sm text-muted-foreground">
                              Próxima cobrança: {new Date(subscription.end_date).toLocaleDateString("pt-BR")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {professional.subscription_status === "free" ? (
                  <Button
                    className="w-full bg-[#f97316] hover:bg-[#ea580c] shadow-[0_4px_14px_0_rgb(249,115,22,0.39)] hover:shadow-[0_6px_20px_0_rgb(249,115,22,0.39)] transition-all duration-300"
                    asChild
                  >
                    <Link href="/area-profissional/assinar">Assinar Agora</Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full">
                    Gerenciar Assinatura
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Coluna 3: Status da Conta */}
          <div className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Shield className="mr-2 h-5 w-5 text-[#f97316]" />
                  Status da Conta
                </CardTitle>
                <CardDescription>
                  {professional.verified
                    ? "Conta Verificada"
                    : professional.verification_status === "submitted"
                    ? "Aguardando Verificação"
                    : professional.verification_status === "rejected"
                    ? "Verificação Rejeitada"
                    : "Conta Pendente de Verificação"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {professional.verified ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <div>
                        <p className="font-medium">Sua conta está verificada e ativa</p>
                        <p className="text-sm text-muted-foreground">
                          Aproveite todos os recursos da plataforma
                        </p>
                      </div>
                    </div>
                  ) : professional.verification_status === "submitted" ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <div>
                          <p className="font-medium">Documentos enviados para verificação</p>
                          <p className="text-sm text-muted-foreground">
                            Seus documentos estão sendo analisados pela nossa equipe
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : professional.verification_status === "rejected" ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-red-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        <div>
                          <p className="font-medium">Verificação rejeitada</p>
                          <p className="text-sm text-muted-foreground">
                            Por favor, envie novamente seus documentos
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-yellow-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div>
                          <p className="font-medium">Sua conta ainda não está verificada</p>
                          <p className="text-sm text-muted-foreground">
                            Verifique sua conta para aumentar sua visibilidade
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {!professional.verified && professional.verification_status !== "submitted" && (
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-[#f97316] hover:text-white transition-colors duration-300" 
                    asChild
                  >
                    <Link href="/area-profissional/verificar-conta">
                      {professional.verification_status === "rejected" 
                        ? "Enviar Documentos Novamente" 
                        : "Verificar Identidade"}
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>

        {professional && category && (
          <InstagramStoryModal
            open={storyModalOpen}
            onOpenChange={setStoryModalOpen}
            professional={professional}
            category={category}
          />
        )}
      </div>
    </div>
  );
}
