const mqtt = require("mqtt");

async function runESP() {
    const protocol = 'mqtt'
    const host = "mqtt.eclipseprojects.io"
    const port = '1883'
    const clientId = `ESP-${Math.random().toString(16).toUpperCase().slice(9)}`
    const topic = ["OTAUpdate/esp"]

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
            client.publish(`OTAUpdate/klien/${clientId}`, bar.toString())
            if (bar == 100) clearInterval(updating)
            bar += 10
        }, 1500)
    }
      
    client.on('connect', () => {
        console.log('Connected')
        client.subscribe(topic, () => {
            console.log(`Subscribe to topic '${topic}'`)
        })
        
    })

    client.on('message', (topic, message) => {
        // message is a Buffer
        let strMessage = message.toString();
        // let objMessage = JSON.parse(strMessage);
        console.log(strMessage);
        if (strMessage == "cek") {
            client.publish("OTAUpdate/klien/cek", clientId)
        }
        else if (strMessage == clientId) {
            update()
        }
    })
}
    
runESP().catch((err) => {
    console.log("Ada Error: " + err);
});