//% weight=90
namespace WifiModule {
    let internetTimeInitialized = false
    let internetTimeUpdated = false
    let internetTime: string[] = []

    /**
     * Initialize the internet time.
     * @param timezone Timezone. eg: 8
     * @param ntpUrl NTP server URL. eg: pool.ntp.org
     */
    //% subcategory="Internet Time"
    //% weight=100
    //% block="Initialize internet time at |TimeZone %timezone|NTP server URL %ntpUrl"
    //% timezone.min=-11 timezone.max=13
    export function initInternetTime(timezone: number, ntpUrl: string) {
        internetTimeInitialized = false
        internetTimeUpdated = false

        if (!ntpUrl) ntpUrl = "pool.ntp.org"
        if (!isConnected) return

        executeAtCommand("AT+CIPSNTPCFG=1," + timezone + ",\"" + ntpUrl + "\"", 500)

        internetTimeInitialized = true
    }

    /**
     * Update the internet time.
     */
    //% subcategory="Internet Time"
    //% weight=90
    //% block="Update internet time"
    export function updateInternetTime() {
        internetTimeUpdated = false

        if (!isConnected) return
        if (!isInternetTimeInitialized) return

        executeAtCommand("AT+CIPSNTPTIME?", 2000)
        if (getResponse() != "") {
            let response = getResponse()
            let dtArray = response.slice(response.indexOf(":") + 1, response.indexOf("\nOK")).split(" ")
            let timeArray = dtArray[3].split(":")
            if (dtArray[4].trim() == "1970") {
                return
            }
            internetTime = [
                dtArray[4].trim(),
                dtArray[1],
                dtArray[2],
                timeArray[0],
                timeArray[1],
                timeArray[2]
            ]
            internetTimeUpdated = true
        }
    }

    /**
     * Return true if the internet time is initialzed successfully.
     */
    //% subcategory="Internet Time"
    //% weight=80
    //% block="Is internet time initialized"
    export function isInternetTimeInitialized(): boolean {
        return internetTimeInitialized
    }

    /**
     * Return true if the internet time is updated successfully.
     */
    //% subcategory="Internet Time"
    //% weight=70
    //% block="Is internet time updated"
    export function isInternetTimeUpdated(): boolean {
        return internetTimeUpdated
    }

    /**
     * Return internet time array as [year, month, day, hour, minute, second].
     */
    //% subcategory="Internet Time"
    //% block="Get internet time array"
    export function getInternetTimeArray(): string[] {
        return internetTime
    }

}