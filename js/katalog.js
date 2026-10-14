let semuaBuku = new Array();
let kategoriList = new Array();
let kategoriDipilih = 0;    // 0 = semua kategori
const warnaCover = new Array("#13203F", "#7B202B", "#2D4F3F", "#4A3A28");

function ambil(id) {
  return document.getElementById(id);
}

function rupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function namaKategori(id) {
  for (let i = 0; i < kategoriList.length; i++) {
    if (kategoriList[i].id == id) {
      return kategoriList[i].nama_kategori;
    }
  }
  return "";
}

// ---------- Persiapan awal ----------
function initKatalog() {
  semuaBuku = getBooks();
  kategoriList = getCategories();
  bacaKategoriDariUrl();
  isiFilterTahun();
  tampilKategori();
  renderKatalog();
}

// Link dari index.html berbentuk katalog.html?kategori=Novel
// location.search berisi bagian URL mulai dari tanda "?"
function bacaKategoriDariUrl() {
  const query = location.search;
  if (query.indexOf("?kategori=") == 0) {
    const nama = query.substring(10);   // ambil teks setelah "?kategori="
    for (let i = 0; i < kategoriList.length; i++) {
      if (kategoriList[i].nama_kategori == nama) {
        kategoriDipilih = kategoriList[i].id;
      }
    }
  }
}

function isiFilterTahun() {
  const tahunList = new Array();

  // kumpulkan tahun tanpa duplikat
  for (let i = 0; i < semuaBuku.length; i++) {
    let sudahAda = false;
    for (let j = 0; j < tahunList.length; j++) {
      if (tahunList[j] == semuaBuku[i].tahun_terbit) {
        sudahAda = true;
      }
    }
    if (sudahAda == false) {
      tahunList[tahunList.length] = semuaBuku[i].tahun_terbit;
    }
  }

  // urutkan dari tahun terbesar (bubble sort)
  for (let a = 0; a < tahunList.length; a++) {
    for (let b = 0; b < tahunList.length - 1 - a; b++) {
      if (tahunList[b] < tahunList[b + 1]) {
        let sementara = tahunList[b];
        tahunList[b] = tahunList[b + 1];
        tahunList[b + 1] = sementara;
      }
    }
  }

  let html = '<option value="0">Semua tahun</option>';
  for (let k = 0; k < tahunList.length; k++) {
    html += '<option value="' + tahunList[k] + '">' + tahunList[k] + "</option>";
  }
  ambil("filterTahun").innerHTML = html;
}

// ---------- Sidebar kategori ----------
function tampilKategori() {
  let html = itemKategori(0, "Semua");
  for (let i = 0; i < kategoriList.length; i++) {
    html += itemKategori(kategoriList[i].id, kategoriList[i].nama_kategori);
  }
  ambil("daftarKategori").innerHTML = html;
}

function itemKategori(id, nama) {
  let gaya = "pl-4";
  if (id == kategoriDipilih) {
    gaya = "font-bold border-l-4 border-amber-600 pl-3";
  }
  return '<li class="border-b border-amber-200">' +
         '<button onclick="pilihKategori(' + id + ')" class="w-full text-left py-3 ' + gaya + '">' + nama + "</button></li>";
}

function pilihKategori(id) {
  kategoriDipilih = id;
  tampilKategori();
  renderKatalog();
}

// ---------- Filter + sorting ----------
function getFilteredBooks() {
  const kata = ambil("searchInput").value.toLowerCase();
  const tahun = ambil("filterTahun").value;
  const urut = ambil("sortBy").value;
  const hasil = new Array();

  for (let i = 0; i < semuaBuku.length; i++) {
    const b = semuaBuku[i];

    let cocokTeks = false;
    if (b.judul.toLowerCase().indexOf(kata) != -1 || b.penulis.toLowerCase().indexOf(kata) != -1) {
      cocokTeks = true;
    }

    let cocokKategori = false;
    if (kategoriDipilih == 0 || b.kategori_id == kategoriDipilih) {
      cocokKategori = true;
    }

    let cocokTahun = false;
    if (tahun == 0 || b.tahun_terbit == tahun) {
      cocokTahun = true;
    }

    if (cocokTeks && cocokKategori && cocokTahun) {
      hasil[hasil.length] = b;
    }
  }

  return urutkan(hasil, urut);
}

