"use client";

import { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Esquema de validação para o formulário de recuperação de senha
const resetPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetEmail, setResetEmail] = useState<string | null>(null);

  // Configurar o formulário com React Hook Form e Zod
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    setFormError(null);

    try {
      // Enviar email de recuperação de senha
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/redefinir-senha`,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Sucesso
      setResetSuccess(true);
      setResetEmail(data.email);
    } catch (error: any) {
      console.error("Erro ao solicitar recuperação de senha:", error);
      setFormError(
        error.message ||
          "Ocorreu um erro ao processar sua solicitação. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Se a solicitação foi bem-sucedida, mostrar mensagem de confirmação
  if (resetSuccess) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Email Enviado</CardTitle>
          <CardDescription>
            Verifique seu email para redefinir sua senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">
              Solicitação enviada com sucesso
            </AlertTitle>
            <AlertDescription>
              Enviamos um email para <strong>{resetEmail}</strong> com
              instruções para redefinir sua senha. Por favor, verifique sua
              caixa de entrada e spam.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              O link de recuperação de senha é válido por 24 horas. Se você não
              receber o email, verifique sua pasta de spam ou solicite um novo
              link.
            </p>

            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link href="/entrar">Voltar para o login</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container flex items-center justify-center px-4 py-16">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
          <CardDescription>
            Digite seu email para receber um link de recuperação de senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar link de recuperação"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Lembrou sua senha?{" "}
            <Link href="/entrar" className="text-primary hover:underline">
              Voltar para o login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
