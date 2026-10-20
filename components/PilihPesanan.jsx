"use client";
import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function PilihPesanan({ produk }) {
  const daftarVarian = Array.isArray(produk.varian) ? produk.varian : [];
  const [varian, setVarian] = useState(daftarVarian[0] ?? "");
  const [jumlah, setJumlah] = useState(1);

  const total = Number(produk.harga) * jumlah;

  const pesan =
    `Halo, saya mau pesan:\n` +
    `Produk: ${produk.nama}\n` +
    (varian ? `Varian: ${varian}\n` : "") +
    `Jumlah: ${jumlah}\n` +
    `Total: ${formatRupiah(total)}`;

  const nomorWa = String(toko.nomorWhatsApp || toko.whatsapp || "").replace(/\D/g, "");
  const link = `https://wa.me/${nomorWa}?text=${encodeURIComponent(pesan)}`;

  return (
    <div className="mt-2 flex flex-col gap-5">
      {daftarVarian.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Pilih varian</p>
          <div className="flex flex-wrap gap-2">
            {daftarVarian.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVarian(v)}
                aria-pressed={varian === v}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  varian === v
                    ? "border-utama bg-utama text-white"
                    : "border-garis bg-permukaan hover:border-utama"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-semibold">Jumlah</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setJumlah((j) => Math.max(1, j - 1))}
            aria-label="Kurangi jumlah"
            className="h-10 w-10 rounded-lg border border-garis bg-permukaan text-lg"
          >
            −
          </button>
          <span className="w-8 text-center font-semibold">{jumlah}</span>
          <button
            type="button"
            onClick={() => setJumlah((j) => j + 1)}
            aria-label="Tambah jumlah"
            className="h-10 w-10 rounded-lg border border-garis bg-permukaan text-lg"
          >
            +
          </button>
        </div>
      </div>

      <p className="text-sm text-teks-lembut">
        Total: <span className="font-bold text-harga">{formatRupiah(total)}</span>
      </p>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl bg-utama px-5 py-3 text-center font-semibold text-white hover:opacity-90"
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}
