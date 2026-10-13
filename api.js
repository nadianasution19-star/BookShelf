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
  return booksData;
}