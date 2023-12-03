sensor "button"
actuator "led"
screen "screen"

state "on" trigger "led" turn high and "screen" display "contentOfSizeGreaterThanLCDsize"
state "off" trigger "led" turn low and "screen" display "goodbye"

transition "on" to "off" when "button" turn high
transition "off" to "on" when "button" turn low

initialState "off"

export "Screen LCD"
