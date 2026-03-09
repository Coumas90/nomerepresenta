import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

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
    const ZOHO_APP_PASSWORD = Deno.env.get("ZOHO_APP_PASSWORD");
    if (!ZOHO_APP_PASSWORD) {
      throw new Error("ZOHO_APP_PASSWORD is not configured");
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

    const artworkList = artworks
      .map((a: string) => `  • ${a}`)
      .join("\n");

    const emailBody = `New inquiry from ${name.trim()} (${email.trim()})

Pricelist: ${pricelistName || "—"}

Selected works:
${artworkList}

${message?.trim() ? `Message:\n${message.trim()}` : "No additional message."}

---
Reply directly to this email to respond to ${name.trim()}.`;

    const client = new SmtpClient();

    await client.connectTLS({
      hostname: "smtp.zoho.com",
      port: 465,
      username: "contact@ivancomas.studio",
      password: ZOHO_APP_PASSWORD,
    });

    await client.send({
      from: "contact@ivancomas.studio",
      to: "contact@ivancomas.studio",
      replyTo: email.trim(),
      subject: `Inquiry — ${pricelistName || "Pricelist"} — ${name.trim()}`,
      content: emailBody,
    });

    await client.close();

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
