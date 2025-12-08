const API_BASE = "https://cekilis-backend-yldj.onrender.com/api";

const step1Div = document.getElementById("step1");
const step2Div = document.getElementById("step2");
const msgDiv = document.getElementById("loginMessage");

let currentUsername = "";

document.getElementById("loginStep1Btn").onclick = async () => {
    currentUsername = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    msgDiv.innerText = "";

    try {
        const res = await fetch(`${API_BASE}/admin/login/step1`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: currentUsername, password })
        });

        const data = await res.json();
        if (!data.success) {
            msgDiv.innerText = data.message || "Giriş başarısız";
            return;
        }

        msgDiv.innerText = "Telegram kodu gönderildi. Lütfen kodu girin.";
        step1Div.style.display = "none";
        step2Div.style.display = "block";
    } catch (e) {
        msgDiv.innerText = "Sunucu hatası";
    }
};

document.getElementById("loginStep2Btn").onclick = async () => {
    const code = document.getElementById("tgcode").value.trim();
    msgDiv.innerText = "";

    try {
        const res = await fetch(`${API_BASE}/admin/login/step2`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: currentUsername, code })
        });

        const data = await res.json();
        if (!data.success) {
            msgDiv.innerText = data.message || "Kod hatalı";
            return;
        }

        // token'ı localStorage'a yaz
        localStorage.setItem("adminToken", data.token);
        // panel sayfasına geç
        window.location.href = "admin-panel.html";
    } catch (e) {
        msgDiv.innerText = "Sunucu hatası";
    }
};