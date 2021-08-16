// tests go here; this will not be compiled when this package is used as an extension.
WifiModule.connectWifi(SerialPin.P2, SerialPin.P1, "mSPACE", "18871008")
if (WifiModule.isConnected()) {
    basic.showIcon(IconNames.Square)
    basic.pause(1000)
    let v = WifiModule.readBlynkPinValue("3ddvJKfwOGaI551ooPg05YeKgDALMtj9", "V1")
    basic.showString(v)
}

input.onButtonPressed(Button.A, function() {
    let v = WifiModule.readBlynkPinValue("3ddvJKfwOGaI551ooPg05YeKgDALMtj9", "V1")
    basic.showString(v)
})