const API_BASE = "https://cekilis-backend-yldj.onrender.com/api";
const token = localStorage.getItem("adminToken");

if (!token) {
    window.location.href = "admin-login.html";
}

const headersAuth = {
    "Content-Type": "application/json",
    "x-admin-token": token
};

const drawListEl = document.getElementById("drawList");
const drawTitleEl = document.getElementById("drawTitle");
const drawPriceEl = document.getElementById("drawPrice");
const numbersGridEl = document.getElementById("numbersGrid");
const detailNumberEl = document.getElementById("detailNumber");
const detailStatusEl = document.getElementById("detailStatus");
const detailNoteEl = document.getElementById("detailNote");

let currentDrawId = null;
let currentDrawData = null;
let selectedNumbersForBulk = new Set();
let focusedNumber = null;

document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "admin-login.html";
};

// çekiliş listesini yükle
async function loadDraws() {
    const res = await fetch(`${API_BASE}/admin/draws`, { headers: headersAuth });
    if (res.status === 401) {
        localStorage.removeItem("adminToken");
        window.location.href = "admin-login.html";
        return;
    }
    const draws = await res.json();

    drawListEl.innerHTML = "";
    draws.forEach(d => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.innerText = `${d.id} TL`;
        btn.onclick = () => {
            document.querySelectorAll("#drawList button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            loadDrawDetail(d.id);
        };
        li.appendChild(btn);
        drawListEl.appendChild(li);
    });
}

// belirli çekiliş detayını al ve grid'i çiz
async function loadDrawDetail(drawId) {
    const res = await fetch(`${API_BASE}/admin/draws/${drawId}`, { headers: headersAuth });
    if (res.status === 401) {
        localStorage.removeItem("adminToken");
        window.location.href = "admin-login.html";
        return;
    }
    const data = await res.json();
    currentDrawId = drawId;
    currentDrawData = data;
    selectedNumbersForBulk.clear();
    focusedNumber = null;
    detailNumberEl.innerText = "—";
    detailStatusEl.innerText = "—";
    detailNoteEl.value = "";

    drawTitleEl.innerText = `${drawId} TL Çekilişi`;
    drawPriceEl.innerText = `Birim Fiyat: ${data.price} TL`;
    renderNumbersGrid();
}

function renderNumbersGrid() {
    numbersGridEl.innerHTML = "";

    for (let i = 1; i <= 90; i++) {
        const btn = document.createElement("button");
        btn.className = "number-btn";
        btn.innerText = i;

        const numInfo = currentDrawData.numbers[i] || {};
        if (numInfo.locked) {
            btn.classList.add("locked");
        }

        btn.onclick = () => {
            // bulk seçim için toggle
            if (selectedNumbersForBulk.has(i)) {
                selectedNumbersForBulk.delete(i);
                btn.classList.remove("selected");
            } else {
                selectedNumbersForBulk.add(i);
                btn.classList.add("selected");
            }
            // detay panelini bu numaraya odakla
            focusedNumber = i;
            updateDetailPanel(i, numInfo);
        };

        numbersGridEl.appendChild(btn);
    }
}

function updateDetailPanel(num, info) {
    detailNumberEl.innerText = num;
    detailStatusEl.innerText = info.locked ? "Kilitli" : "Serbest";
    detailNoteEl.value = info.note || "";
}

// toplu kilitle
document.getElementById("lockSelectedBtn").onclick = async () => {
    if (!currentDrawId || selectedNumbersForBulk.size === 0) return;

    const note = prompt("Not giriniz (opsiyonel):") || "";
    const numbers = Array.from(selectedNumbersForBulk);

    await fetch(`${API_BASE}/admin/numbers/lock`, {
        method: "POST",
        headers: headersAuth,
        body: JSON.stringify({ drawId: currentDrawId, numbers, note })
    });

    // tekrar yükle
    await loadDrawDetail(currentDrawId);
};

// toplu serbest bırak
document.getElementById("unlockSelectedBtn").onclick = async () => {
    if (!currentDrawId || selectedNumbersForBulk.size === 0) return;

    const numbers = Array.from(selectedNumbersForBulk);

    await fetch(`${API_BASE}/admin/numbers/unlock`, {
        method: "POST",
        headers: headersAuth,
        body: JSON.stringify({ drawId: currentDrawId, numbers })
    });

    await loadDrawDetail(currentDrawId);
};

// tek numara için not kaydet
document.getElementById("saveNoteBtn").onclick = async () => {
    if (!currentDrawId || !focusedNumber) return;

    const note = detailNoteEl.value;

    await fetch(`${API_BASE}/admin/numbers/note`, {
        method: "POST",
        headers: headersAuth,
        body: JSON.stringify({
            drawId: currentDrawId,
            number: focusedNumber,
            note
        })
    });

    await loadDrawDetail(currentDrawId);
};

loadDraws();