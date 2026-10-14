function authDua(n) {
  return n < 10 ? "0" + n : "" + n;
}

function waktuSekarang() {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    authDua(d.getMonth() + 1) +
    "-" +
    authDua(d.getDate()) +
    " " +
    authDua(d.getHours()) +
    ":" +
    authDua(d.getMinutes()) +
    ":" +
    authDua(d.getSeconds())
  );
}

// Hashing sederhana untuk simulasi
function hashPassword(teks) {
  let hasil = 7;
  for (let i = 0; i < teks.length; i++) {
    hasil = (hasil * 31 + teks.charCodeAt(i)) % 1000000007;
  }
  return "h" + hasil;
}

// Ambil daftar pengguna dari localStorage
function ambilUsers() {
  const teks = localStorage.getItem("users");
  if (teks == null) {
    // Data default pertama kali
    const awal = [
      {
        id_user: 1,
        nama_lengkap: "hirono",
        email: "hirono@gmail.com",
        password_hash: hashPassword("hirono123"),
        no_hp: "081234567890",
        alamat: "Jl. Bunga No. 12",
        user_privilege: "customer",
        status_akun: "aktif",
        created_at: "2026-10-01 08:00:00",
        last_login: null
      },
      {
        id_user: 2,
        nama_lengkap: "Admin Bookshelf",
        email: "admin@gmail.com",
        password_hash: hashPassword("admin123"),
        no_hp: "081234567891",
        alamat: "Kantor Pusat Bookshelf",
        user_privilege: "admin",
        status_akun: "aktif",
        created_at: "2026-10-01 08:00:00",
        last_login: null
      }
    ];
    localStorage.setItem("users", JSON.stringify(awal));
    return awal;
  }
  return JSON.parse(teks);
}

function simpanUsers(data) {
  localStorage.setItem("users", JSON.stringify(data));
}

// Fungsi Pendaftaran (Register)
function daftarUser(nama, email, password, konfirmasi) {
  const users = ambilUsers();
  email = email.trim().toLowerCase();

  if (nama.trim() === "") return "Nama lengkap belum diisi.";
  if (email === "") return "Email belum diisi.";
  if (!email.includes("@") || !email.includes("."))
    return "Format email belum benar. Contoh: nama@email.com";
  if (password.length < 6) return "Password minimal 6 karakter.";
  if (password !== konfirmasi) return "Konfirmasi password tidak sama.";

  let idBaru = 1;
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      return "Email sudah terdaftar. Silakan login.";
    }
    if (users[i].id_user >= idBaru) {
      idBaru = users[i].id_user + 1;
    }
  }

  // Akun baru pendaftar otomatis berstatus "customer"
  const userBaru = {
    id_user: idBaru,
    nama_lengkap: nama.trim(),
    email: email,
    password_hash: hashPassword(password),
    no_hp: "",
    alamat: "",
    user_privilege: "customer",
    status_akun: "aktif",
    created_at: waktuSekarang(),
    last_login: null
  };

  users.push(userBaru);
  simpanUsers(users);
  return "";
}

// Fungsi Masuk (Login)
function loginUser(email, password) {
  const users = ambilUsers();
  email = email.trim().toLowerCase();

  if (email === "" || password === "") {
    return "Email dan password wajib diisi.";
  }

  for (let i = 0; i < users.length; i++) {
    if (
      users[i].email === email &&
      users[i].password_hash === hashPassword(password)
    ) {
      if (users[i].status_akun !== "aktif") {
        return "Akun ini sedang nonaktif.";
      }

      users[i].last_login = waktuSekarang();
      simpanUsers(users);

      // Simpan data akun aktif beserta privilege-nya ke sesi
      localStorage.setItem(
        "user_login",
        JSON.stringify({
          id_user: users[i].id_user,
          nama_lengkap: users[i].nama_lengkap,
          email: users[i].email,
          user_privilege: users[i].user_privilege
        })
      );

      return ""; // Berhasil tanpa error
    }
  }
  return "Email atau password salah.";
}

// Mengambil status user yang sedang login
function getUserLogin() {
  const teks = localStorage.getItem("user_login");
  return teks ? JSON.parse(teks) : null;
}

// Logout
function logoutUser() {
  localStorage.removeItem("user_login");
  location.reload();
}

// Update tampilan Navbar secara dinamis
function updateNavbarLogin() {
  const area = document.getElementById("areaLogin");
  const linkAdmin = document.getElementById("linkAdmin");

  if (!area) return;

  const user = getUserLogin();
  if (!user) {
    area.innerHTML = '<a href="login.html" class="hover:underline">Login</a>';
    if (linkAdmin) linkAdmin.classList.add("hidden");
  } else {
    const depan = user.nama_lengkap.split(" ")[0];
    area.innerHTML =
      "Halo, " +
      depan +
      ' | <button onclick="logoutUser()" class="hover:underline">Logout</button>';

    // Tombol Admin di navbar hanya muncul jika akun bertipe admin
    if (linkAdmin) {
      if (user.user_privilege === "admin") {
        linkAdmin.classList.remove("hidden");
      } else {
        linkAdmin.classList.add("hidden");
      }
    }
  }
}

// Jalankan otomatis
updateNavbarLogin();