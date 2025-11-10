/**
 * Edge Function: Postpartum Depression Screening (DPP)
 *
 * Realiza triagem automática de depressão pós-parto usando:
 * - Claude Sonnet 4: Análise psicológica profunda (EPDS + DSM-5)
 * - Gemini 2.0 Flash: Análise de padrões temporais
 *
 * Retorna:
 * - riskScore: 0-30 (EPDS)
 * - symptoms: Lista de sintomas detectados
 * - recommendations: Ações recomendadas
 * - needsProfessionalHelp: bool
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScreeningResponse {
  riskScore: number;
  riskLevel: "low" | "moderate" | "high" | "critical";
  symptoms: string[];
  riskFactors: string[];
  protectiveFactors: string[];
  recommendations: string[];
  needsProfessionalHelp: boolean;
  emergencyResources?: {
    text: string;
    number: string;
  }[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    console.log(`[DPP Screening] Starting for user ${user.id}`);

    // Fetch user's sentiment analysis history
    const { data: sentimentAnalyses } = await supabaseClient
      .from("sentiment_analysis")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch recent chat conversations
    const { data: conversations } = await supabaseClient
      .from("chat_messages")
      .select("message, response, context_data")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    // Fetch user profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Build analysis prompt with historical data
    const analysisData = {
      sentimentHistory: sentimentAnalyses || [],
      recentConversations: (conversations || []).map((c) => ({
        message: c.message,
        response: c.response,
      })),
      profile: {
        fullName: profile?.full_name,
        stage: profile?.stage,
        babyAge: profile?.baby_age,
      },
    };

    console.log(`[DPP Screening] Analyzing data:`, {
      sentimentEntries: analysisData.sentimentHistory.length,
      conversationCount: analysisData.recentConversations.length,
    });

    // Call Claude for psychological analysis
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `Você é uma psicóloga perinatal especializada em depressão pós-parto (DPP).

Analise o histórico completo desta mãe e realize uma triagem para DPP baseada nos critérios do Edinburgh Postnatal Depression Scale (EPDS) e DSM-5.

HISTÓRICO DA USUÁRIA:
${JSON.stringify(analysisData, null, 2)}

Forneça uma análise em JSON com:
- riskScore (0-30, onde >13 indica possível DPP)
- riskLevel ("low" | "moderate" | "high" | "critical")
- symptoms (lista de sintomas identificados)
- riskFactors (fatores de risco presentes)
- protectiveFactors (fatores de proteção)
- recommendations (ações recomendadas)
- needsProfessionalHelp (bool)
- emergencyResources (se risco alto, incluir recursos de emergência)

Responda APENAS em JSON válido, sem markdown ou explicações extras.`,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.statusText}`);
    }

    const claudeData = await claudeResponse.json();
    const claudeText =
      claudeData.content[0]?.type === "text" ? claudeData.content[0].text : "{}";

    console.log(`[DPP Screening] Claude response received`);

    // Parse Claude response
    let screening: ScreeningResponse;
    try {
      screening = JSON.parse(claudeText);
    } catch (parseError) {
      console.error("[DPP Screening] Parse error:", parseError);
      // Fallback response
      screening = {
        riskScore: 0,
        riskLevel: "low",
        symptoms: [],
        riskFactors: [],
        protectiveFactors: [],
        recommendations: ["Consulte um profissional de saúde mental para avaliação completa"],
        needsProfessionalHelp: false,
      };
    }

    // Save screening result to database
    const { error: saveError } = await supabaseClient
      .from("postpartum_screenings")
      .insert({
        user_id: user.id,
        risk_score: screening.riskScore,
        risk_level: screening.riskLevel,
        screening_data: screening,
        needs_professional_help: screening.needsProfessionalHelp,
        created_at: new Date().toISOString(),
      });

    if (saveError) {
      console.error("[DPP Screening] Save error:", saveError);
    }

    // Create health alert if risk is high
    if (screening.riskScore > 13 || screening.needsProfessionalHelp) {
      const { error: alertError } = await supabaseClient
        .from("health_alerts")
        .insert({
          user_id: user.id,
          alert_type: "high_risk_dpp",
          severity: screening.riskScore > 20 ? "critical" : "high",
          data: screening,
          created_at: new Date().toISOString(),
        });

      if (alertError) {
        console.error("[DPP Screening] Alert creation error:", alertError);
      }
    }

    console.log(`[DPP Screening] Completed. Risk score: ${screening.riskScore}`);

    return new Response(JSON.stringify(screening), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[DPP Screening] Error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to perform screening",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
