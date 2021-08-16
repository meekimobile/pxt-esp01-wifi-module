// tests go here; this will not be compiled when this package is used as an extension.
WifiModule.connectWifi(SerialPin.P2, SerialPin.P1, "mSPACE", "18871008")
if (WifiModule.isConnected()) {
    basic.showIcon(IconNames.Square)
    // basic.pause(1000)
    // let v = WifiModule.readBlynkPinValue("3ddvJKfwOGaI551ooPg05YeKgDALMtj9", "V1")
    // basic.showString(v)
    // let actV = v.slice(v.indexOf("[") + 2, v.indexOf("]") - 1) // Extract value
    // basic.showString(actV)
}

input.onButtonPressed(Button.A, function() {
    basic.showArrow(ArrowNames.South)
    let v = WifiModule.readBlynkPinValue("3ddvJKfwOGaI551ooPg05YeKgDALMtj9", "V1")
    // ISSUE: Not stable. Sometimes got data, sometimes not.
    basic.showString(v)
})