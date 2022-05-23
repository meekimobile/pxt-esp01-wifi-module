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

function mqttPub() {
    let cmd
    cmd = 'AT+MQTTUSERCFG=0,1,"microbit_esp01_1","ktaweesak","aio_GUUC68Zjxg8lFmoO7UsHyk7b1OWu",0,0,""'
    WifiModule.executeAtCommand(cmd, 1000)
    cmd = 'AT+MQTTCONN=0,"io.adafruit.com",1883,0'
    WifiModule.executeAtCommand(cmd, 1000)
    cmd = 'AT+MQTTPUB=0,"ktaweesak/feeds/v0","' + input.lightLevel() + '",0,0'
    WifiModule.executeAtCommand(cmd, 1000)
    cmd = 'AT+MQTTCLEAN=0'
    WifiModule.executeAtCommand(cmd, 1000)
}
function mqttSub() {
    let cmd
    cmd = 'AT+MQTTUSERCFG=0,1,"microbit_esp01_1","ktaweesak","aio_GUUC68Zjxg8lFmoO7UsHyk7b1OWu",0,0,""'
    WifiModule.executeAtCommand(cmd, 1000)
    cmd = 'AT+MQTTCONN=0,"io.adafruit.com",1883,0'
    WifiModule.executeAtCommand(cmd, 1000)
    cmd = 'AT+MQTTSUB=0,"ktaweesak/feeds/v1",0'
    WifiModule.executeAtCommand(cmd, 1000)
}
function mqttClean() {
    let cmd
    cmd = 'AT+MQTTCLEAN=0'
    WifiModule.executeAtCommand(cmd, 1000)
}
input.onButtonPressed(Button.A, mqttPub)
input.onButtonPressed(Button.AB, mqttClean)

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
