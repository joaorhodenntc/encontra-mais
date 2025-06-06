"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hammer, QrCode } from "lucide-react";

interface InstagramStoryProps {
  name: string;
  profession: string;
  avatarUrl?: string;
  customMessage?: string;
}

export function InstagramStory({ 
  name, 
  profession, 
  avatarUrl,
  customMessage = "Me encontra na Encontramais!"
}: InstagramStoryProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="w-[1080px] h-[1920px] relative bg-[#f97316] text-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="grid grid-cols-8 gap-8 p-8 rotate-12 scale-150">
            {Array.from({ length: 64 }).map((_, i) => (
              <Hammer key={i} className="w-full h-full" />
            ))}
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" />
      </div>

      <div className="relative h-full flex flex-col items-center justify-between py-32">
        <div className="text-center">
          <h1 className="text-7xl font-bold tracking-tight">
            Encontra<span className="text-white">mais</span>
          </h1>
          <p className="text-2xl mt-4 text-white/90">encontramais.com.br</p>
        </div>

        <div className="text-center space-y-12 flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-8">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-white/30 to-white/10 rounded-full blur-xl" />
            <Avatar className="w-80 h-80 border-8 border-white/20 relative">
              <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
              <AvatarFallback className="text-6xl bg-white/10">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-6xl font-bold">{name}</h2>
            <p className="text-3xl text-white/90">{profession}</p>
          </div>

          <p className="text-4xl font-medium text-center">
            {customMessage}
          </p>
        </div>

        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-white/20 rounded-3xl blur-lg" />
            
            <div className="bg-white p-8 rounded-3xl relative">
              <div className="absolute inset-0 border-4 border-[#f97316]/20 rounded-3xl" />
              
              <div className="relative">
                <QrCode className="w-48 h-48 text-[#f97316]" strokeWidth={1.5} />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white p-2 rounded-lg">
                    <div className="text-xl font-bold text-[#f97316]">E+</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-2xl max-w-2xl text-center text-white/90 px-8">
            Escaneie o QR Code e conheça meu perfil completo!
          </p>
        </div>
      </div>
    </div>
  );
} 