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
    let response:string = ""
    let newLine:string = "\r" + "\n"
    let is_connected:boolean = false
    let is_busy:boolean = false

    /**
     * Execute AT command
     * @param command AT command
     * @param waitMs Waiting in milliseconds
     */
    //% block="AT command|Command %command|Wait in ms %waitMs"
    export function executeAtCommand(command: string, waitMs: number) {
        if (isConnected) {
            serial.writeString("" + command + newLine)
            basic.pause(waitMs)
        } else {
            basic.showIcon(IconNames.No)
        }
    }

    /**
     * Setup and connect to WiFi.
     * @param ssid WiFi SSID
     * @param password Password
     */
    //% block="Connect WiFi with|RxPin %rxPin|TxPin %txPin|SSID %ssid|Password %passsword"
    export function setupWifi(rxPin: SerialPin, txPin: SerialPin, ssid: string, password: string) {
        serial.redirect(rxPin, txPin, BaudRate.BaudRate115200)
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            let data: string;
            
            let chunk = serial.readString()
            if (chunk.includes("[")) {
                data = chunk.slice(chunk.indexOf("["))
                response = response + data
            } else if (chunk.includes("]")) {
                data = chunk
                response = response + data
            }            
        })
        executeAtCommand("AT+RESTORE", 1000)
        executeAtCommand("AT+RST", 1000)
        executeAtCommand("AT+CWMODE=1", 1000)
        executeAtCommand("AT+CWJAP=\"" + ssid + "\",\"" + password + "\"", 3000)
        is_connected = true
    }

    /**
     * Is WiFi connected? 
     */
    //% block
    export function isConnected(): boolean {
        return is_connected
    }

    /**
     * Read pin's value from Blynk.
     * @param blynkKey Token from Blynk
     * @param pin Pin on Blynk
     */
    //% block="Read from Blynk with|Token %blynkKey|Pin %pin"
    export function readBlynkPinValue(blynkKey: string, pin: string): string {        
        if (!isConnected) {
            basic.showIcon(IconNames.No)
            return "Not connected"
        }
        if (is_busy) {
            return ""
        }
        is_busy = true
        response = ""
        executeAtCommand("AT+CIPSTART=\"TCP\",\"blynk-cloud.com\",80", 1000)
        let command:string = "GET /" + blynkKey + "/get/" + pin + " HTTP/1.1" + newLine + "Host: blynk-cloud.com" + newLine + newLine
        executeAtCommand("AT+CIPSEND=" + ("" + command.length), 0)
        executeAtCommand(command, 1000)
        let v = response.slice(response.indexOf("[") + 2, response.indexOf("]") - 1) // Extract value
        executeAtCommand("AT+CIPCLOSE", 1000)
        is_busy = false
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
        if (!isConnected) {
            basic.showIcon(IconNames.No)
            return
        }
        if (is_busy) {
            return
        }
        is_busy = true
        response = ""
        executeAtCommand("AT+CIPSTART=\"TCP\",\"blynk-cloud.com\",80", 1000)
        let command:string = "GET /" + blynkKey + "/update/" + pin + "?value=" + ("" + value) + " HTTP/1.1" + newLine + "Host: blynk-cloud.com" + newLine + newLine
        executeAtCommand("AT+CIPSEND=" + ("" + command.length), 0)
        executeAtCommand(command, 1000)
        executeAtCommand("AT+CIPCLOSE", 1000)
        is_busy = false
    }

}