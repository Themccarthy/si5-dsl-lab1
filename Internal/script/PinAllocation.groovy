sensor "button"
sensor "button"
actuator "led"
actuator "buzzer"

state "on" trigger "led" turn high and "buzzer" turn high
state "off" trigger "led" turn low and "buzzer" turn low

transition "on" to "off" when "button" turn high
transition "off" to "on" when "button" turn low

initialState "off"

export "Pin Allocation"
