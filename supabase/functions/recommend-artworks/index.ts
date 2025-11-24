import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch user's artwork views and cursor tracking data
    const { data: artworkViews } = await supabaseClient
      .from("artwork_views")
      .select(`
        artwork_id,
        view_duration_seconds,
        hovered,
        clicked_detail,
        artworks (
          id,
          title,
          technique,
          materials,
          series_id,
          series (
            name
          )
        )
      `)
      .eq("session_id", sessionId)
      .order("view_duration_seconds", { ascending: false });

    const { data: cursorData } = await supabaseClient
      .from("artwork_cursor_tracking")
      .select("artwork_id, x_position, y_position")
      .eq("session_id", sessionId);

    // Fetch all artworks for recommendations
    const { data: allArtworks } = await supabaseClient
      .from("artworks")
      .select(`
        id,
        title,
        technique,
        materials,
        year,
        series (
          name
        )
      `);

    if (!artworkViews || artworkViews.length === 0) {
      return new Response(
        JSON.stringify({ recommendations: [], message: "Not enough data yet" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze engagement patterns
    const viewedArtworkIds = artworkViews.map(v => v.artwork_id);
    const highEngagement = artworkViews
      .filter(v => v.view_duration_seconds > 10 || v.hovered || v.clicked_detail)
      .map(v => v.artworks)
      .filter(a => a !== null);

    // Create context for AI
    const userContext = `
User has viewed ${artworkViews.length} artworks with these engagement patterns:
${highEngagement.map((a: any) => `- ${a.title} (${a.series?.name}): ${a.technique}, ${a.materials}`).join('\n')}

Cursor tracking shows focused attention on ${cursorData?.length || 0} specific areas.

Available artworks not yet viewed:
${allArtworks?.filter(a => !viewedArtworkIds.includes(a.id)).map((a: any) => 
  `- ID: ${a.id}, Title: ${a.title}, Series: ${a.series?.name}, Technique: ${a.technique}, Materials: ${a.materials}`
).join('\n')}
`;

    // Call Lovable AI for recommendations
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an art curator analyzing visitor engagement patterns. Based on cursor tracking data, viewing duration, and interaction patterns, recommend 3-5 artworks the user hasn't seen yet. Respond with a JSON array of objects containing: artworkId (the ID string), reason (brief explanation why they'd enjoy it based on their patterns)."
          },
          {
            role: "user",
            content: userContext
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "recommend_artworks",
            description: "Recommend artworks based on user engagement patterns",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      artworkId: { type: "string" },
                      reason: { type: "string" }
                    },
                    required: ["artworkId", "reason"],
                    additionalProperties: false
                  }
                }
              },
              required: ["recommendations"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "recommend_artworks" } }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
    const recommendations = toolCall ? JSON.parse(toolCall.function.arguments).recommendations : [];

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in recommend-artworks:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
