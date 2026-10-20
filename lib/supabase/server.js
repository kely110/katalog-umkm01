import { createClient as createSupabaseClient } from "@supabase/supabase-js";
export { createSessionClient, createAdminSessionClient, buatKoneksiSesiAdmin } from "./session";

/**
 * Membuat koneksi Supabase untuk server (Server Component, Server Action, Route Handler)
 * menggunakan SUPABASE_URL dan SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca data publik (melewati RLS).
 */
export function createServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  // Normalisasi URL jika terdapat akhiran /rest/v1 atau slash berlebih
  const urlBersih = supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

  return createSupabaseClient(urlBersih, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const createClient = createServerClient;
export const getSupabaseServerClient = createServerClient;
