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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, ArrowLeft, User, Phone } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AvatarUpload } from "@/components/avatar-upload";

// Esquema de validação para o formulário de perfil pessoal
const personalProfileSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  address: z.string().min(3, "Endereço é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  postalCode: z.string().optional(),
});

// Esquema de validação para o formulário de perfil profissional
const professionalProfileSchema = z.object({
  bio: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  category: z.string().uuid("Selecione uma categoria válida"),
  available: z.boolean(),
});

// Esquema de validação para o formulário de contato
const contactProfileSchema = z.object({
  whatsapp: z.string().min(10, "Número de WhatsApp inválido"),
});

type PersonalProfileFormValues = z.infer<typeof personalProfileSchema>;
type ProfessionalProfileFormValues = z.infer<typeof professionalProfileSchema>;
type ContactProfileFormValues = z.infer<typeof contactProfileSchema>;

// Tipo para categorias
type Category = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  icon?: string;
  description?: string;
};

export default function EditProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingProfessional, setSavingProfessional] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Formulários
  const personalForm = useForm<PersonalProfileFormValues>({
    resolver: zodResolver(personalProfileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
    },
  });

  const professionalForm = useForm<ProfessionalProfileFormValues>({
    resolver: zodResolver(professionalProfileSchema),
    defaultValues: {
      bio: "",
      category: "",
      available: true,
    },
  });

  const contactForm = useForm<ContactProfileFormValues>({
    resolver: zodResolver(contactProfileSchema),
    defaultValues: {
      whatsapp: "",
    },
  });

  // Carregar dados do usuário e categorias
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verificar se o usuário está autenticado
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error("Erro ao verificar sessão: " + sessionError.message);
        }

        if (!session) {
          router.push("/entrar");
          return;
        }

        setUser(session.user);

        // Carregar perfil pessoal
        const { data: profileData, error: profileError } = await supabase
          .from("professionals")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          throw new Error("Erro ao carregar perfil: " + profileError.message);
        }

        // Carregar perfil profissional
        const { data: professionalData, error: professionalError } =
          await supabase
            .from("professionals")
            .select("*")
            .eq("id", session.user.id)
            .single();

        if (professionalError) {
          throw new Error(
            "Erro ao carregar perfil profissional: " + professionalError.message
          );
        }

        // Carregar categorias
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        if (categoriesError) {
          throw new Error(
            "Erro ao carregar categorias: " + categoriesError.message
          );
        }

        setCategories(categoriesData);
        setAvatarUrl(profileData.avatar_url);

        // Preencher formulário pessoal
        personalForm.reset({
          fullName: profileData.full_name || "",
          email: profileData.email || "",
          address: profileData.address || "",
          city: profileData.city || "",
          state: profileData.state || "",
          postalCode: profileData.postal_code || "",
        });

        // Preencher formulário profissional
        professionalForm.reset({
          bio: professionalData.bio || "",
          category: professionalData.category_id || "",
          available: professionalData.available || false,
        });

        // Preencher formulário de contato
        contactForm.reset({
          whatsapp: professionalData.whatsapp || "",
        });
      } catch (error: any) {
        console.error("Erro ao carregar dados:", error);
        setError(
          error.message ||
            "Ocorreu um erro ao carregar seus dados. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router, personalForm, professionalForm, contactForm]);

  // Função para salvar perfil pessoal
  const onSubmitPersonal = async (data: PersonalProfileFormValues) => {
    if (!user) return;

    setSavingPersonal(true);
    setError(null);

    try {
      // Atualizar perfil pessoal
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: data.fullName,
          email: data.email,
          address: data.address,
          city: data.city,
          state: data.state,
          postal_code: data.postalCode,
        })
        .eq("id", user.id);

      if (updateError) {
        throw new Error("Erro ao atualizar perfil: " + updateError.message);
      }

      toast({
        title: "Perfil pessoal atualizado",
        description: "Suas informações pessoais foram atualizadas com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao salvar perfil pessoal:", error);
      setError(
        error.message ||
          "Ocorreu um erro ao salvar suas informações pessoais. Tente novamente."
      );
    } finally {
      setSavingPersonal(false);
    }
  };

  // Função para salvar perfil profissional
  const onSubmitProfessional = async (data: ProfessionalProfileFormValues) => {
    if (!user) return;

    setSavingProfessional(true);
    setError(null);

    try {
      // Atualizar perfil profissional
      const { error: updateError } = await supabase
        .from("professionals")
        .update({
          bio: data.bio,
          category_id: data.category,
          available: data.available,
        })
        .eq("id", user.id);

      if (updateError) {
        throw new Error(
          "Erro ao atualizar perfil profissional: " + updateError.message
        );
      }

      toast({
        title: "Perfil profissional atualizado",
        description:
          "Suas informações profissionais foram atualizadas com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao salvar perfil profissional:", error);
      setError(
        error.message ||
          "Ocorreu um erro ao salvar suas informações profissionais. Tente novamente."
      );
    } finally {
      setSavingProfessional(false);
    }
  };

  // Função para salvar informações de contato
  const onSubmitContact = async (data: ContactProfileFormValues) => {
    if (!user) return;

    setSavingContact(true);
    setError(null);

    try {
      // Atualizar informações de contato
      const { error: updateError } = await supabase
        .from("professionals")
        .update({
          whatsapp: data.whatsapp,
        })
        .eq("id", user.id);

      if (updateError) {
        throw new Error(
          "Erro ao atualizar informações de contato: " + updateError.message
        );
      }

      toast({
        title: "Informações de contato atualizadas",
        description:
          "Suas informações de contato foram atualizadas com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao salvar informações de contato:", error);
      setError(
        error.message ||
          "Ocorreu um erro ao salvar suas informações de contato. Tente novamente."
      );
    } finally {
      setSavingContact(false);
    }
  };

  // Função para lidar com a mudança de avatar
  const handleAvatarChange = (url: string | null) => {
    setAvatarUrl(url);
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center px-4 py-16">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="mb-6 flex items-center">
        <Button variant="outline" asChild className="mr-4">
          <Link href="/area-profissional">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Editar Perfil</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mx-auto max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
            <CardDescription>
              Adicione ou altere sua foto de perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {user && (
              <AvatarUpload
                userId={user.id}
                initialAvatarUrl={avatarUrl}
                userName={personalForm.getValues("fullName")}
                onAvatarChange={handleAvatarChange}
              />
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Pessoal
            </TabsTrigger>
            <TabsTrigger value="professional">Profissional</TabsTrigger>
            <TabsTrigger value="contact">
              <Phone className="mr-2 h-4 w-4" />
              Contato
            </TabsTrigger>
          </TabsList>

          {/* Aba de Informações Pessoais */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...personalForm}>
                  <form
                    onSubmit={personalForm.handleSubmit(onSubmitPersonal)}
                    className="space-y-4"
                  >
                    <FormField
                      control={personalForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite seu nome completo"
                              {...field}
                              disabled={savingPersonal}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personalForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="seu@email.com"
                              {...field}
                              disabled={savingPersonal}
                            />
                          </FormControl>
                          <FormDescription>
                            Este é o email associado à sua conta. Para
                            alterá-lo, você precisará verificar o novo email.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={personalForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Rua, número, bairro"
                                {...field}
                                disabled={savingPersonal}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalForm.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="00000-000"
                                {...field}
                                disabled={savingPersonal}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={personalForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Sua cidade"
                                {...field}
                                disabled={savingPersonal}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="UF"
                                {...field}
                                disabled={savingPersonal}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="mt-4"
                      disabled={savingPersonal}
                    >
                      {savingPersonal ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar informações pessoais"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Informações Profissionais */}
          <TabsContent value="professional">
            <Card>
              <CardHeader>
                <CardTitle>Informações Profissionais</CardTitle>
                <CardDescription>
                  Atualize suas informações profissionais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...professionalForm}>
                  <form
                    onSubmit={professionalForm.handleSubmit(
                      onSubmitProfessional
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={professionalForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria Principal</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              disabled={savingProfessional}
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
                      control={professionalForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição profissional</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva seus serviços, experiência e qualificações"
                              className="min-h-[150px]"
                              {...field}
                              disabled={savingProfessional}
                            />
                          </FormControl>
                          <FormDescription>
                            Esta descrição será exibida em seu perfil público.
                            Seja detalhado sobre seus serviços e experiência.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={professionalForm.control}
                      name="available"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Disponibilidade
                            </FormLabel>
                            <FormDescription>
                              Ative para mostrar que está disponível para novos
                              serviços
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={savingProfessional}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="mt-4"
                      disabled={savingProfessional}
                    >
                      {savingProfessional ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar informações profissionais"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Informações de Contato */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
                <CardDescription>
                  Atualize suas informações de contato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...contactForm}>
                  <form
                    onSubmit={contactForm.handleSubmit(onSubmitContact)}
                    className="space-y-4"
                  >
                    <FormField
                      control={contactForm.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(99) 99999-9999"
                              {...field}
                              disabled={savingContact}
                            />
                          </FormControl>
                          <FormDescription>
                            Este número será usado para que clientes entrem em
                            contato com você
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="mt-4"
                      disabled={savingContact}
                    >
                      {savingContact ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar informações de contato"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
