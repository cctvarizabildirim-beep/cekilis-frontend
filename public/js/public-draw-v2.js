// URL'den çekiliş ID'sini al
const params = new URLSearchParams(window.location.search);
const drawId = params.get("id");

// DOM referansları
const gridContainer = document.getElementById("number-grid");
const priceLabel = document.getElementById("price");
const continueBtn = document.getElementById("continue-btn");

let selectedNumbers = [];

// Çekiliş detaylarını backend'den çek
async function loadDraw() {
    try {
        const res = await fetch(`https://cekilis-backend-yldj.onrender.com/api/public/draw/${drawId}`);
        const data = await res.json();

        priceLabel.textContent = data.price + " TL";

        renderGrid(data.numbers);
    } catch (err) {
        console.error("Hata:", err);
    }
}

// Grid'i oluştur
function renderGrid(numbers) {
    gridContainer.innerHTML = "";

    Object.keys(numbers).forEach(num => {
        num = parseInt(num); // ✅ KRİTİK: numarayı number'a çevir

        const item = document.createElement("div");
        item.classList.add("number-item");
        item.textContent = num;

        if (numbers[num].locked) {
            item.classList.add("locked");
        } else {
            item.addEventListener("click", () => toggleNumber(num, item));
        }

        gridContainer.appendChild(item);
    });
}

// Numara seçme / kaldırma
function toggleNumber(num, element) {
    num = parseInt(num); // ✅ KRİTİK: her ihtimale karşı number'a çevir

    if (selectedNumbers.includes(num)) {
        selectedNumbers = selectedNumbers.filter(n => n !== num);
        element.classList.remove("selected");
    } else {
        selectedNumbers.push(num);
        element.classList.add("selected");
    }

    continueBtn.disabled = selectedNumbers.length === 0;
}

// Devam Et → çekiliş form sayfasına yönlendir
continueBtn.addEventListener("click", () => {
    if (selectedNumbers.length === 0) {
        alert("Lütfen en az 1 numara seçin.");
        return;
    }

    const url = `/cekilis.html?id=${drawId}&numbers=${selectedNumbers.join(",")}`;
    window.location.href = url;
});

// Başlat
loadDraw();