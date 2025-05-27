"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, Mail } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Esquema de validação para o formulário de login
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Configurar o formulário com React Hook Form e Zod
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      // 1. Tentar fazer login
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (authError) {
        console.log(authError);
        // Tratamento específico para erros comuns
        if (authError.message.includes("Invalid login credentials")) {
          setLoginError("Email ou senha incorretos.");
        } else if (authError.message.includes("Email not confirmed")) {
          // Tentar fazer login novamente sem verificação de email
          const { data: retryData, error: retryError } =
            await supabase.auth.signInWithPassword({
              email: data.email,
              password: data.password,
            });

          if (retryError) {
            setLoginError("Email ou senha incorretos.");
            return;
          }

          // Se o login foi bem sucedido, continuar com o fluxo normal
          const { data: professionalData, error: professionalError } =
            await supabase
              .from("professionals")
              .select("id, verified")
              .eq("id", retryData.user.id)
              .single();

          if (professionalError) {
            console.error(
              "Erro ao verificar perfil profissional:",
              professionalError
            );
            setLoginError(
              "Erro ao verificar seu perfil profissional. Tente novamente."
            );
            await supabase.auth.signOut();
            return;
          }

          if (!professionalData) {
            setLoginError(
              "Seu perfil profissional não foi encontrado. Entre em contato com o suporte."
            );
            await supabase.auth.signOut();
            return;
          }

          if (!professionalData.verified) {
            setLoginError(
              "Seu perfil ainda não foi verificado. Entre em contato com o suporte."
            );
            await supabase.auth.signOut();
            return;
          }

          toast({
            title: "Login realizado com sucesso!",
            description: "Você será redirecionado para a área do profissional.",
          });

          router.push("/area-profissional");
          router.refresh();
          return;
        } else if (authError.message.includes("Too many requests")) {
          setLoginError(
            "Muitas tentativas de login. Tente novamente em alguns minutos."
          );
        } else {
          setLoginError(authError.message);
        }
        return;
      }

      if (!authData.user) {
        setLoginError("Erro ao fazer login. Tente novamente.");
        return;
      }

      // 2. Verificar se o usuário tem um perfil profissional
      const { data: professionalData, error: professionalError } =
        await supabase
          .from("professionals")
          .select("id, verified")
          .eq("id", authData.user.id)
          .single();

      if (professionalError) {
        console.error(
          "Erro ao verificar perfil profissional:",
          professionalError
        );
        setLoginError(
          "Erro ao verificar seu perfil profissional. Tente novamente."
        );
        // Fazer logout para limpar a sessão
        await supabase.auth.signOut();
        return;
      }

      if (!professionalData) {
        setLoginError(
          "Seu perfil profissional não foi encontrado. Entre em contato com o suporte."
        );
        // Fazer logout para limpar a sessão
        await supabase.auth.signOut();
        return;
      }

      // 3. Verificar se o profissional está verificado
      if (!professionalData.verified) {
        setLoginError(
          "Seu perfil ainda não foi verificado. Entre em contato com o suporte."
        );
        // Fazer logout para limpar a sessão
        await supabase.auth.signOut();
        return;
      }

      // 4. Login bem-sucedido
      toast({
        title: "Login realizado com sucesso!",
        description: "Você será redirecionado para a área do profissional.",
      });

      // 5. Redirecionar para a área do profissional
      router.push("/area-profissional");
      router.refresh();
    } catch (error: any) {
      console.error("Erro no login:", error);
      setLoginError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Entrar</CardTitle>
        <CardDescription>Acesse sua conta de profissional</CardDescription>
      </CardHeader>
      <CardContent>
        {loginError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Senha</FormLabel>
                    <Link
                      href="/recuperar-senha"
                      className="text-xs text-primary hover:underline"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Digite sua senha"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Lembrar de mim</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6">
          <p className="text-center text-sm text-muted-foreground">
            Ao fazer login, você concorda com nossos{" "}
            <Link href="/termos" className="text-primary hover:underline">
              Termos de Serviço
            </Link>{" "}
            e{" "}
            <Link href="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="text-primary hover:underline">
            Cadastre-se
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
