import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ABACATE_PAY_WEBHOOK_SECRET = process.env.ABACATE_PAY_WEBHOOK_SECRET;

// Criar cliente Supabase com a chave de serviço
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // Pegar o secret da URL
    const url = new URL(request.url);
    const secret = url.searchParams.get("webhookSecret");

    console.log("Secret recebido:", secret);
    console.log("Secret esperado:", ABACATE_PAY_WEBHOOK_SECRET);

    if (!secret) {
      console.error("Secret não encontrado na URL");
      return NextResponse.json(
        { message: "Secret não encontrado" },
        { status: 401 }
      );
    }

    // Verificar se o secret corresponde
    if (secret !== ABACATE_PAY_WEBHOOK_SECRET) {
      console.error("Secret inválido - não corresponde");
      return NextResponse.json({ message: "Secret inválido" }, { status: 401 });
    }

    const payload = await request.text();
    const event = JSON.parse(payload);
    console.log("Evento recebido:", event);

    // Processar diferentes tipos de eventos
    switch (event.event) {
      case "billing.created":
        await handleBillingCreated(event.data);
        break;
      case "billing.paid":
        await handleBillingPaid(event.data);
        break;
      case "billing.canceled":
        await handleBillingCanceled(event.data);
        break;
      case "billing.failed":
        await handleBillingFailed(event.data);
        break;
      default:
        console.log(`Evento não tratado: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return NextResponse.json(
      { message: "Erro ao processar webhook" },
      { status: 500 }
    );
  }
}

async function handleBillingCreated(data: any) {
  console.log("Cobrança criada:", data);
  // Atualizar status da assinatura para pending
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({ status: "pending" })
    .eq("professional_id", data.billing.customer.metadata.externalId);

  if (error) {
    console.error("Erro ao atualizar status da assinatura:", error);
    throw error;
  }
}

async function handleBillingPaid(data: any) {
  console.log("Cobrança paga:", data);
  console.log("Metadados do cliente:", data.billing.customer.metadata);

  // Tentar obter o ID do profissional de diferentes fontes
  let professionalId = data.billing.customer.metadata?.externalId;

  // Se não encontrar nos metadados do cliente, tentar nos produtos
  if (
    !professionalId &&
    data.billing.products &&
    data.billing.products.length > 0
  ) {
    const productExternalId = data.billing.products[0].externalId;
    if (productExternalId && productExternalId.startsWith("prod-")) {
      professionalId = productExternalId.replace("prod-", "");
    }
  }

  if (!professionalId) {
    console.error(
      "ID do profissional não encontrado nos metadados do cliente ou produtos"
    );
    throw new Error("ID do profissional não encontrado");
  }

  console.log("ID do profissional encontrado:", professionalId);

  // Verificar se o profissional existe
  const { data: professionalData, error: professionalCheckError } =
    await supabaseAdmin
      .from("professionals")
      .select("id, subscription_status")
      .eq("id", professionalId)
      .single();

  if (professionalCheckError) {
    console.error("Erro ao verificar profissional:", professionalCheckError);
    throw new Error("Erro ao verificar profissional");
  }

  if (!professionalData) {
    console.error("Profissional não encontrado:", professionalId);
    throw new Error("Profissional não encontrado");
  }

  console.log("Dados do profissional antes da atualização:", professionalData);

  // Buscar a assinatura pendente mais recente
  const { data: subscriptionData, error: subscriptionError } =
    await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("professional_id", professionalId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

  if (subscriptionError) {
    console.error("Erro ao buscar assinatura pendente:", subscriptionError);
    throw new Error("Assinatura pendente não encontrada");
  }

  const subscriptionId = subscriptionData.id;

  // Atualizar o status do profissional para premium
  const { error: updateError } = await supabaseAdmin
    .from("professionals")
    .update({ subscription_status: "premium" })
    .eq("id", professionalId);

  if (updateError) {
    console.error("Erro ao atualizar status do profissional:", updateError);
    throw new Error("Erro ao atualizar status do profissional");
  }

  // Desativar todas as outras assinaturas ativas
  const { error: deactivateError } = await supabaseAdmin
    .from("subscriptions")
    .update({ status: "inactive" })
    .eq("professional_id", professionalId)
    .eq("status", "active")
    .neq("id", subscriptionId);

  if (deactivateError) {
    console.error("Erro ao desativar outras assinaturas:", deactivateError);
    // Não vamos falhar aqui, pois a assinatura principal já foi ativada
  }

  // Atualizar a assinatura atual para ativa
  const { error: subscriptionUpdateError } = await supabaseAdmin
    .from("subscriptions")
    .update({
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);

  if (subscriptionUpdateError) {
    console.error(
      "Erro ao atualizar status da assinatura:",
      subscriptionUpdateError
    );
    throw new Error("Erro ao atualizar status da assinatura");
  }

  console.log(
    "Assinatura ativada com sucesso para o profissional:",
    professionalId
  );
}

async function handleBillingCanceled(data: any) {
  console.log("Cobrança cancelada:", data);
  const professionalId = data.billing.customer.metadata.externalId;

  // Atualizar status da assinatura para cancelled
  await supabaseAdmin
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("professional_id", professionalId);

  // Atualizar status do profissional para free
  await supabaseAdmin
    .from("professionals")
    .update({ subscription_status: "free" })
    .eq("id", professionalId);

  console.log("Assinatura cancelada para o profissional:", professionalId);
}

async function handleBillingFailed(data: any) {
  console.log("Cobrança falhou:", data);
  const professionalId = data.billing.customer.metadata.externalId;

  // Atualizar status da assinatura para cancelled
  await supabaseAdmin
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("professional_id", professionalId);

  console.log(
    "Assinatura cancelada devido a falha no pagamento para o profissional:",
    professionalId
  );
}

function verifyWebhookSignature(payload: string, signature: string): boolean {
  // Implementar a verificação da assinatura do webhook
  // Este é um exemplo simplificado, você deve implementar a verificação real
  // de acordo com a documentação do AbacatePay
  return true;
}
