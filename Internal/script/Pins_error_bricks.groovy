sensor "button"
actuator "led1"
actuator "led2"
actuator "led3"
actuator "led4"
actuator "led5"

state "on" trigger "led1" turn high and "led2" turn high
state "off" trigger "led3" turn low and "led4" turn low

transition "on" to "off" when "button" turn high
transition "off" to "on" when "button" turn low

initialState "off"

export "Pin Allocation"
