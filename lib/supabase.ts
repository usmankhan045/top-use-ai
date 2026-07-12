import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { siteConfig } from "./site.config";

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

// Lazy singletons, clients are created on first use, not at module load.
// This lets the build succeed without .env vars, and avoids duplicate clients.
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_ANON_KEY"));
  }
  return _supabase;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      getEnv("SUPABASE_URL"),
      getEnv("SUPABASE_SERVICE_ROLE_KEY")
    );
  }
  return _supabaseAdmin;
}

// Named exports for backwards compat in case components import these directly.
// Accessing these as properties triggers the lazy init.
export const supabase = new Proxy({} as SupabaseClient, {
  get: (_, prop) => getSupabase()[prop as keyof SupabaseClient],
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (_, prop) => getSupabaseAdmin()[prop as keyof SupabaseClient],
});

// ── Site ID cache ────────────────────────────────────────────────────────────
let _siteId: string | null = null;

export async function getCurrentSiteId(): Promise<string> {
  if (_siteId) return _siteId;

  const { data, error } = await getSupabaseAdmin()
    .from("sites")
    .select("id")
    .eq("slug", siteConfig.slug)
    .single();

  if (error || !data) {
    throw new Error(
      `Site not found for slug "${siteConfig.slug}". Run the seed migration.`
    );
  }

  _siteId = data.id as string;
  return _siteId;
}
