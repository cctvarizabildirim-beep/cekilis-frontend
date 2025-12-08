/* ---------------------------------------------------
   GENEL API YARDIMCI MODÜLÜ
   - Backend isteklerini tek yerden yönetir
   - Admin token otomatik eklenir
--------------------------------------------------- */

const API_BASE = "https://cekilis-backend-yldj.onrender.com/api";

/* ---------------------------------------------------
   TOKEN YÖNETİMİ
--------------------------------------------------- */
function getAdminToken() {
    return localStorage.getItem("adminToken") || "";
}

/* ---------------------------------------------------
   GENEL GET İSTEĞİ
--------------------------------------------------- */
async function apiGet(url, isAdmin = false) {
    const headers = { "Content-Type": "application/json" };

    if (isAdmin) {
        headers["x-admin-token"] = getAdminToken();
    }

    const res = await fetch(API_BASE + url, { headers });

    if (res.status === 401) {
        // Admin token geçersiz → login sayfasına yönlendir
        if (isAdmin) {
            localStorage.removeItem("adminToken");
            window.location.href = "admin-login.html";
        }
        throw new Error("Yetkisiz erişim");
    }

    return res.json();
}

/* ---------------------------------------------------
   GENEL POST İSTEĞİ
--------------------------------------------------- */
async function apiPost(url, body, isAdmin = false) {
    const headers = { "Content-Type": "application/json" };

    if (isAdmin) {
        headers["x-admin-token"] = getAdminToken();
    }

    const res = await fetch(API_BASE + url, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    });

    if (res.status === 401) {
        if (isAdmin) {
            localStorage.removeItem("adminToken");
            window.location.href = "admin-login.html";
        }
        throw new Error("Yetkisiz erişim");
    }

    return res.json();
}

/* ---------------------------------------------------
   KULLANICI TARAFI API'LERİ
--------------------------------------------------- */

// Çekiliş detayını getir (1–90 + fiyat)
async function getPublicDraw(drawId) {
    return apiGet(`/public/draw/${drawId}`);
}

// Çekilişe katılım gönder
async function joinDraw(payload) {
    return apiPost(`/public/join`, payload);
}

/* ---------------------------------------------------
   ADMIN TARAFI API'LERİ
--------------------------------------------------- */

// Admin login step1
async function adminLoginStep1(username, password) {
    return apiPost(`/admin/login/step1`, { username, password });
}

// Admin login step2 (telegram kod)
async function adminLoginStep2(username, code) {
    return apiPost(`/admin/login/step2`, { username, code });
}

// Tüm çekilişleri getir
async function adminGetDraws() {
    return apiGet(`/admin/draws`, true);
}

// Belirli çekiliş detayını getir
async function adminGetDrawDetail(drawId) {
    return apiGet(`/admin/draws/${drawId}`, true);
}

// Numara kilitle
async function adminLockNumbers(drawId, numbers, note = "") {
    return apiPost(`/admin/numbers/lock`, { drawId, numbers, note }, true);
}

// Numara serbest bırak
async function adminUnlockNumbers(drawId, numbers) {
    return apiPost(`/admin/numbers/unlock`, { drawId, numbers }, true);
}

// Not güncelle
async function adminUpdateNote(drawId, number, note) {
    return apiPost(`/admin/numbers/note`, { drawId, number, note }, true);
}