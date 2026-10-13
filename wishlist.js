//Pop-up Detail Buku + Wishlist & Counter "Buku Dipilih"
const userLogin = getUserLogin();
let USER_ID = 0;
if (userLogin != null) {
  USER_ID = userLogin.id_user;
}
let bukuModalId = 0;     

function dua(n) {
  if (n < 10) {
    return "0" + n;
  }
  return "" + n;
}

// waktu sekarang 
function sekarang() {
  const d = new Date();
  return d.getFullYear() + "-" + dua(d.getMonth() + 1) + "-" + dua(d.getDate()) + " " +
         dua(d.getHours()) + ":" + dua(d.getMinutes()) + ":" + dua(d.getSeconds());
}

function formatWaktu(teks) {
  const bulan = new Array("Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des");
  const bagian = teks.split(" ");          // ["2026-10-13", "14:12:24"]
  const tgl = bagian[0].split("-");        // ["2026", "10", "13"]
  const jam = bagian[1].split(":");        // ["14", "12", "24"]
  return parseInt(tgl[2]) + " " + bulan[parseInt(tgl[1]) - 1] + " " + tgl[0] + ", " + jam[0] + ":" + jam[1];
}

function bacaData(kunci) {
  const teks = localStorage.getItem(kunci);
  if (teks == null) {
    return new Array();
  }
  return JSON.parse(teks);
}

function simpanData(kunci, data) {
  localStorage.setItem(kunci, JSON.stringify(data));
}

function cariBuku(id) {
  const daftar = getBooks();
  for (let i = 0; i < daftar.length; i++) {
    if (daftar[i].id == id) {
      return daftar[i];
    }
  }
  return null;
}

//Wishlist
function posisiWishlist(bookId) {
  const data = bacaData("wishlists");
  for (let i = 0; i < data.length; i++) {
    if (data[i].book_id == bookId && data[i].user_id == USER_ID) {
      return i;
    }
  }
  return -1;
}

// klik pertama = tambah ke wishlist, klik lagi = hapus dari wishlist
function toggleWishlist(bookId) {
  // wishlist hanya untuk pengguna yang sudah login
  if (USER_ID == 0) {
    alert("Silakan login dulu untuk memakai wishlist.");
    location.href = "login.html";
    return;
  }
  const data = bacaData("wishlists");
  const posisi = posisiWishlist(bookId);

  if (posisi == -1) {
    let idBaru = 1;
    for (let i = 0; i < data.length; i++) {
      if (data[i].id_wishlist >= idBaru) {
        idBaru = data[i].id_wishlist + 1;
      }
    }
    data[data.length] = {
      id_wishlist: idBaru,
      user_id: USER_ID,
      book_id: bookId,
      added_at: sekarang()
    };
  } else {
    data.splice(posisi, 1);
  }

  simpanData("wishlists", data);
  updateCounter();
  updateTombolModal();
  tampilWishlist();
}

// angka di navbar 
function updateCounter() {
  const data = bacaData("wishlists");
  let jumlah = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].user_id == USER_ID) {
      jumlah++;
    }
  }
  const badge = ambil("wishlistCount");
  if (badge != null) {
    badge.innerHTML = jumlah;
  }
  return jumlah;
}

// daftar "Buku Dipilih" di section #wishlist
function tampilWishlist() {
  // info pelanggan yang sedang login
  if (userLogin == null) {
    ambil("infoPelanggan").innerHTML = 'Belum login. <a href="login.html" class="underline">Login dulu</a> untuk memakai wishlist.';
  } else {
    ambil("infoPelanggan").innerHTML = "ID Pelanggan: <strong>" + userLogin.id_user + "</strong> (" + userLogin.nama_lengkap + ")";
  }

  const data = bacaData("wishlists");
  let html = "";
  let total = 0;
  let jumlah = 0;

  for (let i = 0; i < data.length; i++) {
    if (data[i].user_id != USER_ID) {
      continue;
    }
    const b = cariBuku(data[i].book_id);
    if (b == null) {
      continue;
    }
    jumlah++;
    total += b.harga;
    html += '<li class="flex items-center justify-between gap-4 border-b border-amber-200 py-3">' +
      "<div>" +
        '<p class="font-bold">' + b.judul + "</p>" +
        '<p class="text-sm text-gray-500">' + b.penulis + " | " + namaKategori(b.kategori_id) + "</p>" +
        '<p class="text-xs text-slate-500 mt-1">Ditambahkan ' + formatWaktu(data[i].added_at) + "</p>" +
      "</div>" +
      '<div class="text-right text-sm">' +
        '<p class="font-bold">' + rupiah(b.harga) + "</p>" +
        '<button onclick="toggleWishlist(' + b.id + ')" class="mt-2 border-2 border-red-700 bg-red-700 text-white px-3 py-1 text-sm font-bold transition hover:bg-red-800 hover:border-red-800">Hapus</button>' +
      "</div>" +
    "</li>";
  }

  if (jumlah == 0) {
    html = '<li class="border-2 border-dashed border-amber-300 p-8 text-center">Belum ada buku dipilih. Buka detail buku lalu klik Tambah ke Wishlist.</li>';
  }

  ambil("daftarWishlist").innerHTML = html;
  ambil("jumlahWishlist").innerHTML = jumlah;
  if (jumlah == 0) {
    ambil("totalWishlist").innerHTML = "";
  } else {
    ambil("totalWishlist").innerHTML = "Total: " + rupiah(total);
  }
}

