//% weight=70
namespace WifiModule {
    const NEWLINE: string = "\r\n"
    const NEWLINE2: string = NEWLINE + NEWLINE
    let message: string = ""
    let messageSplits: string[] = []

    /**
     * Connect to MQTT platform.
     * @param clientId MQTT client ID (device ID)
     * @param username Username (MQTT Platform)
     * @param password Password (MQTT Platform)
     * @param host Host (MQTT Platform) eg: io.adafruit.com
     */
    //% subcategory="MQTT"
    //% weight=100
    //% block="Connect MQTT with|ClientID %clientId|Username %username|Password %passsword|Host %host"
    export function connectMQTT(clientId: string, username: string, password: string, host: string) {
        disconnectMQTT()
        
        let cmd
        cmd = 'AT+MQTTUSERCFG=0,1,"' + clientId +'","' + username +'","' + password + '",0,0,""'
        executeAtCommand(cmd, 1000)
        cmd = 'AT+MQTTCONN=0,"' + host + '",1883,0'
        executeAtCommand(cmd, 1000)
    }

    /**
     * Disconnect MQTT.
     */
    //% subcategory="MQTT"
    //% weight=90
    //% block="Disconnect MQTT"
    export function disconnectMQTT() {
        executeAtCommand("AT+MQTTCLEAN=0", 1000)
    }

    /**
     * Is MQTT connected? 
     */
    //% subcategory="MQTT"
    //% weight=80
    //% block="Is MQTT connected?"
    export function isMQTTConnected(): boolean {
        executeAtCommand("AT+MQTTCONN?", 1000)
        
        return true
    }

    /**
     * Receive and parse MQTT message?
     * Used in loop to parse every 2+ seconds.
     */
    //% subcategory="MQTT"
    //% weight=35
    //% block="Received MQTT message?"
    export function receiveMQTTMessage() : boolean {
        if (WifiModule.isBusy()) {
            return false
        }

        message = serial.readString()
        // basic.showNumber(message.length)
        if (message.indexOf("+MQTTSUBRECV:") == 0) {
            messageSplits = message.substr(message.indexOf("+MQTTSUBRECV:")).split(",")
            return true
        }

        return false
    }

    /**
     * Get message
     */
    //% subcategory="MQTT"
    //% weight=30
    //% block="Get received message"
    export function getMessage() {
        return message
    }

    /**
     * Get message topic
     */
    //% subcategory="MQTT"
    //% weight=30
    //% block="Get received message topic"
    export function getMessageTopic() {
        return messageSplits.length == 4 ? messageSplits[1] : ""
    }

    /**
     * Get message data
     */
    //% subcategory="MQTT"
    //% weight=30
    //% block="Get received message data"
    export function getMessageData() {
        return messageSplits.length == 4 ? messageSplits[3] : ""
    }

    /**
     * Subscribe topic on MQTT platform.
     * @param topic Topic (path)
     */
    //% subcategory="MQTT"
    //% weight=50
    //% block="Subscribe topic|Topic %topic"
    export function subscribeMQTT(topic: string) {
        let cmd
        cmd = 'AT+MQTTSUB=0,"' + topic + '",0'
        WifiModule.executeAtCommand(cmd, 1000)
    }

    /**
     * Unsubscribe topic on MQTT platform.
     * @param topic Topic (path)
     */
    //% subcategory="MQTT"
    //% weight=40
    //% block="Unsubscribe topic|Topic %topic"
    export function unsubscribeMQTT(topic: string) {
        let cmd
        cmd = 'AT+MQTTUNSUB=0,"' + topic + '"'
        WifiModule.executeAtCommand(cmd, 1000)
    }

    /**
     * Publish value to topic on MQTT platform.
     * @param topic Topic (path)
     * @param value Value
     */
    //% subcategory="MQTT"
    //% weight=60
    //% block="Publish topic|Topic %topic|Value %value"
    export function publishMQTT(topic: string, value: string) {
        let cmd
        cmd = 'AT+MQTTPUB=0,"' + topic + '","' + value + '",0,0'
        WifiModule.executeAtCommand(cmd, 1000)
    }

}