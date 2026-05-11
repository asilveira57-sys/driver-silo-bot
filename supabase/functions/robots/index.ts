import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data } = await supabase
    .from("site_settings")
    .select("robots_txt")
    .eq("singleton", true)
    .maybeSingle();

  const body =
    data?.robots_txt ||
    "User-agent: *\nAllow: /\n\nSitemap: https://www.adeconex.com/sitemap.xml\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
});
