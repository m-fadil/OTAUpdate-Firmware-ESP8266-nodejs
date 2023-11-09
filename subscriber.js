const mqtt = require("mqtt");

async function runESP() {
    const protocol = 'mqtt'
    const host = "192.168.1.71"
    const port = '1883'
    const clientId = `ESP-${Math.random().toString(16).toUpperCase().slice(9)}`
    const subsTopic = "OTAUpdate/esp"
    let version = 1

    const MAC = (() => {
        const macAddress = [];
        for (let i = 0; i < 6; i++) {
            const randomByte = Math.floor(Math.random() * 256);
            const hexByte = randomByte.toString(16).toUpperCase().padStart(2, '0');
            macAddress.push(hexByte);
        }
        return macAddress.join(':');
    })()

    const connectUrl = `${protocol}://${host}:${port}`

    const client = mqtt.connect(connectUrl, {
        clientId: clientId,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
    })

    function update() {
        var bar = 0

        const updating = setInterval(() => {
            let pesan = {
                command: 'updating',
                espId: clientId,
                progress: bar.toString(),
            }
            client.publish('OTAUpdate/klien', JSON.stringify(pesan))
            if (bar == 100) {
                version += 1
                clearInterval(updating)
            }
            bar += 10
        }, 1000)
    }

    function cek() {
        const pesan = {
            command: "checked",
            espId: clientId,
            version: version,
        }
        client.publish("OTAUpdate/klien", JSON.stringify(pesan))
    }
      
    client.on('connect', () => {
        console.clear()
        console.log('Connected')
        client.subscribe(subsTopic, () => {
            console.log(`Subscribe to topic '${subsTopic}'`)
        })
        
    })

    client.on('message', (topic, message) => {
        // message is a Buffer
        let strMessage = message.toString();
        // let objMessage = JSON.parse(strMessage);
        console.log(strMessage);
        if (strMessage == "check") {
            cek()
        }
        else if (strMessage == clientId) {
            update()
        }
    })
}
    
runESP().catch((err) => {
    console.log("Ada Error: " + err);
});