(function () {
    if (!document.getElementById("panelKeranjang")) return; 

const {
    KEY_STOK, bacaJSON, simpanJSON,
    ambilKeranjang, simpanKeranjang, ambilRiwayat,
    ambilStok, hapusItem, ubahJumlah,
    rupiah, escapeHtml, perbaruiBadge,
} = window.BS;

function bukaTab(nama) {
    document.getElementById("panelKeranjang").classList.toggle("hidden", nama !== "keranjang");
    document.getElementById("panelRiwayat").classList.toggle("hidden", nama !== "riwayat");

    document.querySelectorAll("[data-tab]").forEach((tombol) => {
      const aktif = tombol.dataset.tab === nama;
      tombol.setAttribute("aria-selected", aktif);
      tombol.classList.toggle("border-amber-500", aktif);
      tombol.classList.toggle("font-bold", aktif);
      tombol.classList.toggle("border-transparent", !aktif);
      tombol.classList.toggle("text-slate-600", !aktif);
    });
}

function tampilkanPeringatan(teks) {
    const el = document.getElementById("pesanPeringatan");
    el.textContent = teks;
    el.classList.toggle("hidden", !teks);
}

function tampilkanKeranjang() {
    const data = ambilKeranjang();
    const kosong = document.getElementById("keranjangKosong");
    const isi = document.getElementById("keranjangIsi");
    const daftar = document.getElementById("daftarKeranjang");
    const ringkasanAtas = document.getElementById("ringkasanAtas");

    perbaruiBadge();

    if (data.length === 0) {
      kosong.classList.remove("hidden");
      isi.classList.add("hidden");
      ringkasanAtas.textContent = "";
      return;
    }

    kosong.classList.add("hidden");
    isi.classList.remove("hidden");

    daftar.innerHTML = data
      .map((item) => {
        const stok = ambilStok(item);
        const maks = item.jumlah >= stok;
        return `
        <li class="flex gap-4 rounded-lg bg-white p-4 shadow" data-id="${escapeHtml(item.id)}">
          <img src="${escapeHtml(item.gambar)}" alt="Sampul ${escapeHtml(item.judul)}"
               onerror="this.style.visibility='hidden'" class="h-28 w-20 shrink-0 rounded object-cover bg-slate-200" />
          <div class="flex flex-1 flex-col justify-between">
            <div>
              <h3 class="font-bold">${escapeHtml(item.judul)}</h3>
              <p class="text-sm text-slate-600">${escapeHtml(item.penulis)}</p>
              <p class="mt-1 text-sm">${rupiah(item.harga)} <span class="text-slate-500">· stok ${stok}</span></p>
            </div>
            <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <button type="button" data-aksi="kurang" aria-label="Kurangi jumlah"
                  class="h-8 w-8 rounded border border-slate-300 hover:bg-slate-100">−</button>
                <span class="w-6 text-center">${item.jumlah}</span>
                <button type="button" data-aksi="tambah" aria-label="Tambah jumlah" ${maks ? "disabled" : ""}
                  class="h-8 w-8 rounded border border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">+</button>
              </div>
              <p class="font-semibold">${rupiah(item.harga * item.jumlah)}</p>
              <button type="button" data-aksi="hapus" class="text-sm text-red-700 underline">Hapus</button>
            </div>
          </div>
        </li>`;
      })
      .join("");

    const totalItem = data.reduce((n, item) => n + item.jumlah, 0);
    const totalHarga = data.reduce((n, item) => n + item.harga * item.jumlah, 0);
    document.getElementById("totalItem").textContent = totalItem;
    document.getElementById("totalHarga").textContent = rupiah(totalHarga);
    ringkasanAtas.textContent = `${data.length} judul buku di keranjangmu`;
}

function tampilError(idEl, teks) {
    const el = document.getElementById(idEl);
    el.textContent = teks;
    el.classList.toggle("hidden", !teks);
}

function validasiForm(form) {
    const nama = form.nama.value.trim();
    const telepon = form.telepon.value.trim();
    const alamat = form.alamat.value.trim();

    const errNama = nama.length < 3 ? "Nama minimal 3 huruf." : "";
    const errTelepon = /^(\+62|62|0)\d{8,13}$/.test(telepon)
      ? ""
      : "Nomor telepon tidak valid. Contoh: 081234567890.";
    const errAlamat = alamat.length < 10 ? "Alamat minimal 10 karakter." : "";

    tampilError("errNama", errNama);
    tampilError("errTelepon", errTelepon);
    tampilError("errAlamat", errAlamat);

    return !errNama && !errTelepon && !errAlamat ? { nama, telepon, alamat } : null;
}

function buatPesanan(form) {
    const pembeli = validasiForm(form);
    if (!pembeli) return;

    const data = ambilKeranjang();
    if (data.length === 0) return;

    const bermasalah = data.filter((item) => item.jumlah > ambilStok(item));
    if (bermasalah.length > 0) {
      tampilkanPeringatan(
        "Stok tidak cukup untuk: " + bermasalah.map((i) => i.judul).join(", ") + ". Kurangi jumlahnya dulu."
      );
      tampilkanKeranjang();
      return;
    }

    const peta = bacaJSON(KEY_STOK, {});
    data.forEach((item) => {
      peta[item.id] = ambilStok(item) - item.jumlah;
    });
    simpanJSON(KEY_STOK, peta);

    const pesanan = {
      id: "BS-" + Date.now(),
      tanggal: new Date().toISOString(),
      pembeli,
      metode: form.metode.value,
      items: data.map(({ id, judul, penulis, harga, jumlah }) => ({ id, judul, penulis, harga, jumlah })),
      totalItem: data.reduce((n, i) => n + i.jumlah, 0),
      totalHarga: data.reduce((n, i) => n + i.harga * i.jumlah, 0),
      status: "Diproses",
    };
    const riwayat = ambilRiwayat();
    riwayat.unshift(pesanan);
    simpanJSON(window.BS.KEY_RIWAYAT, riwayat);

    simpanKeranjang([]);
    form.reset();
    form.classList.add("hidden");
    tampilkanPeringatan("");
    window.BS.setIdPesananBaru(pesanan.id);
    tampilkanKeranjang();
    window.BS.tampilkanRiwayat();
    bukaTab("riwayat");
    window.scrollTo({ top: 0, behavior: "smooth" });
}


document.addEventListener("DOMContentLoaded", () => {
    tampilkanKeranjang();

    // Tab
    document.querySelectorAll("[data-tab]").forEach((tombol) => {
      tombol.addEventListener("click", () => {
        if (tombol.dataset.tab === "keranjang") window.BS.setIdPesananBaru(null);
        window.BS.tampilkanRiwayat();
        bukaTab(tombol.dataset.tab);
      });
    });
    const tabAwal = new URLSearchParams(window.location.search).get("tab");
    bukaTab(tabAwal === "riwayat" ? "riwayat" : "keranjang"); // keranjang.html?tab=riwayat

    // Tombol +, −, hapus
    document.getElementById("daftarKeranjang").addEventListener("click", (e) => {
      const tombol = e.target.closest("button[data-aksi]");
      if (!tombol) return;
      const id = tombol.closest("li").dataset.id;
      const aksi = tombol.dataset.aksi;

      let peringatan = "";
      if (aksi === "tambah") peringatan = ubahJumlah(id, 1);
      if (aksi === "kurang") peringatan = ubahJumlah(id, -1);
      if (aksi === "hapus") hapusItem(id);

      tampilkanPeringatan(peringatan);
      tampilkanKeranjang();
    });

    // Checkout
    const form = document.getElementById("formCheckout");
    document.getElementById("btnCheckout").addEventListener("click", () => {
      form.classList.remove("hidden");
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      form.nama.focus({ preventScroll: true });
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      buatPesanan(form);
    });

    // Kosongkan keranjang
    document.getElementById("btnKosongkan").addEventListener("click", () => {
      if (confirm("Kosongkan semua buku dari keranjang?")) {
        simpanKeranjang([]);
        tampilkanPeringatan("");
        tampilkanKeranjang();
      }
    });
});

window.BS.tampilkanKeranjang = tampilkanKeranjang;
})();