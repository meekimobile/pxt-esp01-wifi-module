// tests go here; this will not be compiled when this package is used as an extension.

function loop() {
    if (WifiModule.isConnected()) {
        basic.showIcon(IconNames.Square)
        basic.pause(1000)
        readFromBlynk()
    } else {
        basic.showIcon(IconNames.SmallSquare)
        WifiModule.connectWifi(SerialPin.P2, SerialPin.P1, "MeekiSam", "Maijung04") // Work well
        // WifiModule.connectWifi(SerialPin.P2, SerialPin.P1, "mSPACE", "18871008")    // Not work
        WifiModule.setDebugging(true)
    }
    basic.pause(5000)
}

basic.forever(loop)

function readFromBlynk() {
    basic.showArrow(ArrowNames.South)
    let v = WifiModule.readBlynkPinValue("3ddvJKfwOGaI551ooPg05YeKgDALMtj9", "V1")
    // ISSUE: Not stable. Sometimes got data, sometimes not.
    // WORKAROUND: It seems fixed after change RX buffer = 64.
    basic.showString(v)
}

input.onButtonPressed(Button.B, readFromBlynk)
