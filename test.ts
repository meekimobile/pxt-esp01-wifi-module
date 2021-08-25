// tests go here; this will not be compiled when this package is used as an extension.

function loop() {
    if (WifiModule.isConnected()) {
        readFromBlynk()
        // writeToBlynk()
        basic.pause(2000)
        basic.showLeds(`
        . . . . .
        . # . # .
        . . . . .
        . . # . .
        . . . . .
        `)
        basic.pause(8000)
    } else {
        basic.showIcon(IconNames.SmallSquare)
        WifiModule.connectWifi(SerialPin.P2, SerialPin.P1, "mSPACE", "18871008")
        WifiModule.setDebugging(true)
        if (WifiModule.isConnected()) {
            basic.showIcon(IconNames.Square)
        } else {
            basic.showIcon(IconNames.No)
        }
        basic.pause(5000)
    }
}

basic.forever(loop)

function readFromBlynk() {
    basic.showArrow(ArrowNames.South)
    let v = WifiModule.readBlynkPinValue("3ddvJKfwOGaI551ooPg05YeKgDALMtj9", "V1")
    // ISSUE: Not stable. Sometimes got data, sometimes not. How to always empty RX buffer?
    /* WORKAROUND: 
     * - It seems fixed after change RX buffer = 64.
     * - Use AT firmware V2.1
    */
    basic.showString(v)
}

function writeToBlynk() {
    basic.showArrow(ArrowNames.North)
    WifiModule.writeBlynkPinValue("3ddvJKfwOGaI551ooPg05YeKgDALMtj9", "V4", ""+input.lightLevel())
}

input.onButtonPressed(Button.B, writeToBlynk)
