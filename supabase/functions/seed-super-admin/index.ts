// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://yheezocifuiihvrvzdvo.supabase.co";
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SERVICE_ROLE) {
    return new Response(JSON.stringify({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const email = "a@b.com";
  const password = "Test@1234";

  let userId: string | null = null;
  let created = false;

  // Try create the user
  const { data: createdData, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr) {
    // If already exists, we'll search for it; otherwise, fail
    const msg = (createErr as any).message?.toLowerCase?.() || "";
    if (!(msg.includes("already") || (createErr as any).status === 422)) {
      return new Response(JSON.stringify({ error: createErr.message }), { status: 400 });
    }
  } else if (createdData?.user) {
    userId = createdData.user.id;
    created = true;
  }

  // If we didn't get the ID yet, list users and find by email
  if (!userId) {
    let page = 1;
    for (let i = 0; i < 10; i++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) break;
      const found = data.users.find((u: any) => (u.email || "").toLowerCase() === email);
      if (found) {
        userId = found.id;
        break;
      }
      if (data.users.length < 200) break;
      page += 1;
    }
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "Could not resolve user id" }), { status: 500 });
  }

  // Upsert profile
  await admin.from("profiles").upsert(
    { id: userId, email, display_name: "Super Admin" },
    { onConflict: "id" }
  );

  // Grant super_admin role
  await admin
    .from("user_roles")
    .upsert({ user_id: userId, role: "super_admin" as any }, { onConflict: "user_id,role" });

  return new Response(
    JSON.stringify({ ok: true, created, user_id: userId, email }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
