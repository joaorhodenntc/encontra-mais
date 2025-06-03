import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { createClient } from "@supabase/supabase-js";

// Substitua com suas credenciais do AbacatePay
const ABACATE_PAY_API_KEY = process.env.ABACATE_PAY_API_KEY;
const ABACATE_PAY_API_URL = process.env.ABACATE_PAY_API_URL;

// Criar cliente Supabase com a chave de serviço
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Função para gerar um CPF válido para teste
function generateValidCPF() {
  const cpf = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

  // Primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += cpf[i] * (10 - i);
  }
  let digit = 11 - (sum % 11);
  cpf.push(digit > 9 ? 0 : digit);

  // Segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += cpf[i] * (11 - i);
  }
  digit = 11 - (sum % 11);
  cpf.push(digit > 9 ? 0 : digit);

  // Formatar CPF
  return cpf.join("").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json();

    console.log("Dados recebidos:", { userId, email });

    if (!userId || !email) {
      return NextResponse.json(
        { message: "Dados incompletos" },
        { status: 400 }
      );
    }

    // Buscar dados do profissional
    const { data: professionalData, error: professionalError } = await supabase
      .from("professionals")
      .select("full_name, phone, abacate_pay_customer_id")
      .eq("id", userId)
      .single();

    console.log("Dados do profissional:", professionalData);

    if (professionalError) {
      console.error("Erro ao buscar profissional:", professionalError);
      throw new Error("Erro ao buscar dados do profissional");
    }

    let customerId;
    let testCPF;

    // Se o profissional já tem um customer_id do AbacatePay, usar ele
    if (professionalData.abacate_pay_customer_id) {
      console.log(
        "Usando customer_id existente:",
        professionalData.abacate_pay_customer_id
      );
      customerId = professionalData.abacate_pay_customer_id;
    } else {
      // Gerar CPF válido para teste
      testCPF = generateValidCPF();
      console.log("CPF gerado para teste:", testCPF);

      // Criar o cliente no AbacatePay
      const customerResponse = await fetch(
        `${ABACATE_PAY_API_URL}/customer/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ABACATE_PAY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: professionalData.full_name,
            cellphone: professionalData.phone,
            email: email,
            taxId: testCPF,
            metadata: {
              externalId: userId,
            },
          }),
        }
      );

      const customerData = await customerResponse.json();
      console.log("Resposta da criação do cliente:", customerData);

      if (!customerResponse.ok) {
        console.error("Erro ao criar cliente:", customerData);
        throw new Error(
          customerData.error || "Erro ao criar cliente no AbacatePay"
        );
      }

      customerId = customerData.data.id;
      console.log("Customer ID obtido:", customerId);

      // Salvar o customer_id no profissional usando o cliente admin
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from("professionals")
        .update({ abacate_pay_customer_id: customerId })
        .eq("id", userId)
        .select();

      if (updateError) {
        console.error("Erro ao salvar customer_id:", updateError);
        throw new Error("Erro ao salvar customer_id no banco de dados");
      } else {
        console.log("Customer ID salvo com sucesso:", updateData);
      }
    }

    const payload = {
      frequency: "ONE_TIME",
      methods: ["PIX"],
      products: [
        {
          externalId: `prod-${userId}`,
          name: "Plano Premium",
          description: "Acesso ao plano premium por 1 mês",
          quantity: 1,
          price: 1999,
        },
      ],
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/area-profissional?success=true`,
      completionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/area-profissional?success=true`,
      customerId: customerId,
      customer: {
        name: professionalData.full_name,
        cellphone: professionalData.phone,
        email: email,
        taxId: testCPF || "", // Usar CPF vazio se não foi gerado
        metadata: {
          externalId: userId,
        },
      },
    };

    console.log("Payload para AbacatePay:", payload);
    console.log("URL da API:", `${ABACATE_PAY_API_URL}/billing/create`);

    // Criar cobrança no AbacatePay
    const response = await fetch(`${ABACATE_PAY_API_URL}/billing/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ABACATE_PAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Resposta do AbacatePay:", data);

    if (!response.ok) {
      console.error("Erro na resposta do AbacatePay:", {
        status: response.status,
        statusText: response.statusText,
        data,
      });
      throw new Error(data.error || "Erro ao criar cobrança no AbacatePay");
    }

    // Verificar se já existe uma assinatura ativa
    const { data: existingSubscription, error: subscriptionCheckError } =
      await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("professional_id", userId)
        .eq("status", "active")
        .single();

    if (subscriptionCheckError && subscriptionCheckError.code !== "PGRST116") {
      console.error(
        "Erro ao verificar assinatura existente:",
        subscriptionCheckError
      );
      throw new Error("Erro ao verificar assinatura existente");
    }

    // Se já existe uma assinatura ativa, atualizar ela
    if (existingSubscription) {
      const { error: updateError } = await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "pending",
          start_date: new Date().toISOString(),
          end_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSubscription.id);

      if (updateError) {
        console.error("Erro ao atualizar assinatura existente:", updateError);
        throw new Error("Erro ao atualizar assinatura existente");
      }
    } else {
      // Criar nova assinatura apenas se não existir uma ativa
      const { error: subscriptionError } = await supabaseAdmin
        .from("subscriptions")
        .insert({
          professional_id: userId,
          status: "pending",
          start_date: new Date().toISOString(),
          end_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (subscriptionError) {
        console.error("Erro ao criar assinatura no banco:", subscriptionError);
        throw new Error("Erro ao criar assinatura");
      }
    }

    return NextResponse.json({
      paymentUrl: data.data.url,
    });
  } catch (error: any) {
    console.error("Erro detalhado:", error);
    return NextResponse.json(
      {
        message: error.message || "Erro ao processar cobrança",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
