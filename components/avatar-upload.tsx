"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, X } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface AvatarUploadProps {
  userId: string
  initialAvatarUrl: string | null
  userName: string
  onAvatarChange: (url: string | null) => void
}

export function AvatarUpload({ userId, initialAvatarUrl, userName, onAvatarChange }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Função para gerar as iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Função para lidar com a seleção de arquivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar o tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem (JPG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validar o tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 2MB",
        variant: "destructive",
      })
      return
    }

    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Função para fazer upload do avatar
  const uploadAvatar = async () => {
    if (!fileInputRef.current?.files?.[0]) return

    const file = fileInputRef.current.files[0]
    setUploading(true)

    try {
      // Gerar um nome de arquivo único
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Fazer upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Obter a URL pública do avatar
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
      const newAvatarUrl = data.publicUrl

      // Atualizar o perfil do usuário com a nova URL do avatar
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: newAvatarUrl })
        .eq("id", userId)

      if (updateError) {
        throw updateError
      }

      // Atualizar o estado local
      setAvatarUrl(newAvatarUrl)
      setPreview(null)
      onAvatarChange(newAvatarUrl)

      toast({
        title: "Avatar atualizado",
        description: "Seu avatar foi atualizado com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao fazer upload do avatar:", error)
      toast({
        title: "Erro ao atualizar avatar",
        description: error.message || "Ocorreu um erro ao fazer upload do avatar",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Limpar o input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Função para remover o avatar
  const removeAvatar = async () => {
    if (!avatarUrl) return

    setUploading(true)

    try {
      // Extrair o caminho do arquivo da URL
      const filePathMatch = avatarUrl.match(/avatars\/(.+)/)
      if (filePathMatch && filePathMatch[0]) {
        // Remover o arquivo do storage
        await supabase.storage.from("avatars").remove([filePathMatch[0]])
      }

      // Atualizar o perfil do usuário
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId)

      if (updateError) {
        throw updateError
      }

      // Atualizar o estado local
      setAvatarUrl(null)
      setPreview(null)
      onAvatarChange(null)

      toast({
        title: "Avatar removido",
        description: "Seu avatar foi removido com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao remover avatar:", error)
      toast({
        title: "Erro ao remover avatar",
        description: error.message || "Ocorreu um erro ao remover o avatar",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  // Função para cancelar o upload
  const cancelUpload = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <Avatar className="h-24 w-24 border-4 border-[#f97316]">
          <AvatarImage src={preview || avatarUrl || ""} alt={userName} />
          <AvatarFallback>{getInitials(userName)}</AvatarFallback>
        </Avatar>

        <div className="mt-4 flex flex-wrap gap-2">
          <Label
            htmlFor="avatar-upload"
            className="flex cursor-pointer items-center gap-1 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            <Upload className="h-4 w-4" />
            {avatarUrl ? "Alterar foto" : "Adicionar foto"}
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={uploading}
            />
          </Label>

          {avatarUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={removeAvatar}
              disabled={uploading}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="mr-1 h-4 w-4" />
              Remover
            </Button>
          )}
        </div>
      </div>

      {preview && (
        <div className="mt-4 flex justify-center gap-2">
          <Button onClick={uploadAvatar} disabled={uploading} size="sm">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Salvar foto"
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={cancelUpload} disabled={uploading}>
            Cancelar
          </Button>
        </div>
      )}
    </div>
  )
}
