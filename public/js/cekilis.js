// URL parametrelerini al
const params = new URLSearchParams(window.location.search);
const drawId = parseInt(params.get("id"));

let selected = [];
let price = 0;

// ✅ Backend'den çekiliş bilgilerini al (LAN/WAN uyumlu)
fetch(`https://cekilis-backend-yldj.onrender.com/api/public/draw/${drawId}`)
    .then(r => r.json())
    .then(data => {
        price = data.price;
        document.getElementById("draw-title").innerText = `${drawId} TL Çekilişi`;

        const grid = document.getElementById("number-grid");
        const numMap = data.numbers || {};

        for (let i = 1; i <= 90; i++) {
            const item = document.createElement("div");
            item.classList.add("number-item");
            item.innerText = i;

            if (numMap[i]?.locked) {
                item.classList.add("locked");
            } else {
                item.addEventListener("click", () => toggle(i, item));
            }

            grid.appendChild(item);
        }
    });

// ✅ Numara seçme / kaldırma
function toggle(num, el) {
    num = parseInt(num);

    if (selected.includes(num)) {
        selected = selected.filter(n => n !== num);
        el.classList.remove("selected");
    } else {
        selected.push(num);
        el.classList.add("selected");
    }

    document.getElementById("selected").innerText = selected.join(", ");
    document.getElementById("total").innerText = selected.length * price;
}

// ✅ Modal aç
document.getElementById("joinBtn").onclick = () => {
    if (selected.length === 0) {
        alert("Lütfen en az 1 numara seçin.");
        return;
    }
    document.getElementById("formModal").style.display = "block";
};

// ✅ Form gönder
document.getElementById("sendBtn").onclick = async () => {
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!name || !phone) {
        alert("Lütfen tüm alanları doldurun.");
        return;
    }

    const payload = {
        name,
        phone,
        drawId: drawId,
        numbers: selected.map(n => parseInt(n)),
        total: selected.length * price
    };

    // ✅ WAN/LAN uyumlu backend adresi
    const res = await fetch("https://cekilis-backend-yldj.onrender.com/api/public/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
        alert("Katılım başarıyla gönderildi!");
        window.location.href = "/index.html";
    }
};