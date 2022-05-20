// tests go here; this will not be compiled when this package is used as an extension.
function onBpressed() {
    basic.showLeds(`
    . # # # .
    # . . . #
    # . . . #
    # . . . #
    . # # # .
    `)
    WifiModule.updateInternetTime()
    if (WifiModule.isInternetTimeUpdated()) {
        basic.showString(WifiModule.getInternetTimeArray().join(","))
    }
    basic.pause(1000)
}
input.onButtonPressed(Button.B, onBpressed)

basic.showIcon(IconNames.SmallSquare)
WifiModule.connectWifi(SerialPin.P2, SerialPin.P1, "mSPACE", "18871008")
basic.showIcon(IconNames.Square)
WifiModule.initInternetTime(7, undefined)
basic.showLeds(`
. # # # .
# . # . #
# . # # #
# . . . #
. # # # .
`)