// bubble sort: bandingkan dua buku bersebelahan, tukar jika urutannya salah
function urutkan(list, urut) {
  for (let a = 0; a < list.length; a++) {
    for (let c = 0; c < list.length - 1 - a; c++) {
      const x = list[c];
      const y = list[c + 1];
      let tukar = false;

      if (urut == "terbaru" && x.created_at < y.created_at) { tukar = true; }
      if (urut == "termurah" && x.harga > y.harga) { tukar = true; }
      if (urut == "termahal" && x.harga < y.harga) { tukar = true; }
      if (urut == "judul" && x.judul > y.judul) { tukar = true; }

      if (tukar) {
        list[c] = y;
        list[c + 1] = x;
      }
    }
  }
  return list;
}

// ---------- Tampilan kartu ----------
function bookCard(b) {
  const warna = warnaCover[(b.id) % 4];

  let label = "";
  if (b.status_stok == "habis") {
    label = '<span class="absolute top-2 right-2 bg-[#7B202B] text-white text-xs px-2 py-1">Habis</span>';
  }
  if (b.status_stok == "stok_terbatas") {
    label = '<span class="absolute top-2 right-2 bg-amber-600 text-white text-xs px-2 py-1">Stok terbatas</span>';
  }

  // judul selalu ada di sampul; gambar menutupinya, dan kalau file gambar tidak ditemukan
  // (onerror) gambarnya disembunyikan sehingga yang terlihat blok warna + judul
  let sampul = '<p class="absolute bottom-4 left-4 right-4 text-lg text-[#E9D8A6]">' + b.judul + "</p>";
  if (b.cover_img != "") {
    sampul += '<img src="' + b.cover_img + '" alt="' + b.judul + '" onerror="this.style.display=\'none\'" class="absolute inset-0 w-full h-full object-cover">';
  }

  let tombol = "";
  if (b.status_stok == "habis") {
    tombol = '<span class="font-bold text-gray-400">Stok habis</span>';
  } else {
    tombol = '<button onclick="addToCart(' + b.id + ')" class="font-bold text-left hover:underline">Tambah ke keranjang</button>';
  }

  return '<article class="kartu">' +
    '<div onclick="openBookModal(' + b.id + ')" class="cover relative aspect-[3/5] cursor-pointer" style="background:' + warna + '">' +
      sampul + label +
    "</div>" +
    '<h3 class="font-bold mt-4">' + b.judul + "</h3>" +
    '<p class="text-sm text-gray-500">' + b.penulis + " | " + namaKategori(b.kategori_id) + "</p>" +
    '<div class="border-t border-amber-200 mt-2 pt-2 flex items-start justify-between gap-3 text-sm">' +
      "<span>" + rupiah(b.harga) + "</span>" + tombol +
    "</div>" +
    '<button onclick="openBookModal(' + b.id + ')" class="mt-3 w-full border-2 border-slate-900 py-2 text-sm font-bold transition hover:bg-slate-900 hover:text-[#F6F1E4]">Lihat detail</button>' +
  "</article>";
}

function renderKatalog() {
  const list = getFilteredBooks();

  let html = "";
  for (let i = 0; i < list.length; i++) {
    html += bookCard(list[i]);
  }
  ambil("bookGrid").innerHTML = html;

  if (list.length == 0) {
    ambil("emptyState").style.display = "block";
  } else {
    ambil("emptyState").style.display = "none";
  }

  ambil("hasilInfo").innerHTML = "Menampilkan " + list.length + " dari " + semuaBuku.length + " buku";

  const urut = ambil("sortBy").value;
  let judul = "Terbaru";
  if (urut == "termurah") { judul = "Harga termurah"; }
  if (urut == "termahal") { judul = "Harga termahal"; }
  if (urut == "judul") { judul = "Judul A-Z"; }
  ambil("judulDaftar").innerHTML = judul;
}

function resetFilter() {
  ambil("searchInput").value = "";
  ambil("filterTahun").value = 0;
  ambil("sortBy").value = "terbaru";
  kategoriDipilih = 0;
  tampilKategori();
  renderKatalog();
}

// jalankan katalog saat script ini dimuat (script ditaruh di bawah halaman)
initKatalog();