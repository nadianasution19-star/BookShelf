function getCategories() {
  const hasil = new Array();
  for (let i = 0; i < categoriesData.length; i++) {
    if (categoriesData[i].status_kategori == "aktif") {
      hasil[hasil.length] = categoriesData[i];
    }
  }
  return hasil;
}

function getBooks() {
  const dataLokal = localStorage.getItem("booksData");
  if (dataLokal != null) {
    return JSON.parse(dataLokal);
  }
  // Jika belum ada di localStorage, simpan data awal dari data.js
  localStorage.setItem("booksData", JSON.stringify(booksData));
  return booksData;
}