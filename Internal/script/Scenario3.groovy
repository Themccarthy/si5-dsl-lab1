sensor "button" pin 2
actuator "led" pin 23

state "on" trigger "led" turn high
state "off" trigger "led" turn low

transition "on" to "off" when "button" turn high
transition "off" to "on" when "button" turn high

initialState "off"

export "Scenario 3"
