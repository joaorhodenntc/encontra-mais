"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AssinarPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
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

        // Verificar se já tem assinatura ativa
      } catch (error) {
        console.error("Erro geral:", error);
        router.push("/entrar");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const handleSubscribe = async () => {
    try {
      setLoadingPayment(true);

      // Aqui você vai integrar com o AbacatePay
      // Este é um exemplo de como seria a integração
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar assinatura");
      }

      // Redirecionar para a página de pagamento do AbacatePay
      window.location.href = data.paymentUrl;
    } catch (error: any) {
      console.error("Erro ao criar assinatura:", error);
      toast({
        title: "Erro ao processar pagamento",
        description:
          error.message || "Ocorreu um erro ao processar seu pagamento.",
        variant: "destructive",
      });
    } finally {
      setLoadingPayment(false);
    }
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
        <Button onClick={() => router.push("/area-profissional")}>
          Voltar para área profissional
        </Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Assinar Plano Premium</CardTitle>
            <CardDescription>
              Aproveite todos os recursos disponíveis com nosso plano premium
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Benefícios do Plano Premium
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Perfil destacado nos resultados de busca</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Estatísticas avançadas de visualizações</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Suporte prioritário</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Sem anúncios</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Plano Premium</p>
                    <p className="text-sm text-muted-foreground">
                      Cobrança mensal
                    </p>
                  </div>
                  <p className="text-2xl font-bold">R$ 29,90</p>
                </div>
              </div>

              <Button
                className="w-full bg-[#f97316] hover:bg-[#ea580c]"
                onClick={handleSubscribe}
                disabled={loadingPayment}
              >
                {loadingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Assinar Agora"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Cancele a qualquer momento. Reembolso em até 7 dias.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
