const mqtt = require("mqtt");

const protocol = 'mqtt'
const host = "192.168.1.71"
const port = '1883'
const topic = ["OTAUpdate/klien",]
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const connectUrl = `${protocol}://${host}:${port}`

const client = mqtt.connect(connectUrl, {
    clientId: clientId,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
})
  
client.on('connect', () => {
    console.log('Connected')
    client.subscribe(topic, () => {
        console.log(`Subscribe to topic '${topic}'`)
    })
    client.publish('OTAUpdate/esp', 'check')
})

client.on('message', (topic, message) => {
    try {
        var msg = JSON.parse(message)
    } catch {
        var msg = message.toString()
    }
    console.log(msg)
    // message is a Buffer
    // let strMessage = message.toString();
    // let objMessage = JSON.parse(strMessage);
    // console.log(strMessage);
})