// ---------- Pop-up detail buku ----------
function catatBookView(bookId) {
  const data = bacaData("book_views");
  let idBaru = 1;
  for (let i = 0; i < data.length; i++) {
    if (data[i].id_view >= idBaru) {
      idBaru = data[i].id_view + 1;
    }
  }
  data[data.length] = {
    id_view: idBaru,
    user_id: USER_ID,
    book_id: bookId,
    viewed_at: sekarang()
  };
  simpanData("book_views", data);
}

// dipanggil dari katalog.js (klik cover atau "Lihat detail")
function openBookModal(id) {
  const b = cariBuku(id);
  if (b == null) {
    return;
  }
  bukuModalId = id;

  const warna = warnaCover[(b.id - 1) % 4];
  let sampul = '<p class="absolute bottom-4 left-4 right-4 text-lg text-[#E9D8A6]">' + b.judul + "</p>";
  if (b.cover_img != "") {
    sampul += '<img src="' + b.cover_img + '" alt="' + b.judul + '" onerror="this.style.display=\'none\'" class="absolute inset-0 w-full h-full object-cover">';
  }

  let infoStok = "Stok: " + b.stok;
  if (b.status_stok == "habis") {
    infoStok = "Stok habis";
  }

  ambil("isiModal").innerHTML =
    '<div class="grid gap-6 md:grid-cols-[220px_1fr]">' +
      '<div class="relative aspect-[3/5]" style="background:' + warna + '">' + sampul + "</div>" +
      "<div>" +
        '<p class="text-amber-700 text-sm mb-1">' + namaKategori(b.kategori_id) + "</p>" +
        '<h2 class="text-2xl font-bold">' + b.judul + "</h2>" +
        '<p class="text-gray-500 mb-4">oleh ' + b.penulis + "</p>" +
        '<p class="text-xl font-bold mb-4">' + rupiah(b.harga) + "</p>" +
        '<p class="mb-4">' + b.deskripsi + "</p>" +
        '<p class="text-sm text-slate-600">Tahun terbit: ' + b.tahun_terbit + "</p>" +
        '<p class="text-sm text-slate-600 mb-6">' + infoStok + "</p>" +
        '<div class="flex flex-wrap gap-3">' +
          '<button id="tombolWishlist" onclick="toggleWishlist(' + b.id + ')" class="border-2 border-slate-900 px-5 py-3 font-bold transition"></button>' +
          '<button onclick="tutupModal()" class="border-2 border-slate-900 px-5 py-3 font-bold hover:bg-slate-900 hover:text-[#F6F1E4]">Tutup</button>' +
        "</div>" +
      "</div>" +
    "</div>";

  updateTombolModal();

  ambil("modalBuku").classList.remove("hidden");
  ambil("modalBuku").classList.add("flex");
  document.body.style.overflow = "hidden";   // halaman di belakang tidak ikut scroll

  catatBookView(id);
}

function tutupModal() {
  ambil("modalBuku").classList.add("hidden");
  ambil("modalBuku").classList.remove("flex");
  document.body.style.overflow = "";
  bukuModalId = 0;
}

// teks & warna tombol berubah sesuai status buku (sudah/belum di wishlist)
function updateTombolModal() {
  const tombol = ambil("tombolWishlist");
  if (bukuModalId == 0 || tombol == null) {
    return;
  }
  if (posisiWishlist(bukuModalId) == -1) {
    tombol.innerHTML = "Tambah ke Wishlist";
    tombol.className = "border-2 border-slate-900 bg-slate-900 text-[#F6F1E4] px-5 py-3 font-bold transition hover:bg-black";
  } else {
    tombol.innerHTML = "Hapus dari Wishlist";
    tombol.className = "border-2 border-amber-600 bg-amber-600 text-white px-5 py-3 font-bold transition hover:bg-amber-700";
  }
}

// tombol Esc menutup modal
document.addEventListener("keydown", function (e) {
  if (e.key == "Escape" && bukuModalId != 0) {
    tutupModal();
  }
});

// jalankan saat halaman dimuat
updateCounter();
tampilWishlist();