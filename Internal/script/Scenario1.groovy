sensor "button" pin 9
actuator "led" pin 12
actuator "buzzer" pin 11

state "on" trigger "led" turn high and "buzzer" turn high
state "off" trigger "led" turn low and "buzzer" turn low

transition "on" to "off" when "button" turn high
transition "off" to "on" when "button" turn low

initialState "off"

export "Scenario 1"
