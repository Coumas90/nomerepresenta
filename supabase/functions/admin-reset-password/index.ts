import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// ONE-OFF: resets ivncoms@gmail.com password. Deleted immediately after use.
Deno.serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listErr) throw listErr;
    const user = list.users.find((u) => u.email?.toLowerCase() === "ivncoms@gmail.com");
    if (!user) return new Response(JSON.stringify({ error: "user not found" }), { status: 404 });
    const { error } = await supabase.auth.admin.updateUserById(user.id, { password: "Roperco88+" });
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true, id: user.id, email: user.email }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
