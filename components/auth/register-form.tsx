"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Esquema de validação para o formulário de cadastro
const registerSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  phone: z.string().min(10, "Número de telefone inválido"),
  location: z.string().min(3, "Localização é obrigatória"),
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres"),
  category: z.string().uuid("Selecione uma categoria válida"),
  terms: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos",
  }),
});

type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  description: string;
  category: string;
  terms: boolean;
};

// Tipo para categorias
type Category = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  icon?: string;
  description?: string;
};

export function RegisterForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Buscar categorias do Supabase ao carregar o componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        console.log("Iniciando busca de categorias...");

        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("active", true)
          .order("name", { ascending: true });

        if (error) {
          console.error("Erro ao buscar categorias:", error);
          setFormError(
            "Erro ao carregar categorias. Por favor, recarregue a página."
          );
          return;
        }

        console.log("Dados recebidos:", data);

        if (data && data.length > 0) {
          console.log("Categorias carregadas com sucesso:", data.length);
          setCategories(data);
        } else {
          console.log("Nenhuma categoria encontrada");
          setFormError(
            "Não foram encontradas categorias ativas. Entre em contato com o suporte."
          );
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        setFormError(
          "Erro ao carregar categorias. Por favor, recarregue a página."
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Configurar o formulário com React Hook Form e Zod
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      location: "",
      description: "",
      category: "",
      terms: false,
    },
  });

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setFormError(null);

    try {
      // 1. Verificar se o email já está em uso
      const { data: userData, error: userError } = await supabase
        .from("professionals")
        .select("id")
        .eq("email", data.email)
        .maybeSingle();

      if (userError && !userError.message.includes("No rows found")) {
        console.error("Erro ao verificar email:", userError);
        throw new Error("Erro ao verificar disponibilidade do email");
      }

      if (userData) {
        setFormError("Este email já está sendo usado por outra conta.");
        setIsLoading(false);
        return;
      }

      // 2. Criar o usuário na autenticação sem verificação de email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
          emailRedirectTo: undefined,
        },
      });

      if (authError) {
        console.error("Erro na autenticação:", authError);

        // Tratamento específico para erros comuns
        if (authError.message.includes("already registered")) {
          throw new Error(
            "Este email já está registrado. Tente fazer login ou recuperar sua senha."
          );
        } else if (authError.message.includes("password")) {
          throw new Error(
            "A senha não atende aos requisitos de segurança. Use pelo menos 6 caracteres."
          );
        } else {
          throw new Error("Erro ao criar conta: " + authError.message);
        }
      }

      if (!authData.user) {
        throw new Error("Erro ao criar conta: usuário não foi criado");
      }

      // 3. Criar o perfil profissional
      const { error: professionalError } = await supabase
        .from("professionals")
        .insert({
          id: authData.user.id,
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          whatsapp: data.phone,
          address: data.location,
          description: data.description,
          category_id: data.category,
          available: true,
          verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (professionalError) {
        console.error("Erro ao criar profissional:", professionalError);
        throw new Error(
          "Erro ao criar perfil profissional: " + professionalError.message
        );
      }

      // 4. Redirecionar para a página inicial após o cadastro
      router.push("/");
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      setFormError(
        error.message ||
          "Ocorreu um erro ao processar seu cadastro. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Cadastro de Profissional</CardTitle>
        <CardDescription>
          Crie sua conta para oferecer seus serviços na plataforma
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
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite seu nome completo"
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
                  <FormDescription>
                    Você receberá um email de verificação neste endereço
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Crie uma senha segura"
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(99) 99999-9999"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Este número será usado para que clientes entrem em contato
                    com você
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localização</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Bairro - Cidade/UF"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Ex: Vila Mariana - São Paulo/SP
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria Principal</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isLoading || loadingCategories}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormDescription>
                    Selecione sua categoria principal de serviço
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva seus serviços, experiência e qualificações"
                      className="min-h-[120px]"
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
              name="terms"
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
                    <FormLabel>
                      Eu concordo com os{" "}
                      <Link
                        href="/termos"
                        className="text-primary hover:underline"
                      >
                        Termos de Serviço
                      </Link>{" "}
                      e{" "}
                      <Link
                        href="/privacidade"
                        className="text-primary hover:underline"
                      >
                        Política de Privacidade
                      </Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || loadingCategories}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : loadingCategories ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                "Criar conta"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link href="/entrar" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
