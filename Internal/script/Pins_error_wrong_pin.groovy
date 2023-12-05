sensor "button"
actuator "led1"
actuator "led2" pin 26

state "on" trigger "led1" turn high and "led2" turn high
state "off" trigger "led1" turn low and "led2" turn low

transition "on" to "off" when "button" turn high
transition "off" to "on" when "button" turn low

initialState "off"

export "Scenario 1"
