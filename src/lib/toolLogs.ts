import { supabase } from "@/integrations/supabase/client";

function getDeviceType(): string {
  if (typeof window === "undefined") return "unknown";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export async function logToolUsage(
  toolSlug: string,
  action: string,
  metadata?: Record<string, unknown>,
  errorMessage?: string,
) {
  try {
    await (supabase as any).from("tool_usage_logs").insert({
      tool_slug: toolSlug,
      action,
      metadata: metadata ?? null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      device_type: getDeviceType(),
      error_message: errorMessage ?? null,
    });
  } catch (e) {
    // silent
  }
}
