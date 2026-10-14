(function () {
    const KEY_KERANJANG = "keranjang";
    const KEY_RIWAYAT = "riwayatPesanan";
    const KEY_STOK = "stokBuku";
    const STOK_DEFAULT = 10; 

function bacaJSON(key, cadangan) {
    try {
    const nilai = JSON.parse(localStorage.getItem(key));
    return nilai ?? cadangan;
    } catch (e) {
      return cadangan;
    }
}

function simpanJSON(key, nilai) {
    localStorage.setItem(key, JSON.stringify(nilai));
}

    const ambilKeranjang = () => bacaJSON(KEY_KERANJANG, []);
    const simpanKeranjang = (data) => simpanJSON(KEY_KERANJANG, data);
    const ambilRiwayat = () => bacaJSON(KEY_RIWAYAT, []);

function ambilStok(buku) {
    const peta = bacaJSON(KEY_STOK, {});
    if (peta[buku.id] !== undefined) return peta[buku.id];
    return Number.isFinite(buku.stok) ? buku.stok : STOK_DEFAULT;
}


function tambahKeKeranjang(buku) {
    buku = { ...buku, id: String(buku.id) }; 
    const data = ambilKeranjang();
    const ada = data.find((item) => item.id === buku.id);
    const sudahDiKeranjang = ada ? ada.jumlah : 0;

    if (sudahDiKeranjang + 1 > ambilStok(buku)) {
        alert(`Stok "${buku.judul}" tidak cukup.`);
        return false;
    }

    if (ada) {
        ada.jumlah += 1;
    } else {
        data.push({ ...buku, jumlah: 1 });
    }

    simpanKeranjang(data);
    perbaruiBadge();
    return true;
}

    function hapusItem(id) {
        simpanKeranjang(ambilKeranjang().filter((item) => item.id !== id));
}


function ubahJumlah(id, selisih) {
    const data = ambilKeranjang();
    const item = data.find((i) => i.id === id);
    if (!item) return "";

    if (selisih > 0 && item.jumlah + selisih > ambilStok(item)) {
        return `Stok "${item.judul}" hanya tersisa ${ambilStok(item)}.`;
    }

    item.jumlah += selisih;
    if (item.jumlah < 1) {
        hapusItem(id);
    } else {
        simpanKeranjang(data);
    }
    return "";
}

function addToCart(idBuku) {
    const buku = typeof getBooks === "function" ? getBooks().find((b) => b.id == idBuku) : null;
    if (!buku) {
        alert("Data buku tidak ditemukan.");
        return;
    }

    let stok = Number(buku.stok);
    if (!Number.isFinite(stok)) {
        stok = buku.status_stok === "habis" ? 0 : buku.status_stok === "stok_terbatas" ? 3 : STOK_DEFAULT;
    }

    const berhasil = tambahKeKeranjang({
        id: buku.id,
        judul: buku.judul,
        penulis: buku.penulis,
        harga: buku.harga,
        gambar: buku.cover_img || "",
        stok: stok,
    });
    if (berhasil) tampilkanToast(`"${buku.judul}" ditambahkan ke keranjang`);
}

function tampilkanToast(teks) {
    let el = document.getElementById("toastKeranjang");
    if (!el) {
        el = document.createElement("div");
        el.id = "toastKeranjang";
        el.setAttribute("role", "status");
        el.className =
            "fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded bg-slate-900 px-5 py-3 text-sm text-[#F6F1E4] shadow-lg transition-opacity";
        document.body.appendChild(el);
    }
    el.textContent = teks;
    el.style.opacity = "1";
    clearTimeout(el._timer);
    el._timer = setTimeout(() => (el.style.opacity = "0"), 2000);
}

function rupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(angka);
}

function escapeHtml(teks) {
    const el = document.createElement("div");
    el.textContent = teks ?? "";
    return el.innerHTML;
}

function formatTanggal(iso) {
    return new Date(iso).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });
}

function perbaruiBadge() {
    const total = ambilKeranjang().reduce((n, item) => n + item.jumlah, 0);
    const teks = total > 99 ? "99+" : String(total);
    ["cartCount", "badgeKeranjang"].forEach((idEl) => {
        const badge = document.getElementById(idEl);
    if (badge) badge.textContent = teks;
    });
}

document.addEventListener("DOMContentLoaded", perbaruiBadge);

    window.addToCart = addToCart;
    window.tambahKeKeranjang = tambahKeKeranjang;
    window.ambilStok = ambilStok;
    window.perbaruiBadge = perbaruiBadge;

window.BS = {
    KEY_KERANJANG, KEY_RIWAYAT, KEY_STOK,
    bacaJSON, simpanJSON,
    ambilKeranjang, simpanKeranjang, ambilRiwayat,
    ambilStok, hapusItem, ubahJumlah,
    rupiah, escapeHtml, formatTanggal, perbaruiBadge,
};
})();