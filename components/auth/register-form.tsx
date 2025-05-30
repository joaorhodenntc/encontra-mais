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
  cep: z.string().min(8, "CEP inválido").max(9, "CEP inválido"),
  state: z.string().min(2, "Estado é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  location: z.string().min(3, "Endereço é obrigatório"),
  number: z.string().min(0, "Número não é obrigatório"),
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres"),
  category: z.string().uuid("Selecione uma categoria válida"),
  terms: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

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
  const [loadingCep, setLoadingCep] = useState(false);

  // Buscar categorias do Supabase ao carregar o componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);

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

        if (data && data.length > 0) {
          setCategories(data);
        } else {
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

  // Função para buscar endereço pelo CEP
  const fetchAddressByCep = async (cep: string) => {
    try {
      setLoadingCep(true);
      const cleanCep = cep.replace(/\D/g, "");

      if (cleanCep.length !== 8) {
        return;
      }

      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );
      const data = await response.json();

      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Por favor, verifique o CEP informado.",
          variant: "destructive",
        });
        return;
      }

      form.setValue("state", data.uf);
      form.setValue("city", data.localidade);
      form.setValue("location", data.logradouro);
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast({
        title: "Erro ao buscar CEP",
        description: "Não foi possível buscar o endereço. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingCep(false);
    }
  };

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length <= 2) {
      return cleanValue;
    }
    if (cleanValue.length <= 7) {
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;
    }
    return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(
      2,
      7
    )}-${cleanValue.slice(7, 11)}`;
  };

  // Configurar o formulário com React Hook Form e Zod
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      cep: "",
      state: "",
      city: "",
      location: "",
      number: "",
      description: "",
      category: "",
      terms: false,
    },
  });

  // Função para formatar CEP
  const formatCep = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length <= 5) {
      return cleanValue;
    }
    return `${cleanValue.slice(0, 5)}-${cleanValue.slice(5, 8)}`;
  };

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
          cep: data.cep.replace(/\D/g, ""),
          state: data.state,
          city: data.city,
          address: `${data.location}, ${data.number}`,
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
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(99) 99999-9999"
                      {...field}
                      onChange={(e) => {
                        const formattedValue = formatPhone(e.target.value);
                        field.onChange(formattedValue);
                      }}
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00000-000"
                        {...field}
                        onChange={(e) => {
                          const formattedValue = formatCep(e.target.value);
                          field.onChange(formattedValue);
                          if (formattedValue.length === 9) {
                            fetchAddressByCep(formattedValue);
                          }
                        }}
                        disabled={isLoading || loadingCep}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="UF"
                        {...field}
                        disabled={isLoading || loadingCep}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cidade"
                        {...field}
                        disabled={isLoading || loadingCep}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rua, Avenida, etc"
                        {...field}
                        disabled={isLoading || loadingCep}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Número"
                        {...field}
                        disabled={isLoading || loadingCep}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
