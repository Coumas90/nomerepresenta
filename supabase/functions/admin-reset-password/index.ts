import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  try {
    const { email, password, secret } = await req.json();
    if (secret !== Deno.env.get("ADMIN_RESET_SECRET")) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listErr) throw listErr;
    const user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) return new Response(JSON.stringify({ error: "user not found" }), { status: 404 });
    const { error } = await supabase.auth.admin.updateUserById(user.id, { password });
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true, id: user.id }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
