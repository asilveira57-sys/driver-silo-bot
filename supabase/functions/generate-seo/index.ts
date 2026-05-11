// Edge function: generate-seo
// Gera meta_title, meta_description e meta_keywords usando Lovable AI
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { titulo, conteudo, contexto } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurado");

    // Strip HTML para reduzir tokens
    const text = String(conteudo || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 4000);

    const systemPrompt = `Você é especialista em SEO para conteúdo técnico em português brasileiro sobre impressoras térmicas, drivers, softwares e etiquetas.
Gere meta tags otimizadas para Google, naturais e atrativas.
Regras:
- meta_title: máximo 60 caracteres, com palavra-chave principal no início
- meta_description: máximo 155 caracteres, com call-to-action sutil
- meta_keywords: 5 a 8 termos separados por vírgula, sem repetir`;

    const userPrompt = `Contexto: ${contexto || "página"}
Título: ${titulo || "(sem título)"}
Conteúdo: ${text || "(sem conteúdo)"}

Gere as meta tags SEO otimizadas.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "set_seo",
            description: "Define as meta tags SEO da página",
            parameters: {
              type: "object",
              properties: {
                meta_title: { type: "string", description: "Máx 60 caracteres" },
                meta_description: { type: "string", description: "Máx 155 caracteres" },
                meta_keywords: { type: "string", description: "Termos separados por vírgula" },
              },
              required: ["meta_title", "meta_description", "meta_keywords"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "set_seo" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em instantes." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const errText = await response.text();
      throw new Error(`AI gateway error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("Resposta da IA sem tool_call");
    const args = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(args), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("generate-seo error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Erro desconhecido" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
