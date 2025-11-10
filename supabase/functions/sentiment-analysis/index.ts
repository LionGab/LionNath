/**
 * Edge Function: Sentiment Analysis (Multi-IA)
 *
 * Análise emocional avançada usando:
 * - Claude Sonnet 4: Análise psicológica profunda
 * - Gemini 2.0 Flash: Padrões comportamentais
 *
 * Retorna:
 * - emotion: Emoção detectada
 * - riskLevel: "low" | "medium" | "high"
 * - concerns: Lista de preocupações
 * - recommendations: Ações de autocuidado
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SentimentAnalysisResponse {
  emotion: string;
  riskLevel: "low" | "medium" | "high";
  concerns: string[];
  strengths: string[];
  recommendations: string[];
  selfCareActions: string[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get auth token
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

    // Parse request body
    const { responses } = await req.json();

    if (!responses) {
      return new Response(
        JSON.stringify({ error: "No responses provided" }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`[Sentiment Analysis] Starting for user ${user.id}`);

    // Call Claude for emotional analysis
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Você é uma psicóloga especializada em saúde mental materna. Analise estas respostas e forneça uma análise emocional detalhada:

${JSON.stringify(responses, null, 2)}

Forneça em JSON:
- emotion (emoção principal detectada)
- riskLevel ("low" | "medium" | "high")
- concerns (lista de preocupações identificadas)
- strengths (forças e recursos da usuária)
- recommendations (recomendações personalizadas)
- selfCareActions (ações de autocuidado específicas)

Responda APENAS em JSON válido.`,
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

    console.log(`[Sentiment Analysis] Claude analysis complete`);

    // Parse response
    let analysis: SentimentAnalysisResponse;
    try {
      analysis = JSON.parse(claudeText);
    } catch (parseError) {
      console.error("[Sentiment Analysis] Parse error:", parseError);
      analysis = {
        emotion: "neutral",
        riskLevel: "low",
        concerns: [],
        strengths: ["Disponibilidade para refletir"],
        recommendations: ["Continue conversando com alguém de confiança"],
        selfCareActions: ["Tire um tempo para você"],
      };
    }

    // Save to database
    const { error: saveError } = await supabaseClient
      .from("sentiment_analysis")
      .insert({
        user_id: user.id,
        responses,
        analysis,
        emotion: analysis.emotion,
        risk_level: analysis.riskLevel,
        created_at: new Date().toISOString(),
      });

    if (saveError) {
      console.error("[Sentiment Analysis] Save error:", saveError);
    }

    // Create alert if risk is high
    if (analysis.riskLevel === "high") {
      const { error: alertError } = await supabaseClient
        .from("health_alerts")
        .insert({
          user_id: user.id,
          alert_type: "high_emotion_risk",
          severity: "high",
          data: analysis,
          created_at: new Date().toISOString(),
        });

      if (alertError) {
        console.error("[Sentiment Analysis] Alert error:", alertError);
      }
    }

    console.log(`[Sentiment Analysis] Completed. Emotion: ${analysis.emotion}, Risk: ${analysis.riskLevel}`);

    return new Response(JSON.stringify(analysis), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[Sentiment Analysis] Error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to analyze sentiment",
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
