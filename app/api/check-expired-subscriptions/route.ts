import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Criar cliente Supabase com a chave de serviço
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    console.log("Iniciando verificação de assinaturas expiradas");

    // Buscar todas as assinaturas ativas que expiraram
    const { data: expiredSubscriptions, error: fetchError } =
      await supabaseAdmin
        .from("subscriptions")
        .select("id, professional_id, end_date")
        .eq("status", "active")
        .lt("end_date", new Date().toISOString());

    if (fetchError) {
      console.error("Erro ao buscar assinaturas expiradas:", fetchError);
      throw new Error("Erro ao buscar assinaturas expiradas");
    }

    console.log("Assinaturas expiradas encontradas:", expiredSubscriptions);

    // Para cada assinatura expirada
    for (const subscription of expiredSubscriptions) {
      // Atualizar status da assinatura para inactive
      const { error: updateSubscriptionError } = await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "inactive",
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscription.id);

      if (updateSubscriptionError) {
        console.error(
          "Erro ao atualizar assinatura expirada:",
          updateSubscriptionError
        );
        continue; // Continua para a próxima assinatura mesmo se houver erro
      }

      // Verificar se o profissional tem outras assinaturas ativas
      const { data: activeSubscriptions, error: checkActiveError } =
        await supabaseAdmin
          .from("subscriptions")
          .select("id")
          .eq("professional_id", subscription.professional_id)
          .eq("status", "active");

      if (checkActiveError) {
        console.error(
          "Erro ao verificar outras assinaturas ativas:",
          checkActiveError
        );
        continue;
      }

      // Se não houver outras assinaturas ativas, atualizar status do profissional para free
      if (!activeSubscriptions || activeSubscriptions.length === 0) {
        const { error: updateProfessionalError } = await supabaseAdmin
          .from("professionals")
          .update({ subscription_status: "free" })
          .eq("id", subscription.professional_id);

        if (updateProfessionalError) {
          console.error(
            "Erro ao atualizar status do profissional:",
            updateProfessionalError
          );
        } else {
          console.log(
            "Status do profissional atualizado para free:",
            subscription.professional_id
          );
        }
      }
    }

    return NextResponse.json({
      message: "Verificação de assinaturas expiradas concluída",
      expiredCount: expiredSubscriptions.length,
    });
  } catch (error: any) {
    console.error("Erro ao verificar assinaturas expiradas:", error);
    return NextResponse.json(
      {
        message: "Erro ao verificar assinaturas expiradas",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
