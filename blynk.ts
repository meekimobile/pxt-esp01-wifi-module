//% weight=10
namespace WifiModule {
    const NEWLINE: string = "\r\n"
    const NEWLINE2: string = NEWLINE+NEWLINE

    /**
     * Read pin's value from Blynk.
     * @param blynkKey Token from Blynk
     * @param pin Pin on Blynk
     */
    //% subcategory="Blynk"
    //% weight=100
    //% block="Read from Blynk with|Token %blynkKey|Pin %pin"
    export function readBlynkPinValue(blynkKey: string, pin: string): string {
        if (!isConnected) {
            setError("not_connected")
            return ""
        }
        executeAtCommand("AT+CIPSTART=\"TCP\",\"blynk.cloud\",80", 1000)
        let command: string = "GET /external/api/get?token=" + blynkKey + "&" + pin + " HTTP/1.1" + NEWLINE + "Host: blynk.cloud" + NEWLINE2
        executeAtCommand("AT+CIPSEND=" + ("" + command.length), 1000)
        executeAtCommand(command, 1000)
        let v = getResponse().trim()
        executeAtCommand("AT+CIPCLOSE", 1000)
        return v
    }

    /**
     * Write pin's value to Blynk.
     * @param blynkKey Token from Blynk
     * @param pin Pin on Blynk
     * @param value Value
     */
    //% subcategory="Blynk"
    //% block="Write to Blynk with|Token %blynkKey|Pin %pin|Value %value"
    export function writeBlynkPinValue(blynkKey: string, pin: string, value: string) {
        if (!isConnected) {
            setError("not_connected")
            return
        }
        executeAtCommand("AT+CIPSTART=\"TCP\",\"blynk.cloud\",80", 1000)
        let command: string = "GET /external/api/update?token=" + blynkKey + "&" + pin + "=" + ("" + value) + " HTTP/1.1" + NEWLINE + "Host: blynk.cloud" + NEWLINE2
        executeAtCommand("AT+CIPSEND=" + ("" + command.length), 1000)
        executeAtCommand(command, 1000)
        executeAtCommand("AT+CIPCLOSE", 1000)
    }

}