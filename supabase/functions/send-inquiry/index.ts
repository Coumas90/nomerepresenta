import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { name, email, message, artworks, pricelistName } = await req.json();

    // Validate inputs
    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid name" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (message && (typeof message !== "string" || message.length > 5000)) {
      return new Response(JSON.stringify({ error: "Message too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!artworks || !Array.isArray(artworks) || artworks.length === 0) {
      return new Response(JSON.stringify({ error: "No artworks selected" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const artworkListHtml = artworks
      .map((a: string) => `<li style="margin-bottom:4px;">${escapeHtml(a)}</li>`)
      .join("");

    const messageHtml = message?.trim()
      ? `<p style="margin-top:16px;"><strong>Message:</strong></p><p>${escapeHtml(message.trim())}</p>`
      : "";

    const html = `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;color:#1c1917;">
        <p>New inquiry from <strong>${escapeHtml(name.trim())}</strong> (<a href="mailto:${escapeHtml(email.trim())}">${escapeHtml(email.trim())}</a>)</p>
        <p style="color:#78716c;font-size:13px;">Pricelist: ${escapeHtml(pricelistName || "—")}</p>
        <p><strong>Selected works:</strong></p>
        <ul style="padding-left:20px;">${artworkListHtml}</ul>
        ${messageHtml}
        <hr style="border:none;border-top:1px solid #d6d3d1;margin:24px 0;" />
        <p style="font-size:12px;color:#a8a29e;">Reply directly to this email to respond to ${escapeHtml(name.trim())}.</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ivan Comas <onboarding@resend.dev>",
        to: ["contact@ivancomas.studio"],
        reply_to: email.trim(),
        subject: `Inquiry — ${pricelistName || "Pricelist"} — ${name.trim()}`,
        html,
      }),
    });

    const resData = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", resData);
      throw new Error(`Email send failed [${res.status}]: ${JSON.stringify(resData)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error sending inquiry email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
