const socket = io("https://cekilis-backend-yldj.onrender.com");

let pc;
const liveVideo = document.getElementById("liveVideo");
const statusEl = document.getElementById("status");

// Animasyon elemanları
const anim = document.getElementById("drawAnimation");
const numEl = document.getElementById("drawNumber");
const confettiCanvas = document.getElementById("confettiCanvas");
const burst = document.getElementById("burst");
const winnerScreen = document.getElementById("winnerScreen");
const winnerNumber = document.getElementById("winnerNumber");

const rtcConfig = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
};

// Yayına katıl
socket.emit("viewer-join");

// Admin yayını başlattığında adminId alınır
socket.on("stream-started", ({ adminId }) => {
    console.log("Admin ID alındı:", adminId);
    window.adminId = adminId; // ✅ adminId global saklanıyor
    statusEl.textContent = "Yayın başladı, bağlanılıyor...";
});

// Admin yayını durdurduğunda
socket.on("stream-stopped", () => {
    statusEl.textContent = "Yayın sona erdi.";
    if (pc) {
        pc.close();
        pc = null;
    }
});

// Admin offer gönderdiğinde
socket.on("admin-offer", async ({ offer, adminId }) => {
    console.log("Admin offer geldi, adminId:", adminId);

    window.adminId = adminId; // ✅ garanti altına alıyoruz

    pc = new RTCPeerConnection(rtcConfig);

    // ICE candidate gönder
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("ice-candidate", {
                targetSocketId: adminId, // ✅ direkt admin'e
                candidate: event.candidate
            });
        }
    };

    // Admin'in gönderdiği video stream'i al
    pc.ontrack = (event) => {
        console.log("Track alındı");
        liveVideo.srcObject = event.streams[0];
        statusEl.textContent = "Yayın izleniyor...";
    };

    // Offer'ı set et
    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    // Answer oluştur
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // Answer'ı backend üzerinden admin'e gönder
    socket.emit("viewer-answer", {
        targetSocketId: adminId, // ✅ direkt admin'e
        answer
    });
});

// ICE candidate geldiğinde
socket.on("ice-candidate", ({ candidate }) => {
    if (pc && candidate) {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
});

/* ---------------------------------------------------
   ✅ ÇEKİLİŞ ANİMASYONU + EFEKTLER
--------------------------------------------------- */

function startConfetti() {
    confettiCanvas.classList.remove("hidden");
    const ctx = confettiCanvas.getContext("2d");

    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const pieces = Array.from({ length: 150 }).map(() => ({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        w: 8,
        h: 14,
        color: `hsl(${Math.random() * 360}, 100%, 60%)`,
        speed: 2 + Math.random() * 3
    }));

    function update() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        pieces.forEach(p => {
            p.y += p.speed;
            if (p.y > confettiCanvas.height) p.y = -20;

            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.w, p.h);
        });

        requestAnimationFrame(update);
    }

    update();

    setTimeout(() => {
        confettiCanvas.classList.add("hidden");
    }, 5000);
}

function playBurst() {
    burst.classList.remove("hidden");
    setTimeout(() => {
        burst.classList.add("hidden");
    }, 800);
}

function showWinner(number) {
    winnerNumber.textContent = number;
    winnerScreen.classList.remove("hidden");

    setTimeout(() => {
        winnerScreen.classList.add("hidden");
    }, 5000);
}

socket.on("draw-number", (number) => {
    console.log("Çekilen numara:", number);

    anim.classList.remove("hidden");
    numEl.textContent = "";

    setTimeout(() => {
        numEl.textContent = number;

        playBurst();
        startConfetti();
        showWinner(number);

    }, 2000);
});