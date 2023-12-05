sensor "button" pin 2
actuator "led" pin 23
actuator "buzzer" pin 24

state "on" trigger "led" turn high and "buzzer" turn high
state "off" trigger "led" turn low and "buzzer" turn low

transition "on" to "off" when "button" turn high
transition "off" to "on" when "button" turn low

initialState "off"

export "Scenario 1"