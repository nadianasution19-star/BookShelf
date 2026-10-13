// Login & Register (simulasi frontend, data di localStorage) 
function authDua(n) {
  if (n < 10) {
    return "0" + n;
  }
  return "" + n;
}
function waktuSekarang() {
  const d = new Date();
  return d.getFullYear() + "-" + authDua(d.getMonth() + 1) + "-" + authDua(d.getDate()) + " " +
         authDua(d.getHours()) + ":" + authDua(d.getMinutes()) + ":" + authDua(d.getSeconds());
}

// pengacak sederhana supaya password tidak disimpan apa adanya (bukan keamanan nyata)
function hashPassword(teks) {
  let hasil = 7;
  for (let i = 0; i < teks.length; i++) {
    hasil = (hasil * 31 + teks.charCodeAt(i)) % 1000000007;
  }
  return "h" + hasil;
}

// Data users
function ambilUsers() {
  const teks = localStorage.getItem("users");
  if (teks == null) {
    // akun contoh pertama kali
    const awal = new Array();
    awal[0] = {
      id_user: 1, nama_lengkap: "hirono", email: "hirono@gmail.com",
      password_hash: hashPassword("balala123"), no_hp: "081234567890", alamat: "Hirono",
      user_privilege: "customer", status_akun: "aktif",
      created_at: "2026-10-01 08:00:00", last_login: null
    };
    localStorage.setItem("users", JSON.stringify(awal));
    return awal;
  }
  return JSON.parse(teks);
}

function simpanUsers(data) {
  localStorage.setItem("users", JSON.stringify(data));
}

//Register
function daftarUser(nama, email, password, konfirmasi) {
  const users = ambilUsers();
  email = email.trim().toLowerCase();

  if (nama.trim() == "") { return "Nama lengkap belum diisi."; }
  if (email == "") { return "Email belum diisi."; }
  if (!email.includes("@") || !email.includes(".")) { return "Format email belum benar. Contoh: nama@email.com"; }
  if (password.length < 6) { return "Password minimal 6 karakter."; }
  if (password != konfirmasi) { return "Konfirmasi password tidak sama."; }

  let idBaru = 1;
  for (let i = 0; i < users.length; i++) {
    if (users[i].email == email) { return "Email sudah terdaftar. Silakan login."; }
    if (users[i].id_user >= idBaru) { idBaru = users[i].id_user + 1; }
  }

  users[users.length] = {
    id_user: idBaru, nama_lengkap: nama.trim(), email: email,
    password_hash: hashPassword(password), no_hp: "", alamat: "",
    user_privilege: "customer", status_akun: "aktif",
    created_at: waktuSekarang(), last_login: null
  };
  simpanUsers(users);
  return "";
}

//Login
function loginUser(email, password) {
  const users = ambilUsers();
  email = email.trim().toLowerCase();

  if (email == "" || password == "") { return "Email dan password wajib diisi."; }

  for (let i = 0; i < users.length; i++) {
    if (users[i].email == email && users[i].password_hash == hashPassword(password)) {
      if (users[i].status_akun != "aktif") { return "Akun ini sedang nonaktif."; }
      users[i].last_login = waktuSekarang();
      simpanUsers(users);
      localStorage.setItem("user_login", JSON.stringify({
        id_user: users[i].id_user, nama_lengkap: users[i].nama_lengkap, email: users[i].email
      }));
      return "";
    }
  }
  return "Email atau password salah.";
}

//Sesi
function getUserLogin() {
  const teks = localStorage.getItem("user_login");
  if (teks == null) {
    return null;
  }
  return JSON.parse(teks);
}

function logoutUser() {
  localStorage.removeItem("user_login");
  location.reload();
}

// teks di navbar: "Login" atau "Halo, Balala| Logout"
function updateNavbarLogin() {
  const area = document.getElementById("areaLogin");
  if (area == null) {
    return;
  }
  const user = getUserLogin();
  if (user == null) {
    area.innerHTML = '<a href="login.html" class="hover:underline">Login</a>';
  } else {
    const depan = user.nama_lengkap.split(" ")[0];
    area.innerHTML = "Halo, " + depan + ' | <button onclick="logoutUser()" class="hover:underline">Logout</button>';
  }
}

updateNavbarLogin();