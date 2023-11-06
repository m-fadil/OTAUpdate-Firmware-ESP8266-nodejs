const mqtt = require("mqtt");
const prompt = require('prompt-sync')();

async function startKlien() {
    const protocol = 'mqtt'
    const host = "mqtt.eclipseprojects.io"
    const port = '1883'
    const klien_topic = ["OTAUpdate/klien/cek"]
    const ESPList = []
    const updatingList = {}
    
    const clientId = `ESP-${Math.random().toString(16).toUpperCase().slice(3)}`
    const connectUrl = `${protocol}://${host}:${port}`
    
    const client = mqtt.connect(connectUrl, {
        clientId: clientId,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
    })

    function cekESP() {
        ESPList.length = 0
        return new Promise((resolve, reject) => {
            client.subscribe(klien_topic)
            client.publish("OTAUpdate/esp", "cek")
            setTimeout(() => {
                resolve()
            }, 3000)
        })
    }

    async function updating(esp, message) {
        updatingList[esp] = message.toString()
        console.clear()
        Object.entries(updatingList).forEach(([key, value]) => {
            console.log(`${key}\n[${'#'.repeat(Math.round(Number(value)/5))}${'.'.repeat(20-Math.round(Number(value)/5))}] - ${value}%\n`)
        });
        if (Object.values(updatingList).every(value => value == "100")) {
            prompt("Tekan ENTER untuk melanjutkan...")
            menu()
        }
    } 
    
    async function updateSatuan() {
        await cekESP()
        console.clear()
        for (const [index, value] of ESPList.entries()) {
            console.log(`${index + 1}. ${value}`)
        }
        console.log("0. Kembali\nMasukkan urutan ESP untuk di update")
        let pilih = prompt("-> ")
        if (pilih == 0) {
            menu()
        } else {
            if (pilih.length <= 1) {
                client.subscribe(`OTAUpdate/klien/${ESPList[pilih - 1]}`)
                client.publish("OTAUpdate/esp", ESPList[pilih - 1])
            } else {
                let urutan = new Set(pilih.split(" ").join("").split(","))
                urutan.forEach((i) => {
                    client.subscribe(`OTAUpdate/klien/${ESPList[i - 1]}`)
                    client.publish("OTAUpdate/esp", ESPList[i - 1])
                })
            }
        }
    }
    
    function menu() {
        console.clear()
        console.log("1. Update per-satu ESP\n9. Kembali\n0. Keluar")
        let pilih = prompt("-> ")
        if (pilih == 1) {
            updateSatuan()
        }
        else if (pilih == 0) {
            process.exit(0)
        }
    }
    
    client.on('connect', () => {
        console.log('Connected')
        menu()
    })
    
    client.on('message', (topic, message) => {
        let strMessage = message.toString();
        if (topic == klien_topic) {
            process.stdout.write("#")
            ESPList.push(strMessage)
        }
        else if (ESPList.includes(topic.split("OTAUpdate/klien/")[1])) {
            updating(topic.split("OTAUpdate/klien/")[1], strMessage)
        }
    })
}

startKlien().catch((err) => {
    console.log("Terdapat error: " + err)
})