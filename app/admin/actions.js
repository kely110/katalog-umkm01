"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Server Action untuk memproses login admin menggunakan Supabase Auth.
 */
export async function login(prevState, formData) {
  // Mendukung pemanggilan via useActionState (prevState, formData) maupun action langsung (formData)
  const data = formData instanceof FormData ? formData : prevState;

  const email = data?.get("email")?.toString()?.trim();
  const password = data?.get("password")?.toString();

  if (!email || !password) {
    return {
      error: "Email dan password wajib diisi.",
    };
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let pesanError = "Login gagal. Silakan periksa kembali email dan password Anda.";
    if (
      error.message?.includes("Invalid login credentials") ||
      error.message?.includes("invalid_grant")
    ) {
      pesanError = "Email atau password salah.";
    } else if (error.message) {
      pesanError = `Login gagal: ${error.message}`;
    }
    return {
      error: pesanError,
    };
  }

  redirect("/admin");
}

/**
 * Server Action untuk mengakhiri sesi admin (logout) lalu kembali ke halaman login.
 */
export async function logout() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export const keluar = logout;

