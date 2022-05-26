//% weight=70
namespace WifiModule {
    const NEWLINE: string = "\r\n"
    const NEWLINE2: string = NEWLINE + NEWLINE
    let topicCallbackDict: { [key: string]: Action } = {};

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
     * Subscribe topic on MQTT platform.
     * @param topic Topic (path)
     */
    //% subcategory="MQTT"
    //% weight=10
    //% block="Subscribe topic|Topic %topic"
    export function subscribeMQTT(topic: string) {
        let cmd
        cmd = 'AT+MQTTSUB=0,"' + topic + '",0'
        WifiModule.executeAtCommand(cmd, 1000)
    }

    /**
     * MQTT processes the subscription when receiving message
     */
    //% subcategory="MQTT"
    //% weight=98
    //% block="MQTT on %top |received"
    export function microIoT_MQTT_Event(topic: string, cb: (message: string) => void) {
        topicCallbackDict[topic] = () => {
            cb(topic)
        }
    }

    /**
     * Publish value to topic on MQTT platform.
     * @param topic Topic (path)
     * @param value Value
     */
    //% subcategory="MQTT"
    //% block="Publish topic|Topic %topic|Value %value"
    export function publishMQTT(topic: string, value: string) {
        let cmd
        cmd = 'AT+MQTTPUB=0,"' + topic + '","' + value + '",0,0'
        WifiModule.executeAtCommand(cmd, 1000)
    }

}