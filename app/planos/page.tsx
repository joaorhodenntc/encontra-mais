import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PlanosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="bg-gradient-to-b from-[#f97316] to-[#ea580c] py-20 text-white">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                Plano para Profissionais
              </h1>
              <p className="mb-8 text-xl text-white/90">
                Aumente sua visibilidade e conquiste mais clientes com o
                Encontra+
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container px-4">
            <div className="mx-auto max-w-lg">
              <Card className="border-2 border-[#f97316] shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Plano Premium</CardTitle>
                  <CardDescription>
                    Para profissionais que querem crescer
                  </CardDescription>
                  <div className="mt-4 text-4xl font-bold">
                    R$ 29,90<span className="text-base font-normal">/mês</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Perfil completo na plataforma</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Contato direto via WhatsApp</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Visibilidade para clientes em potencial</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Sem taxas por serviço contratado</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-[#f97316] hover:bg-[#ea580c]"
                    asChild
                  >
                    <Link href="/cadastro/profissional">Assinar Agora</Link>
                  </Button>
                </CardFooter>
              </Card>

              <div className="mt-16">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  Perguntas Frequentes
                </h2>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">
                      Como funciona o pagamento?
                    </h3>
                    <p className="text-gray-600">
                      O pagamento é feito mensalmente via cartão de crédito,
                      boleto ou PIX.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">
                      Como funciona a comunicação com os clientes?
                    </h3>
                    <p className="text-gray-600">
                      Toda comunicação é feita diretamente via WhatsApp. Os
                      clientes podem entrar em contato com você pelo número
                      cadastrado em seu perfil.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">
                      Existe alguma taxa por serviço contratado?
                    </h3>
                    <p className="text-gray-600">
                      Não, cobramos apenas a mensalidade do plano. Não há taxas
                      adicionais por serviços contratados através da plataforma.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
