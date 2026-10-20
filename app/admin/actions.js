"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Memastikan admin sudah login di server.
 * Sesuai aturan keamanan #3: setiap aksi yang mengubah data wajib memeriksa status login di server.
 */
export async function pastikanAdminLogin() {
  const supabase = await createSessionClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Akses ditolak: Anda harus login sebagai admin.");
  }

  return { supabase, user };
}

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

/**
 * Server Action untuk mengganti password admin yang sedang login.
 * Memeriksa autentikasi di server dan memvalidasi password baru minimal 8 karakter.
 */
export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;

  const passwordBaru = (
    data?.get("password_baru") || data?.get("passwordBaru")
  )?.toString();
  const konfirmasiPassword = (
    data?.get("konfirmasi_password") || data?.get("konfirmasiPassword")
  )?.toString();

  if (!passwordBaru || !konfirmasiPassword) {
    return {
      error: "Password baru dan konfirmasi password wajib diisi.",
    };
  }

  if (passwordBaru.length < 8) {
    return {
      error: "Password baru minimal 8 karakter.",
    };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return {
      error: "Konfirmasi password tidak cocok dengan password baru.",
    };
  }

  const supabase = await createSessionClient();

  // Wajib periksa bahwa admin sudah login (Aturan Keamanan 3)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: "Sesi telah berakhir atau Anda belum login. Silakan login kembali.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return {
      error: `Gagal mengganti password: ${error.message}`,
    };
  }

  return {
    success: true,
    message: "Password berhasil diganti.",
  };
}

export const updatePassword = gantiPassword;

/**
 * Server Action untuk mengubah produk (US-09).
 * Terlindungi login: memeriksa sesi admin di server sebelum mengubah database.
 */
export async function ubahProduk(idOrFormData, maybeFormData) {
  const supabase = await createSessionClient();

  // 1. Wajib periksa bahwa admin sudah login (Aturan Keamanan 3)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Akses ditolak: Anda harus login sebagai admin.");
  }

  let id = null;
  let formData = null;

  if (maybeFormData instanceof FormData) {
    id = idOrFormData;
    formData = maybeFormData;
  } else if (idOrFormData instanceof FormData) {
    formData = idOrFormData;
    id = formData.get("id");
  }

  if (!id && formData) {
    id = formData.get("id");
  }

  if (!id) {
    throw new Error("ID produk tidak ditemukan.");
  }

  const nama = formData.get("nama")?.toString()?.trim();
  const hargaRaw = formData.get("harga");
  const kategori = formData.get("kategori")?.toString()?.trim() || null;
  const foto_url = formData.get("foto_url")?.toString()?.trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString()?.trim() || null;

  if (!nama) {
    throw new Error("Nama produk wajib diisi.");
  }

  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    throw new Error("Harga harus berupa angka dan tidak boleh negatif.");
  }

  // 2. Simpan perubahan ke database Supabase
  const { error } = await supabase
    .from("produk")
    .update({
      nama,
      harga,
      kategori,
      foto_url,
      deskripsi,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Gagal mengubah data produk: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/produk/${id}`);
  redirect("/admin");
}
