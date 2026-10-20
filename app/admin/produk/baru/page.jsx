import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import CatatanBelumAktif from "@/components/CatatanBelumAktif";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// US-08 (bonus di jalur offline): tambah produk.
export default async function HalamanTambahProduk() {
  const sessionClient = await createSessionClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      <CatatanBelumAktif>Simpan produk belum berfungsi: lihat US-08.</CatatanBelumAktif>
      <FormProduk labelTombol="Simpan produk" />
    </div>
  );
}
