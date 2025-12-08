const socket = io("https://cekilis-backend-yldj.onrender.com");

let localStream;
let peerConnections = {}; // Her viewer için ayrı peer connection

const preview = document.getElementById("preview");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const drawNumberBtn = document.getElementById("drawNumberBtn");

// STUN server
const rtcConfig = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
};

// Kamerayı aç
async function initCamera() {
    localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    });

    preview.srcObject = localStream;
}

initCamera();

// Yayını başlat
startBtn.onclick = () => {
    socket.emit("admin-start-stream");
    startBtn.disabled = true;
    stopBtn.disabled = false;
};

// Yayını durdur
stopBtn.onclick = () => {
    socket.emit("admin-stop-stream");
    startBtn.disabled = false;
    stopBtn.disabled = true;
};

// ✅ Numara çekme
drawNumberBtn.onclick = () => {
    const number = Math.floor(Math.random() * 100) + 1;
    socket.emit("admin-draw-number", number);
    alert("Çekilen numara: " + number);
};

// Viewer answer gönderdiğinde
socket.on("viewer-answer", ({ socketId, answer }) => {
    console.log("Viewer answer geldi:", socketId);

    const pc = peerConnections[socketId];
    if (!pc) return;

    pc.setRemoteDescription(new RTCSessionDescription(answer));
});

// ICE candidate geldiğinde
socket.on("ice-candidate", ({ from, candidate }) => {
    const pc = peerConnections[from];
    if (!pc) return;

    pc.addIceCandidate(new RTCIceCandidate(candidate));
});

// Viewer bağlandığında admin offer üretir
socket.on("viewer-join", async ({ viewerId, adminId }) => {
    console.log("Yeni viewer:", viewerId);

    const pc = new RTCPeerConnection(rtcConfig);
    peerConnections[viewerId] = pc;

    // Kamerayı peer connection'a ekle
    localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
    });

    // ICE candidate gönder
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("ice-candidate", {
                targetSocketId: viewerId, // ✅ direkt viewer'a
                candidate: event.candidate
            });
        }
    };

    // Offer oluştur
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Offer'ı backend üzerinden viewer'a gönder
    socket.emit("admin-offer", {
        viewerId,
        adminId,
        offer
    });
});