actuator "led1"
actuator "led2"
sensor "button"

state "on" trigger "led1" turn high and "led2" turn high
state "off" trigger "led1" turn low and "led2" turn low

transition "on" to "off" when "button" turn low
transition "off" to "on" when "button" turn high

initialState "off"

export "Pins"
