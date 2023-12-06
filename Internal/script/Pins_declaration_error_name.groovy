pin "digital_1" on "21" type DIGITAL_OUTPUT
pin "digital_1" on "22" type DIGITAL_INPUT
pin "analog_1" on "14" type ANALOG_OUTPUT

sensor "button"
actuator "led1" pin 14
actuator "led2" pin 22

state "on" trigger "led1" turn high and "led2" turn high
state "off" trigger "led1" turn low and "led2" turn low

transition "on" to "off" when "button" turn high
transition "off" to "on" when "button" turn low

initialState "off"

export "Scenario 1"
