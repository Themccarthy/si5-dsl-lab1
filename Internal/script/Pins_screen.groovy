actuator "led"
sensor "button"
screen "screen"

state "on" trigger "led" turn high and "screen" display "allumé"
state "off" trigger "led" turn low and "screen" display "éteint"

transition "on" to "off" when "button" turn high
transition "off" to "on" when "button" turn high

initialState "off"

export "Pins screen"
