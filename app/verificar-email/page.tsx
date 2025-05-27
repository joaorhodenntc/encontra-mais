"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Obter os parâmetros da URL
        const token_hash = searchParams.get("token_hash")
        const type = searchParams.get("type")

        if (!token_hash || !type) {
          setVerificationStatus("error")
          setErrorMessage("Link de verificação inválido. Parâmetros ausentes.")
          return
        }

        // Verificar o email usando o Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        })

        if (error) {
          console.error("Erro ao verificar email:", error)
          setVerificationStatus("error")
          setErrorMessage(error.message)
          return
        }

        // Verificação bem-sucedida
        setVerificationStatus("success")
      } catch (error: any) {
        console.error("Erro ao verificar email:", error)
        setVerificationStatus("error")
        setErrorMessage(error.message || "Ocorreu um erro ao verificar seu email.")
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="container flex items-center justify-center px-4 py-16">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Verificação de Email</CardTitle>
          <CardDescription>
            {verificationStatus === "loading"
              ? "Verificando seu email..."
              : verificationStatus === "success"
                ? "Seu email foi verificado com sucesso!"
                : "Falha na verificação do email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verificationStatus === "loading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-center text-muted-foreground">
                Estamos verificando seu email. Isso pode levar alguns instantes...
              </p>
            </div>
          )}

          {verificationStatus === "success" && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="mt-4 text-center">
                Seu email foi verificado com sucesso! Agora você pode fazer login na sua conta.
              </p>
            </div>
          )}

          {verificationStatus === "error" && (
            <div className="flex flex-col items-center justify-center py-8">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="mt-4 text-center text-destructive">
                {errorMessage || "Ocorreu um erro ao verificar seu email."}
              </p>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                O link pode ter expirado ou já ter sido usado. Tente fazer login ou solicite um novo email de
                verificação.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {verificationStatus === "loading" ? (
            <Button disabled>Aguarde...</Button>
          ) : verificationStatus === "success" ? (
            <Button asChild>
              <Link href="/entrar">Ir para o login</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/entrar">Voltar para o login</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
