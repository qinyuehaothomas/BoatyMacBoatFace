// TODO: Initalise WIFI
function InitWIFI (SSID: string, Pswd: string) {
    esp8266.init(SerialPin.P8, SerialPin.P12, BaudRate.BaudRate115200)
    esp8266.connectWiFi(SSID, Pswd)
    if (esp8266.isWifiConnected()) {
        basic.showLeds(`
            # # # . .
            . . . # .
            # # . . #
            . . # . #
            # . # . #
            `)
        return true
    } else {
        basic.showIcon(IconNames.No)
        return false
    }
}
function pHConversion (AnalogReading: number) {
    return Math.round(14 - (AnalogReading * (5 / 1023) * -4.8 + 17))
}
// TODO: Do Me & Wesley's Efforts of Tuning That Fucking Sensor Glory
function WaterTempConverter (AnalogReading: number) {
    V = AnalogReading * 3 / 1024
    // Temperature= 1177692.5 / (3950 + 298.15 * ln(V/(3.3-V)) - 273.5.
    return 1177692.5 / (3950 + 298.15 * (Math.log(V/(3-V)) / Math.log(Math.E))) - 223.15
}
// TODO: Just For Tuning
function SerialTuning () {
    serial.writeValue("pH", pH)
    serial.writeValue("WaterTemp(℃)", WaterTemperature)
    serial.writeValue("Light", Light)
    serial.writeValue("Temp(℃)", SurroundingTemperature)
}
// TODO: Send All Shit
function FormattedRequest () {
    esp8266.uploadThingspeak(
    "KTANII17SM9PCOI2",
    pH,
    WaterTemperature,
    Light,
    SurroundingTemperature,
    BoatID
    )
    if (!(esp8266.isThingspeakUploaded())) {
        basic.showIcon(IconNames.Confused)
    } else {
        basic.showLeds(`
            # # # . .
            . . . # .
            # # . . #
            . . # . #
            # . # . #
            `)
    }
}
let WaterTemperature = 0
let pH = 0
let BoatID = 0
let Light = 0
let V = 0
let SurroundingTemperature = 0
function ReadLightIntensity(lightintensitypin: AnalogPin): number {
    let voltage = 0;
    let lightintensity = 0;
    voltage = pins.map(
        pins.analogReadPin(lightintensitypin),
        0,
        1023,
        0,
        100
    );
    lightintensity = voltage;
    return Math.round(lightintensity)
}
let Reference_VOLTAGE = 3100
function ReadTemperature(CorF: string, temppin: AnalogPin): number {
    let voltage2 = 0;
    let Temperature = 0;
    pins.digitalWritePin(DigitalPin.P0, 0)
    voltage2 = pins.map(
        pins.analogReadPin(temppin),
        0,
        1023,
        0,
        Reference_VOLTAGE
    );
    Temperature = (voltage2 - 500) / 10;

    switch (CorF) {
        case "F":
            return Math.round(Temperature)
            break;
        case "C":
            return Math.round(Temperature * 9 / 5 + 32)
            break;
        default:
            return 0
    }
}
BoatID = 925
let WifiConnected=false
// SerialTuning()
basic.forever(function () {
    // pH conversion Table:
    // https://raw.githubusercontent.com/DFRobot/DFRobotMediaWikiImage/master/Image/Ph-mv.jpg
    pH = pHConversion(pins.analogReadPin(AnalogPin.P1))
    SurroundingTemperature = ReadTemperature("C", AnalogPin.P2)
Light = ReadLightIntensity(AnalogPin.P3)
WaterTemperature = WaterTempConverter(pins.analogReadPin(AnalogPin.P4))
    FormattedRequest()
    if (!WifiConnected){
        WifiConnected=InitWIFI("Redmi 9T","87654321")
    }
})
