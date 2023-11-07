const mqtt = require('mqtt');
const prompt = require('prompt-sync')();

async function startKlien() {
    const protocol = 'mqtt'
    const host = 'mqtt.eclipseprojects.io'
    const port = '1883'
    const subsTopic = 'OTAUpdate/klien'
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
            client.subscribe(subsTopic)
            client.publish('OTAUpdate/esp', 'check')
            setTimeout(() => {
                resolve()
            }, 1500)
        })
    }

    async function updating(pesan) {
        updatingList[pesan.espId] = pesan.progress
        console.clear()
        Object.entries(updatingList).forEach(([key, value]) => {
            console.log(`${key}\n[${'#'.repeat(Math.round(Number(value)/5))}${'.'.repeat(20-Math.round(Number(value)/5))}] - ${value}%\n`)
        });
        if (Object.values(updatingList).every(value => value == '100')) {
            var _ = prompt('Tekan ENTER untuk melanjutkan...')
            menu()
        }
    } 
    
    async function menu() {
        await cekESP()
        console.clear()
        for (const [index, value] of ESPList.entries()) {
            console.log(`${index + 1}. ${value}`)
        }
        console.log('\n0. keluar\nMasukkan urutan ESP untuk di update')
        let pilih = prompt('-> ')
        if (pilih == 0) {
            process.exit(0)
        } else {
            if (pilih.length <= 1) {
                client.publish('OTAUpdate/esp', ESPList[pilih - 1])
            }else {
                let urutan = new Set(pilih.split(' ').join('').split(','))
                urutan.forEach((i) => {
                    client.publish('OTAUpdate/esp', ESPList[i - 1])
                })
            }
        }
    }

    function handling(pesan) {
        if (pesan.command == 'checked') {
            process.stdout.write('.')
            ESPList.push(pesan.espId)
        }
        else if (pesan.command == 'updating') {
            updating(pesan)
        }
    }
    
    client.on('connect', () => {
        console.log('Connected')
        menu()
    })
    
    client.on('message', (topic, message) => {
        handling(JSON.parse(message))
    })
}

startKlien().catch((err) => {
    console.log('Terdapat error: ' + err)
})