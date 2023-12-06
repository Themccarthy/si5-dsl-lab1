bus 1 pins "2,3,4,5,6,7,9"
bus 1 pins "10,11,12,13,14,15,16"

sensor "button"
actuator "led"
screen "screen" bus 1

state "on" trigger "led" turn high and "screen" display "allumé"
state "off" trigger "led" turn low and "screen" display "éteint"

transition "on" to "off" when "button" turn high
transition "off" to "on" when "button" turn low

initialState "off"

export "Screen LCD"
