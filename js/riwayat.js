(function () {
    if (!document.getElementById("panelRiwayat")) return; // bukan halaman keranjang

    const { KEY_RIWAYAT, KEY_STOK, ambilRiwayat, rupiah, escapeHtml, formatTanggal } = window.BS;

    let idPesananBaru = null; // pesanan yang baru dibuat, disorot dengan bingkai hijau

function tampilkanRiwayat() {
    const riwayat = ambilRiwayat();
    const daftar = document.getElementById("daftarRiwayat");
    const kosong = document.getElementById("riwayatKosong");
    const aksi = document.getElementById("areaAksi");
    const ringkasan = document.getElementById("ringkasanRiwayat");
    const pesanBaru = document.getElementById("pesanBaru");

    if (idPesananBaru && riwayat.some((p) => p.id === idPesananBaru)) {
        pesanBaru.textContent = `Pesanan ${idPesananBaru} berhasil dibuat. Stok buku sudah dikurangi.`;
        pesanBaru.classList.remove("hidden");
    } else {
        pesanBaru.classList.add("hidden");
    }

    if (riwayat.length === 0) {
        kosong.classList.remove("hidden");
        daftar.innerHTML = "";
        aksi.classList.add("hidden");
        aksi.classList.remove("flex");
        ringkasan.textContent = "";
        return;
    }

    kosong.classList.add("hidden");
    aksi.classList.remove("hidden");
    aksi.classList.add("flex");
    ringkasan.textContent = `${riwayat.length} pesanan`;

    daftar.innerHTML = riwayat
        .map(
            (p) => `
            <article class="rounded-lg bg-white p-5 shadow ${p.id === idPesananBaru ? "ring-2 ring-green-500" : ""}">
            <header class="flex flex-wrap items-start justify-between gap-2 border-b pb-3">
                <div>
                    <h2 class="font-bold">${escapeHtml(p.id)}</h2>
                    <p class="text-sm text-slate-600">${escapeHtml(formatTanggal(p.tanggal))}</p>
                </div>
                <span class="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">${escapeHtml(p.status)}</span>
            </header>

            <ul class="my-3 space-y-1 text-sm">
            ${p.items
                .map(
                    (i) => `
                        <li class="flex justify-between gap-4">
                            <span>${escapeHtml(i.judul)} <span class="text-slate-500">× ${i.jumlah}</span></span>
                            <span>${rupiah(i.harga * i.jumlah)}</span>
                        </li>`
                    )
                .join("")}
          </ul>

            <div class="flex justify-between border-t pt-3 font-bold">
                <span>Total (${p.totalItem} buku)</span>
                <span>${rupiah(p.totalHarga)}</span>
            </div>

            <p class="mt-3 text-sm text-slate-600">
                Dikirim ke ${escapeHtml(p.pembeli.nama)} (${escapeHtml(p.pembeli.telepon)}), ${escapeHtml(p.pembeli.alamat)}.
                Pembayaran: ${escapeHtml(p.metode)}.
            </p>
            </article>`
            )
        .join("");
}

document.addEventListener("DOMContentLoaded", () => {
    tampilkanRiwayat();

    document.getElementById("btnHapusRiwayat").addEventListener("click", () => {
        if (confirm("Hapus semua riwayat pesanan?")) {
            localStorage.removeItem(KEY_RIWAYAT);
            idPesananBaru = null;
            tampilkanRiwayat();
        }
    });

    document.getElementById("btnResetStok").addEventListener("click", () => {
        if (confirm("Kembalikan stok semua buku ke jumlah awal?")) {
            localStorage.removeItem(KEY_STOK);
            if (window.BS.tampilkanKeranjang) window.BS.tampilkanKeranjang();
            alert("Simulasi stok sudah direset.");
        }
    });
});

    window.BS.tampilkanRiwayat = tampilkanRiwayat;
    window.BS.setIdPesananBaru = (id) => {
        idPesananBaru = id;
    };
})();