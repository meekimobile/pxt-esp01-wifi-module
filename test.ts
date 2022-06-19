// tests go here; this will not be compiled when this package is used as an extension.
//
// ISSUE: Don't include key in this code. It's public
//
basic.showIcon(IconNames.Confused)
basic.pause(3000)
WifiModule.connectWifi(SerialPin.P2, SerialPin.P1, "mSPACE", "*****")
if (WifiModule.isConnected()) {
    basic.showIcon(IconNames.Happy)
} else {
    basic.showString(WifiModule.getError())
}
