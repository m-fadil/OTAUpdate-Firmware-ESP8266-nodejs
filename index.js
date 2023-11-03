const mqtt = require("mqtt");
const prompt = require('prompt-sync')();

const protocol = 'mqtt'
const host = "mqtt.eclipseprojects.io"
const port = '1883'
const topic = ["klien_cekESP", "klien_updateTunggal"]

const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const connectUrl = `${protocol}://${host}:${port}`

const client = mqtt.connect(connectUrl, {
    clientId: clientId,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
})

function cekESP() {
    client.subscribe(topic, () => {
        console.log(topic)
    })
}

function menu() {
    console.clear();
    console.log("1. Update per-satu ESP\n9. Kembali\n0. Keluar")
    var pilih = prompt("-> ")
    console.log(pilih)
    if (pilih == 0) {
        process.exit(0)
    }
}

client.on('connect', () => {
    console.log('Connected')
    menu()
})

client.on('message', (topic, message) => {
    let strMessage = message.toString();
    console.log(strMessage);
})