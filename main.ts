/**
 * Use this file to define custom functions and blocks.
 * Read more at https://makecode.microbit.org/blocks/custom
 */

/**
 * WiFi with Blynk blocks
 * 
 * ESP01 must be ready with AT v1.7.4.
 * 
 * ESP01 <--> microbit
 * 3V3 <--> 3V3
 * GND <--> GND
 * RX <--> P1
 * TX <--> P2
 * 
 * ESP01 DIY header <--> IOBit
 * Put adapter on P1,P2 (IOBit)
 * 
 * NOTE:
 * - ESP01 AT firmware doesn't support SSL.
 * - WiFi extension doesn't officially supported Blynk. Always use Virtual Pin on Blynk.
 */
//% weight=100 color=#0fbc11 icon="\uf1eb" block="WiFi Module"
namespace WifiModule {
    let debugging: boolean = false
    let response: string = ""
    let is_connected: boolean = false
    let is_busy: boolean = false
    let expectedLength = 0

    /**
     * Execute AT command
     * @param command AT command
     * @param waitMs Waiting in milliseconds
     */
    //% block="AT command|Command %command|Wait in ms %waitMs"
    export function executeAtCommand(command: string, waitMs: number, ignoreResponse: boolean = false) {
        let newLine: string = "\r\n"
        if (isConnected) {
            let timeout = 15000 // in ms
            response = ""
            expectedLength = 0
            is_busy = true
            serial.writeString("" + command + newLine)
            if (ignoreResponse) {
                is_busy = false
            }
            while (is_busy && timeout > 0) {
                basic.pause(100)
                timeout = timeout - 100
            }            
            response = response + serial.readBuffer(0).toString()   // Workaround: try read what left in buffer.
            basic.pause(waitMs)
        } else {
            basic.showIcon(IconNames.No)
        }
    }

    function readFromWiFi() {
        // let chunk = serial.readString()
        let chunk = serial.readBuffer(0)   // try read all available bytes.
        //let chunk = serial.readUntil(serial.delimiters(Delimiters.NewLine))   // not work

        if (chunk.length == 0) {
            return
        }
        // basic.showString("c" + chunk.length + ":" + chunk.slice(chunk.length-3).toString() + ".")
        response = response + chunk.toString()

        if (response.includes("\nOK")) {
            is_busy = false
        } else if (response.includes("\nFAIL")) {
            is_busy = false
        } else if (response.includes("SEND OK")) {
            response = response.substr(response.indexOf("SEND OK") + 8)
        } else if (response.includes("SEND FAIL")) {
            response = response.substr(response.indexOf("SEND FAIL") + 8)
        } else if (response.includes("ERROR")) {
            is_connected = false
            is_busy = false
        } else if (response.includes("+IPD,")) {
            let start = response.indexOf("+IPD,") + 5
            let end = response.indexOf(":", start)
            expectedLength = parseInt(response.substr(start, end-start))            
            response = response.substr(end + 1)
        } else if (expectedLength > 0 && response.length >= expectedLength) {
            is_busy = false
        }
    }

    /**
     * Setup and connect to WiFi.
     * @param ssid WiFi SSID
     * @param password Password
     */
    //% block="Connect WiFi with|RxPin %rxPin|TxPin %txPin|SSID %ssid|Password %passsword"
    export function connectWifi(rxPin: SerialPin, txPin: SerialPin, ssid: string, password: string) {
        serial.redirect(rxPin, txPin, BaudRate.BaudRate115200)
        serial.setRxBufferSize(64)   // max RX buffer
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), readFromWiFi)
        executeAtCommand("AT+RESTORE", 1000, true)   // it also reset.
        // executeAtCommand("AT+RST", 1000, true)   // it doesn't reset WiFi mode.
        executeAtCommand("AT+CWMODE=1", 1000)
        executeAtCommand("AT+CWJAP=\"" + ssid + "\",\"" + password + "\"", 1000)
        if (response.includes("WIFI GOT IP")) {
            is_connected = true
        }
    }

    /**
     * Disconnect WiFi.
     */
    //% block="Disconnect WiFi"
    export function disconnectWifi() {
        executeAtCommand("AT+CWQAP", 2000)
        serial.redirectToUSB()
    }

    /**
     * Set debugging mode.
     */
    //% block
    export function setDebugging(b: boolean) {
        debugging = b;
    }

    /**
     * Is WiFi connected? 
     */
    //% block
    export function isConnected(): boolean {
        return is_connected
    }

    /**
     * Get recent response.
     */
    //% block
    export function getResponse(): string {
        return response
    }

    /**
     * Read pin's value from Blynk.
     * @param blynkKey Token from Blynk
     * @param pin Pin on Blynk
     */
    //% block="Read from Blynk with|Token %blynkKey|Pin %pin"
    export function readBlynkPinValue(blynkKey: string, pin: string): string {
        let newLine: string = "\r\n"

        if (!isConnected) {
            basic.showIcon(IconNames.No)
            return "Not connected"
        }
        if (is_busy) {
            return ""
        }
        executeAtCommand("AT+CIPSTART=\"TCP\",\"blynk.cloud\",80", 1000)
        let command: string = "GET /external/api/get?token=" + blynkKey + "&" + pin + " HTTP/1.1" + newLine + "Host: blynk-cloud.com" + newLine + newLine
        executeAtCommand("AT+CIPSEND=" + ("" + command.length), 0)
        executeAtCommand(command, 1000)
        if (debugging) {
            basic.showString("c" + response.length + ":" + response.substr(response.length - 3) + ".")
        }
        let v = "?"
        if (response.length > 0) {
            let i = response.indexOf("content-length:")
            if (i > -1) {
                v = response.substr(i + 18) // Extract value
            }
        }
        executeAtCommand("AT+CIPCLOSE", 1000)
        return v
    }

    /**
     * Write pin's value to Blynk.
     * @param blynkKey Token from Blynk
     * @param pin Pin on Blynk
     * @param value Value
     */
    //% block="Write to Blynk with|Token %blynkKey|Pin %pin|Value %value"
    export function writeBlynkPinValue(blynkKey: string, pin: string, value: string) {
        let newLine: string = "\r\n"

        if (!isConnected) {
            basic.showIcon(IconNames.No)
            return
        }
        if (is_busy) {
            return
        }
        executeAtCommand("AT+CIPSTART=\"TCP\",\"blynk.cloud\",80", 1000)
        let command: string = "GET /external/api/update?token=" + blynkKey + "&" + pin + "=" + ("" + value) + " HTTP/1.1" + newLine + "Host: blynk-cloud.com" + newLine + newLine
        executeAtCommand("AT+CIPSEND=" + ("" + command.length), 0)
        executeAtCommand(command, 1000)
        if (debugging) {
            basic.showString("c" + response.length + ":" + response.substr(response.length - 3) + ".")
        }
        executeAtCommand("AT+CIPCLOSE", 1000)
    }

}