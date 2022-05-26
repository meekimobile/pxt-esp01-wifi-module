/**
 * Use this file to define custom functions and blocks.
 * Read more at https://makecode.microbit.org/blocks/custom
 */

/**
 * WiFi with AT commands on ESP01.
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
    const NEWLINE: string = "\r\n"
    let chunk: Buffer
    let response: string = ""
    let is_connected: boolean = false
    let is_busy: boolean = false
    let error: string = ""
    let expectedLength = 0
    let responseCallback: () => void

    /**
     * Execute AT command
     * @param command AT command
     * @param waitMs Waiting in milliseconds
     */
    //% subcategory="more"
    //% weight=90
    //% block="Execute AT|Command %command|Wait in ms %waitMs"
    export function executeAtCommand(command: string, waitMs: number, ignoreResponse: boolean = false) {
        // Flush the Rx buffer.
        serial.readString()

        let timeout = 10000
        is_busy = true
        error = ""
        response = ""
        expectedLength = 0

        serial.writeString(command + NEWLINE)
        if (ignoreResponse) {
            is_busy = false
        }
        while (is_busy && timeout > 0) {
            readFromWiFi()
            basic.pause(10)
            timeout = timeout - 10
        }
        readFromWiFi()   // Workaround: try read what left in buffer.
        if (timeout <= 0) {
            error = "timeout"
            is_busy = false
        }
        basic.pause(waitMs)
    }

    function readFromWiFi() {
        chunk = serial.readBuffer(0)   // try read all available bytes.
        //let chunk = serial.readUntil(serial.delimiters(Delimiters.NewLine))   // not work

        if (chunk.length == 0) {
            return
        }

        response += chunk.toString()

        if (response.indexOf("\nOK") >= 0) {
            is_busy = false
        } else if (response.indexOf("\nERROR") >= 0) {
            is_busy = false
            error = "response_error"
        }
        
        if (response.indexOf("\nSEND OK") >= 0) {
            response = response.substr(response.indexOf("SEND OK") + 8)
        } else if (response.indexOf("\nSEND FAIL") >= 0) {
            response = response.substr(response.indexOf("SEND FAIL") + 10)
        }
        
        // if (response.indexOf("+IPD,") >= 0) {
        //     let start = response.indexOf("+IPD,") + 5
        //     let end = response.indexOf(":", start)
        //     expectedLength = parseInt(response.slice(start, end))
        //     response = response.substr(end + 1)
        // }
        if (response.indexOf("content-length:") >= 0) {
            let start = response.indexOf("content-length:") + 15
            let end = response.indexOf(NEWLINE+NEWLINE, start)
            expectedLength = parseInt(response.slice(start, end))
            response = response.substr(end + 4)
            if (expectedLength == 0) {
                is_busy = false
            }
        }
        if (expectedLength > 0 && response.length >= expectedLength) {
            response = response.slice(0, response.indexOf(NEWLINE+NEWLINE))
            is_busy = false
        }

        if (responseCallback) {
            responseCallback()
        }
    }

    /**
     * Setup and connect to WiFi.
     * @param rxPin ESP01 Rx Pin eg: SerialPin.P2
     * @param txPin ESP01 Tx Pin eg: SerialPin.P1
     * @param ssid WiFi SSID
     * @param password Password
     */
    //% block="Connect WiFi with|RxPin %rxPin|TxPin %txPin|SSID %ssid|Password %passsword"
    //% weight=100
    export function connectWifi(rxPin: SerialPin, txPin: SerialPin, ssid: string, password: string) {
        serial.redirect(rxPin, txPin, BaudRate.BaudRate115200)
        serial.setRxBufferSize(192)   // max RX buffer. 192 can cover whole HTTP response
        // ISSUE: It doesn't fast enough and cause missing data in response. 
        // serial.onDataReceived(serial.delimiters(Delimiters.NewLine), readFromWiFi)
        executeAtCommand("AT+RESTORE", 1000, true)   // it also reset.
        // executeAtCommand("AT+RST", 1000, true)   // it doesn't reset WiFi mode.
        executeAtCommand("AT+CWMODE=1", 1000)
        executeAtCommand("AT+CWJAP=\"" + ssid + "\",\"" + password + "\"", 1000)
        if (response.indexOf("WIFI GOT IP") >= 0) {
            is_connected = true
        }
    }

    /**
     * Disconnect WiFi.
     */
    //% block="Disconnect WiFi"
    //% weight=90
    export function disconnectWifi() {
        executeAtCommand("AT+CWQAP", 2000)
        serial.redirectToUSB()
    }

    /**
     * Is WiFi connected? 
     */
    //% block
    export function isConnected(): boolean {
        return is_connected
    }

    /**
     * Is WiFi busy? 
     */
    //% block
    export function isBusy(): boolean {
        return is_busy
    }

    /**
     * Run on response
     * @param cb Action
     */
    //% block="Run code on data received"
    export function onDataReceived(cb: Action) {
        responseCallback = cb
    }

    /**
     * Get recent chunk.
     */
    //% block
    export function getChunk(): string {
        return chunk.toString()
    }

    /**
     * Get recent response.
     */
    //% block
    export function getResponse(): string {
        return response
    }

    /**
     * Get recent error.
     */
    //% block
    export function getError(): string {
        return error
    }

    /**
     * Set error.
     * @param err Error message
     */
    //% block
    export function setError(err:string) {
        error = err
    }

    /**
     * Perform HTTP GET request
     * @param url URL
     */
    //% subcategory="more"
    //% weight=100
    //% block="Perform HTTP GET|URL %url"
    export function httpGet(url: string): string {
        let hostPath = url.substr(7)
        let host = hostPath.substr(0, hostPath.indexOf("/"))
        let path = hostPath.substr(hostPath.indexOf("/"))
        executeAtCommand("AT+CIPSTART=\"TCP\",\"" + host + "\",80", 1000)
        let command: string = "GET " + path + " HTTP/1.1" + NEWLINE + "Host: " + host + NEWLINE + NEWLINE
        executeAtCommand("AT+CIPSEND=" + ("" + command.length), 0)
        executeAtCommand(command, 1000)
        let v = "?"
        if (response.length > 0) {
            let i = response.indexOf("\n\n")
            v = response.substr(i + 2)
        }
        executeAtCommand("AT+CIPCLOSE", 1000)
        return v
    }

}