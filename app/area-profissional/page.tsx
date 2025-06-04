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
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

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
      <div className="container flex items-center justify-center px-4 py-16">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!user || !professional) {
    return (
      <div className="container flex items-center justify-center px-4 py-16">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Área do Profissional</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/area-profissional/editar-perfil">
              <Edit className="mr-2 h-4 w-4" />
              Editar Perfil
            </Link>
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:row-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 mt-2">
              <Avatar className="h-24 w-24 border-4 border-[#f97316]">
                <AvatarImage
                  src={professional.avatar_url || ""}
                  alt={professional.full_name}
                />
                <AvatarFallback>
                  {getInitials(professional.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-xl font-semibold">
                  {professional.full_name}
                </h3>
                <div className="flex items-center justify-center sm:justify-start text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  {professional.address || "Localização não informada"}
                </div>
                <div className="flex items-center justify-center sm:justify-start text-muted-foreground">
                  <Phone className="mr-1 h-4 w-4" />
                  {professional.phone
                    ? formatPhone(professional.phone)
                    : "Telefone não informado"}
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      professional.available
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {professional.available ? "Disponível" : "Indisponível"}
                  </span>
                  {category && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-[#fff7ed] px-2.5 py-0.5 text-xs font-semibold text-[#f97316]">
                      {category.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-medium">Sobre</h4>
              <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                {professional.description || "Nenhuma descrição fornecida."}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/area-profissional/editar-perfil">
                <Edit className="mr-2 h-4 w-4" />
                Editar Perfil
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seu Plano</CardTitle>
              <CardDescription>
                {professional.subscription_status === "free"
                  ? "Plano Gratuito"
                  : "Plano Premium"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {professional.subscription_status === "free" ? (
                  <>
                    <p>
                      <strong>Plano atual:</strong> Gratuito
                    </p>
                    <p className="text-muted-foreground">
                      Aproveite todos os recursos com nosso plano Premium
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Valor:</strong> R$ 19,99/mês
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {subscription?.status === "active" ? "Ativo" : "Pendente"}
                    </p>
                    {subscription?.end_date && (
                      <p>
                        <strong>Próxima cobrança:</strong>{" "}
                        {new Date(subscription.end_date).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    )}
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {professional.subscription_status === "free" ? (
                <Button
                  className="w-full bg-[#f97316] hover:bg-[#ea580c]"
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

          <Card>
            <CardHeader>
              <CardTitle>Status da Conta</CardTitle>
              <CardDescription>
                {professional.verified
                  ? "Conta Verificada"
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
                    <p>Sua conta está verificada e ativa</p>
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
                      <p>Sua conta ainda não está verificada</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Para ter acesso a todos os recursos e aumentar sua
                      visibilidade, é necessário verificar sua conta.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {!professional.verified && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/area-profissional/verificar-conta">
                    Verificar Conta
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
            <CardDescription>Desempenho do seu perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm text-muted-foreground">Visualizações</p>
                <p className="mt-1 text-2xl font-bold">0</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm text-muted-foreground">Contatos</p>
                <p className="mt-1 text-2xl font-bold">0</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm text-muted-foreground">Dias ativos</p>
                <p className="mt-1 text-2xl font-bold">1</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm text-muted-foreground">
                  Taxa de resposta
                </p>
                <p className="mt-1 text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
