/* ---------------------------------------------------
   ANA SAYFA – GERİ SAYIM + CANLI YAYIN AKTİFLEŞTİRME
--------------------------------------------------- */

// Çekiliş tarihi – burayı istediğin tarihe göre düzenleyebilirsin
// Örnek: 31 Aralık 2025 saat 21:00
const targetDate = new Date("2025-12-31T21:00:00+03:00");

// HLS canlı yayın URL'i (RTMP → HLS dönüşmüş stream)
const LIVE_STREAM_URL = "http://localhost:8081/live/stream.m3u8";

// Geri sayım alanı
const timerEl = document.getElementById("timer");

// Canlı yayın konteyneri
const liveContainer = document.getElementById("live-container");

/* ---------------------------------------------------
   GERİ SAYIM FONKSİYONU
--------------------------------------------------- */
function updateTimer() {
    if (!timerEl) return;

    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
        timerEl.innerText = "Çekiliş Başladı!";
        startLivePlayer();
        return;
    }

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor(diff / 1000 / 60) % 60;
    const seconds = Math.floor(diff / 1000) % 60;

    timerEl.innerText = `${hours}sa ${minutes}dk ${seconds}sn`;
}

/* ---------------------------------------------------
   CANLI YAYINI BAŞLATMA
--------------------------------------------------- */
function startLivePlayer() {
    if (!liveContainer) return;

    // Placeholder'ı temizle
    liveContainer.innerHTML = `
        <video id="live-video" controls autoplay muted playsinline style="width:100%; border-radius:12px; background:#000;"></video>
    `;

    const video = document.getElementById("live-video");

    if (!video) return;

    // HLS.js ile oynatma
    if (window.Hls && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(LIVE_STREAM_URL);
        hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari desteği
        video.src = LIVE_STREAM_URL;
    }
}

/* ---------------------------------------------------
   SAYFA YÜKLENDİĞİNDE GERİ SAYIMI BAŞLAT
--------------------------------------------------- */
setInterval(updateTimer, 1000);
updateTimer();