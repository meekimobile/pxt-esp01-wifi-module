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
    let is_connected:boolean = false
    let is_busy:boolean = false

    /**
     * Execute AT command
     * @param command AT command
     * @param waitMs Waiting in milliseconds
     */
    //% block="AT command|Command %command|Wait in ms %waitMs"
    export function executeAtCommand(command: string, waitMs: number) {
        let newLine:string = "\r\n"
        if (isConnected) {
            is_busy = true
            serial.writeString("" + command + newLine)
            while (is_busy) {
                basic.pause(100)
            }
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
    export function connectWifi(rxPin: SerialPin, txPin: SerialPin, ssid: string, password: string) {
        serial.redirect(rxPin, txPin, BaudRate.BaudRate115200)
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            let data: string;
            
            let chunk = serial.readString()
            response = response + chunk

            if (response.includes("WIFI GOT IP")) {
                is_connected = true 
            }
            if (response.includes("OK")) {
                is_busy = false
            } else if (response.includes("FAIL")) {
                is_busy = false
            } else if (response.includes("ERROR")) {
                is_busy = false
/*            } else if (chunk.includes("[")) {
                data = chunk.slice(chunk.indexOf("["))
                response = response + data
                is_busy = false
            } else if (chunk.includes("]")) {
                response = response + chunk
                is_busy = false    */
            }        
        })
        executeAtCommand("AT+RESTORE", 1000)
        executeAtCommand("AT+RST", 1000)
        executeAtCommand("AT+CWMODE=1", 1000)
        executeAtCommand("AT+CWJAP=\"" + ssid + "\",\"" + password + "\"", 3000)
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
        let newLine:string = "\r\n"

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
        let v = response 
      //  let v = response.slice(response.indexOf("[") + 2, response.indexOf("]") - 1) // Extract value
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
        let newLine:string = "\r\n"
        
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