// tests go here; this will not be compiled when this package is used as an extension.
let success = 0
let count = 0

function loop() {
    if (WifiModule.isConnected()) {
        let v = readFromBlynk()
        // writeToBlynk()
        count++
        if (v != "?") {
            success++
        }
        basic.pause(2000)
        // led.plotBarGraph(success, count)   // Don't use, it writes number on UART.
        plotDotGraph(success, count, 10)
        basic.pause(8000)
    } else {
        basic.showIcon(IconNames.SmallSquare)
        WifiModule.connectWifi(SerialPin.P2, SerialPin.P1, "mSPACE", "18871008")
        // WifiModule.setDebugging(true)
        if (WifiModule.isConnected()) {
            basic.showIcon(IconNames.Square)
        } else {
            basic.showIcon(IconNames.No)
        }
        basic.pause(5000)
    }
}

basic.forever(loop)

function plotDotGraph(v:number, max:number, dots:number = 25) {
    let s = Math.floor(Math.map(v, 0, max, 0, dots))
    basic.clearScreen()
    for (let i = 0; i < s; i++) {
        led.plot(i % 5, Math.floor(i / 5))
    }
}

function readFromBlynk() : string {
    basic.showArrow(ArrowNames.South)
    let v = WifiModule.readBlynkPinValue("3ddvJKfwOGaI551ooPg05YeKgDALMtj9", "V1")
    // ISSUE: Not stable. Sometimes got data, sometimes not. How to always empty RX buffer?
    /* WORKAROUND: 
     * - It seems fixed after change RX buffer = 64.
     * - Use AT firmware V2.1
    */
    basic.showString(v)
    return v
}

function writeToBlynk() {
    basic.showArrow(ArrowNames.North)
    WifiModule.writeBlynkPinValue("3ddvJKfwOGaI551ooPg05YeKgDALMtj9", "V4", ""+input.lightLevel())
}

input.onButtonPressed(Button.B, writeToBlynk)
