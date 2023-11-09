const mqtt = require('mqtt');
const prompt = require('prompt-sync')();

async function startKlien() {
    const protocol = 'mqtt'
    const host = '192.168.1.71'
    const port = '1883'
    const topic_pub = 'OTAUpdate/esp'
    const topic_sub = 'OTAUpdate/klien'
    const espList = []
    
    const clientId = `ESP-${Math.random().toString(16).toUpperCase().slice(3)}`
    const connectUrl = `${protocol}://${host}:${port}`
    
    const client = mqtt.connect(connectUrl, {
        clientId: clientId,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
    })

    function cekESP() {
        espList.length = 0
        return new Promise((resolve, reject) => {
            client.subscribe(topic_sub)
            client.subscribe(topic_sub)
            client.publish(topic_pub, 'check')
            setTimeout(() => {
                resolve()
            }, 2000)
        })
    }

    async function updating(pesan) {
        console.clear()
        for (const i in espList) {
            if (espList[i].espId == pesan.espId) {
                espList[i]['progress'] = pesan.progress
            }
        }
        for (const i in espList) {
            if (espList[i].hasOwnProperty('progress')) {
                const totalProgress = espList[i].total;
                const currentProgress = espList[i].progress;

                const progressPercentage = (currentProgress / totalProgress) * 100;
                const barLength = Math.round(progressPercentage / 5);
                const remainingLength = 20 - barLength;

                console.log(`${espList[i].espId}\n[${"#".repeat(barLength)}${".".repeat(remainingLength)}] - ${progressPercentage.toFixed(2)}%\n`);
            }
        }

        if (espList.every(esp => !esp.hasOwnProperty("progress") || esp.progress === '100')) {
            var _ = prompt('Tekan ENTER untuk melanjutkan...')
            menu()
        }
    } 
    
    async function menu() {
        await cekESP()
        console.clear()
        espList.forEach((esp, index) => {
            console.log(`${index+1}. ${esp.espId} version: ${esp.version}`)
        })
        console.log('\n(r) Muat ulang\n(q) Keluar\nMasukkan urutan ESP untuk di update')
        let pilih = prompt('-> ')
        if (pilih == 'r' || pilih == 'R') {
            menu()
        }
        else if (pilih == 'q' || pilih == 'Q') {
            process.exit(0)
        }
        else if (parseInt(pilih, 10) > 0 ) {
            if (pilih.length <= 1) {
                client.publish(topic_pub, espList[pilih - 1].espId)
            }else {
                let urutan = new Set(pilih.split(' ').join('').split(','))
                urutan.forEach((i) => {
                    client.publish(topic_pub, espList[i - 1].espId)
                })
            }
        }
        else {
            menu()
        }
    }

    function handling(pesan) {
        if (pesan.command == 'checked') {
            process.stdout.write('.')
            espList.push({
                espId: pesan.espId,
                version: pesan.version,
            })
        }
        else if (pesan.command == 'updating') {
            updating(pesan)
        }
    }
    
    client.on('connect', async () => {
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