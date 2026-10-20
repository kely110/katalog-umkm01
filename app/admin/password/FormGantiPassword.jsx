"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { gantiPassword } from "@/app/admin/actions";

export default function FormGantiPassword() {
  const [state, formAction, isPending] = useActionState(gantiPassword, null);

  return (
    <>
      {state?.error && (
        <div className="max-w-sm rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="max-w-sm rounded-lg border border-garis bg-permukaan p-3 text-sm font-semibold text-utama">
          {state.message}
        </div>
      )}

      <form action={formAction} className="flex max-w-sm flex-col gap-4">
        <Input
          label="Password baru"
          name="password_baru"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Input
          label="Ulangi password baru"
          name="konfirmasi_password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Tombol type="submit" disabled={isPending} className="self-start">
          {isPending ? "Menyimpan..." : "Simpan password"}
        </Tombol>
      </form>
    </>
  );
}

