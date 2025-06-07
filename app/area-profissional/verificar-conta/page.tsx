"use client";

import { useState } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1380742365236563998/LTFEpAZDDVMgXMXAT7B_VJyESlq3gwxCKVJQHB9GG0tpcTUqZElJvFMNcm73eBX5MYoQ";

export default function VerificarContaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }
      setDocumentFile(file);
    }
  };

  const sendDiscordNotification = async (professional: any, documentUrl: string) => {
    try {
      const embed = {
        title: "🔍 Nova Verificação de Identidade",
        color: 16776960, // Amarelo
        fields: [
          {
            name: "👤 Profissional",
            value: professional.full_name,
            inline: true
          },
          {
            name: "📧 Email",
            value: professional.email,
            inline: true
          },
          {
            name: "📱 Telefone",
            value: professional.phone || "Não informado",
            inline: true
          },
          {
            name: "📄 Documento",
            value: `[Clique para ver](${documentUrl})`,
            inline: false
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: "Encontra+ - Sistema de Verificação"
        }
      };

      await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [embed],
        }),
      });
    } catch (error) {
      console.error("Erro ao enviar notificação para o Discord:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentFile) {
      toast({
        title: "Arquivo não selecionado",
        description: "Por favor, selecione um documento para upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload do documento
      const fileExt = documentFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `verification-documents/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("documents")
        .upload(filePath, documentFile, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        console.error("Erro detalhado do upload:", uploadError);
        throw new Error(`Erro ao fazer upload do documento: ${uploadError.message}`);
      }

      if (!uploadData) {
        throw new Error("Erro ao fazer upload do documento: Nenhum dado retornado");
      }

      // Obter URL pública do documento
      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      // Obter dados do profissional
      const { data: { user } } = await supabase.auth.getUser();

      const { data: professional } = await supabase
        .from("professionals")
        .select("*")
        .eq("id", user?.id)
        .single();

      // Atualizar status de verificação
      const { error: updateError } = await supabase
        .from("professionals")
        .update({
          verified: false, // Mantém como false até ser aprovado
          verification_status: "submitted" // Adiciona o status de submetido
        })
        .eq("id", user?.id);

      if (updateError) {
        throw new Error("Erro ao atualizar status de verificação");
      }

      // Enviar notificação para o Discord
      await sendDiscordNotification(professional, publicUrl);

      toast({
        title: "Documento enviado",
        description: "Seu documento foi enviado com sucesso. Aguarde a verificação.",
      });

      router.push("/area-profissional");
    } catch (err) {
      console.error("Erro ao enviar documento:", err);
      setError("Ocorreu um erro ao enviar o documento. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Verificação de Identidade</CardTitle>
          <CardDescription>
            Envie um documento oficial com foto para verificar sua identidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="document">Documento de Identidade</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                {documentFile && (
                  <span className="text-sm text-muted-foreground">
                    {documentFile.name}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Formatos aceitos: JPG, PNG, PDF. Tamanho máximo: 5MB
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Documentos aceitos:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>RG (frente e verso)</li>
                <li>CNH</li>
                <li>Passaporte</li>
              </ul>
            </div>

            <Alert>
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription className="text-sm">
                Seus dados serão tratados com total sigilo e segurança. O documento
                será utilizado apenas para verificação de identidade.
              </AlertDescription>
            </Alert>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading || !documentFile}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Enviar Documento
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 