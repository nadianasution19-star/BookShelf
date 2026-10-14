const form = document.getElementById("form-newsletter");
const input = document.getElementById("email");
const pesan = document.getElementById("pesan");

form.addEventListener("submit", function (e) {
  e.preventDefault();               
  const email = input.value.trim();  

  if (email === "") {
    pesan.textContent = "Email belum diisi.";
    pesan.className = "mt-3 text-red-700";
  } else if (!email.includes("@") || !email.includes(".")) {
    pesan.textContent = "Format email belum benar. Contoh: nama@email.com";
    pesan.className = "mt-3 text-red-700";
  } else {
    pesan.textContent = "Terima kasih! " + email + " sudah terdaftar.";
    pesan.className = "mt-3 text-green-700";
    form.reset();                   
  }
});