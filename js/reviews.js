function bacaReviews() {
  const data = localStorage.getItem("book_reviews");
  return data ? JSON.parse(data) : [];
}

function simpanReviews(data) {
  localStorage.setItem("book_reviews", JSON.stringify(data));
}

function tambahReview(e, bookId) {
  e.preventDefault();
  const user = getUserLogin();
  if (!user) {
    alert("Silakan login untuk memberikan ulasan.");
    window.location.href = "login.html";
    return;
  }

  const rating = document.getElementById("reviewRating").value;
  const komentar = document.getElementById("reviewKomentar").value.trim();

  if (!komentar) {
    alert("Komentar tidak boleh kosong.");
    return;
  }

  const reviews = bacaReviews();
  const reviewBaru = {
    id: Date.now(),
    book_id: bookId,
    user_id: user.id_user,
    nama_user: user.nama_lengkap,
    rating: parseInt(rating),
    komentar: komentar,
    created_at: sekarang()
  };

  reviews.push(reviewBaru);
  simpanReviews(reviews);
  renderReviewsInModal(bookId);
}

function renderReviewsInModal(bookId) {
  const container = document.getElementById("areaReviews");
  if (!container) return;

  const reviews = bacaReviews().filter(r => r.book_id === bookId);
  const user = getUserLogin();

  let formHtml = "";
  if (user) {
    formHtml = `
      <form onsubmit="tambahReview(event, ${bookId})" class="mt-4 border-2 border-slate-900 bg-white p-4">
        <h4 class="font-bold mb-2">Tulis Ulasan</h4>
        <div class="mb-3">
          <label class="block text-sm mb-1">Rating</label>
          <select id="reviewRating" class="border-2 border-slate-900 px-3 py-1 bg-white">
            <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
            <option value="4">⭐⭐⭐⭐ (4/5)</option>
            <option value="3">⭐⭐⭐ (3/5)</option>
            <option value="2">⭐⭐ (2/5)</option>
            <option value="1">⭐ (1/5)</option>
          </select>
        </div>
        <div class="mb-3">
          <textarea id="reviewKomentar" rows="3" placeholder="Bagaimana pendapatmu tentang buku ini?" class="w-full border-2 border-slate-900 p-2"></textarea>
        </div>
        <button type="submit" class="bg-slate-900 text-white font-bold px-4 py-2 hover:bg-black">Kirim Ulasan</button>
      </form>
    `;
  } else {
    formHtml = `
      <p class="text-sm text-slate-600 mt-4 border-2 border-dashed border-slate-400 p-3">
        <a href="login.html" class="font-bold underline">Login</a> untuk menulis ulasan.
      </p>
    `;
  }

  let listHtml = "";
  if (reviews.length === 0) {
    listHtml = `<p class="text-sm text-slate-500 mt-3">Belum ada ulasan untuk buku ini.</p>`;
  } else {
    listHtml = reviews.map(r => `
      <div class="border-b border-amber-200 py-3">
        <div class="flex justify-between items-center text-sm">
          <span class="font-bold">${r.nama_user}</span>
          <span class="text-amber-600 font-bold">${"⭐".repeat(r.rating)}</span>
        </div>
        <p class="text-sm mt-1">${r.komentar}</p>
        <span class="text-xs text-slate-400">${formatWaktu(r.created_at)}</span>
      </div>
    `).join("");
  }

  container.innerHTML = `
    <hr class="my-6 border-slate-900">
    <h3 class="text-xl font-bold mb-2">Ulasan Pembaca (${reviews.length})</h3>
    <div class="max-h-48 overflow-y-auto mb-4">${listHtml}</div>
    ${formHtml}
  `;
}