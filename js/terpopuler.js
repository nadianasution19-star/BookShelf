function renderBukuTerpopuler() {
  const container = document.getElementById("containerTerpopuler");
  if (!container) return;

  const semuaBuku = getBooks();
  
  // Ambil hanya buku berstatus populer "ya" dan batasi maksimal 8 buku
  const bukuPopuler = semuaBuku.filter(b => b.populer === "ya").slice(0, 8);

  let html = "";
  for (let i = 0; i < bukuPopuler.length; i++) {
    const b = bukuPopuler[i];
    const warna = warnaCover ? warnaCover[b.id % 4] : "#13203F";

    let sampul = `<p class="absolute bottom-4 left-4 right-4 text-lg text-[#E9D8A6]">${b.judul}</p>`;
    if (b.cover_img !== "") {
      sampul += `<img src="${b.cover_img}" alt="${b.judul}" onerror="this.style.display='none'" class="absolute inset-0 w-full h-full object-cover">`;
    }

    html += `
      <article class="border-2 border-slate-900 bg-white p-4 flex flex-col justify-between">
        <div>
          <div onclick="openBookModal(${b.id})" class="relative aspect-[3/5] cursor-pointer mb-4" style="background: ${warna}">
            ${sampul}
            <span class="absolute top-2 left-2 bg-amber-600 text-white text-xs px-2 py-1 font-bold">Populer</span>
          </div>
          <h3 class="font-bold text-lg leading-tight mb-1">${b.judul}</h3>
          <p class="text-sm text-gray-600 mb-2">${b.penulis}</p>
        </div>
        <div>
          <p class="font-bold text-slate-900 mb-3">${typeof rupiah === "function" ? rupiah(b.harga) : "Rp " + b.harga}</p>
          <button onclick="openBookModal(${b.id})" class="w-full border-2 border-slate-900 bg-slate-900 text-[#F6F1E4] py-2 text-sm font-bold transition hover:bg-black">
            Lihat Detail
          </button>
        </div>
      </article>
    `;
  }

  container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", renderBukuTerpopuler);