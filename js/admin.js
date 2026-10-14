// Fungsi pembantu independen untuk mengantisipasi error
function formatRupiahAdmin(angka) {
  return "Rp " + (angka || 0).toLocaleString("id-ID");
}

function renderTabelAdmin() {
  const tbody = document.getElementById("tabelBukuAdmin");
  if (!tbody) return;

  let bukuList = typeof getBooks === "function" ? getBooks() : JSON.parse(localStorage.getItem("booksData") || "[]");
  
  // Urutkan berdasarkan ID dari terkecil ke terbesar (1, 2, 3 ... 25)
  bukuList.sort((a, b) => a.id - b.id);

  if (bukuList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-gray-500">Belum ada data buku.</td></tr>`;
    return;
  }

  tbody.innerHTML = bukuList.map(b => `
    <tr class="border-b border-slate-300 hover:bg-amber-100">
      <td class="p-3 font-bold">${b.id}</td>
      <td class="p-3">${b.judul || ''}</td>
      <td class="p-3">${b.penulis || ''}</td>
      <td class="p-3">${formatRupiahAdmin(b.harga)}</td>
      <td class="p-3">${b.stok || 0}</td>
      <td class="p-3 uppercase font-bold text-xs">${b.populer || 'TIDAK'}</td>
      <td class="p-3 text-center space-x-2">
        <button onclick="editBuku(${b.id})" class="bg-amber-600 text-white px-3 py-1 font-bold text-xs">Edit</button>
        <button onclick="hapusBuku(${b.id})" class="bg-red-700 text-white px-3 py-1 font-bold text-xs">Hapus</button>
      </td>
    </tr>
  `).join("");
}

function bukaModalForm(isEdit = false) {
  document.getElementById("modalTitle").innerText = isEdit ? "Edit Buku" : "Tambah Buku Baru";
  document.getElementById("modalAdmin").classList.remove("hidden");
  document.getElementById("modalAdmin").classList.add("flex");
}

function tutupModalAdmin() {
  document.getElementById("modalAdmin").classList.add("hidden");
  document.getElementById("modalAdmin").classList.remove("flex");
  document.getElementById("formAdminBuku").reset();
  document.getElementById("adminBookId").value = "";
}

function simpanBukuAdmin(e) {
  e.preventDefault();
  const idInput = document.getElementById("adminBookId").value;
  let list = typeof getBooks === "function" ? getBooks() : JSON.parse(localStorage.getItem("booksData") || "[]");

  const stokNilai = parseInt(document.getElementById("adminStok").value) || 0;
  const statusPopulerInput = document.getElementById("adminPopuler").value; // "ya" atau "tidak"

  // 1. HITUNG ID BARU BERURUTAN
  let idBaru = 1;
  if (!idInput) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id >= idBaru) {
        idBaru = list[i].id + 1;
      }
    }
  }

  // Cek apakah buku ini sebelumnya sudah populer atau belum
  const idTarget = idInput ? parseInt(idInput) : idBaru;
  const bukuLama = list.find(b => b.id === idTarget);
  const sebelumnyaPopuler = bukuLama ? bukuLama.populer === "ya" : false;

  // 2. LOGIKA MAKSIMAL 8 BUKU TERPOPULER
  if (statusPopulerInput === "ya" && !sebelumnyaPopuler) {
    // Ambil semua daftar buku yang saat ini populer
    const daftarPopuler = list.filter(b => b.populer === "ya");

    // Jika sudah ada 8 atau lebih buku populer
    if (daftarPopuler.length >= 8) {
      // Ambil buku populer yang urutannya paling terakhir (paling lama)
      const bukuTerakhir = daftarPopuler[daftarPopuler.length - 1];
      
      // Ubah status buku tersebut menjadi tidak populer lagi
      const indexTerakhir = list.findIndex(b => b.id === bukuTerakhir.id);
      if (indexTerakhir !== -1) {
        list[indexTerakhir].populer = "tidak";
      }
    }
  }

  // 3. SUSUN DATA BUKU YANG DISIMPAN
  const dataBuku = {
    id: idTarget,
    judul: document.getElementById("adminJudul").value,
    penulis: document.getElementById("adminPenulis").value,
    harga: parseInt(document.getElementById("adminHarga").value) || 0,
    stok: stokNilai,
    kategori_id: parseInt(document.getElementById("adminKategori").value),
    populer: statusPopulerInput,
    cover_img: document.getElementById("adminCover").value || "",
    deskripsi: document.getElementById("adminDeskripsi").value,
    status_stok: stokNilai > 0 ? "tersedia" : "habis",
    tahun_terbit: new Date().getFullYear(),
    created_at: typeof waktuSekarang === "function" ? waktuSekarang() : "2026-10-14 00:00:00"
  };

  if (idInput !== "") {
    const index = list.findIndex(b => b.id === parseInt(idInput));
    if (index !== -1) {
      list[index] = dataBuku;
    }
  } else {
    list.push(dataBuku); // Masukkan ke paling bawah agar ID berurutan
  }

  // 4. SIMPAN KE LOCALSTORAGE & REFRESH TABEL
  localStorage.setItem("booksData", JSON.stringify(list));
  
  tutupModalAdmin();
  renderTabelAdmin();
}

function editBuku(id) {
  const list = typeof getBooks === "function" ? getBooks() : JSON.parse(localStorage.getItem("booksData") || "[]");
  const b = list.find(item => item.id === id);
  if (!b) return;

  document.getElementById("adminBookId").value = b.id;
  document.getElementById("adminJudul").value = b.judul || "";
  document.getElementById("adminPenulis").value = b.penulis || "";
  document.getElementById("adminHarga").value = b.harga || 0;
  document.getElementById("adminStok").value = b.stok || 0;
  document.getElementById("adminKategori").value = b.kategori_id || 1;
  document.getElementById("adminPopuler").value = b.populer || "tidak";
  document.getElementById("adminCover").value = b.cover_img || "";
  document.getElementById("adminDeskripsi").value = b.deskripsi || "";

  bukaModalForm(true);
}

function hapusBuku(id) {
  if (confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
    let list = typeof getBooks === "function" ? getBooks() : JSON.parse(localStorage.getItem("booksData") || "[]");
    list = list.filter(b => b.id !== id);
    localStorage.setItem("booksData", JSON.stringify(list));
    renderTabelAdmin();
  }
}

document.addEventListener("DOMContentLoaded", renderTabelAdmin);