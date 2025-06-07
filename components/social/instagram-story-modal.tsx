"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Loader2 } from "lucide-react";
import { InstagramStory } from "./instagram-story";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import html2canvas from "html2canvas";

interface InstagramStoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional: {
    full_name: string;
    avatar_url: string | null;
  };
  category: {
    name: string;
  };
}

export function InstagramStoryModal({
  open,
  onOpenChange,
  professional,
  category,
}: InstagramStoryModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [customMessage, setCustomMessage] = useState(
    "Me encontra na Encontramais!"
  );

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    if (newMessage.length <= 40) {
      setCustomMessage(newMessage);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const storyElement = document.querySelector(
        "#story-preview"
      ) as HTMLElement;
      if (!storyElement) return;

      const originalClassName = storyElement.className;
      storyElement.className = "w-[1080px] h-[1920px]";

      const canvas = await html2canvas(storyElement, {
        useCORS: true,
        width: 1080,
        height: 1920,
        logging: false,
      });

      storyElement.className = originalClassName;

      const image = canvas.toDataURL("image/png", 1.0);

      const link = document.createElement("a");
      link.download = `encontramais-story-${professional.full_name
        .toLowerCase()
        .replace(/\s+/g, "-")}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Erro ao gerar story:", error);
      alert("Ocorreu um erro ao gerar o story. Por favor, tente novamente.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-w-screen-lg max-h-[90vh]">
        <div className="bg-white border-b">
          <DialogHeader className="px-6 py-4">
            <DialogTitle>Story para Instagram</DialogTitle>
            <DialogDescription>
              Visualize e baixe seu story personalizado
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex items-center justify-center">
              <div className="aspect-[9/16] w-full max-w-[280px] mx-auto overflow-hidden rounded-xl border shadow-lg bg-gradient-to-br from-orange-100 to-orange-50 p-2">
                <div className="relative w-full h-full rounded-lg overflow-hidden shadow-inner">
                  <div
                    id="story-preview"
                    className="scale-[0.2593] origin-top-left w-[1080px] h-[1920px]"
                  >
                    <InstagramStory
                      name={professional.full_name}
                      profession={category.name}
                      avatarUrl={professional.avatar_url || undefined}
                      customMessage={customMessage}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-message">Mensagem personalizada</Label>
                  <Input
                    id="custom-message"
                    value={customMessage}
                    onChange={handleMessageChange}
                    placeholder="Digite sua mensagem personalizada"
                    maxLength={40}
                  />
                  <div className="flex justify-end text-xs text-muted-foreground">
                    <span
                      className={
                        customMessage.length === 40
                          ? "text-orange-500 font-medium"
                          : ""
                      }
                    >
                      {customMessage.length}/40 caracteres
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <h3 className="font-semibold">Como usar:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Personalize sua mensagem acima (opcional)</li>
                    <li>Clique no botão "Baixar Story" abaixo</li>
                    <li>Abra o Instagram no seu celular</li>
                    <li>Toque no ícone "+" e selecione "Story"</li>
                    <li>Escolha a imagem baixada da sua galeria</li>
                    <li>Publique o story e comece a atrair mais clientes!</li>
                  </ol>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-[#f97316] hover:bg-[#ea580c]"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Story
                  </>
                )}
              </Button>

              <Alert>
                <AlertTitle>Dica profissional</AlertTitle>
                <AlertDescription className="text-sm">
                  Publique este story nos destaques do seu perfil para que os
                  clientes sempre possam encontrar seu perfil profissional na
                  plataforma.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
