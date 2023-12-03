sensor "button" pin 2
actuator "led" pin 23
actuator "buzzer" pin 24

state "buzz" trigger "buzzer" turn high and "led" turn low
state "led" trigger "buzzer" turn low and "led" turn high
state "none" trigger "buzzer" turn low and "led" turn low

transition "buzz" to "led" when "button" turn high
transition "led" to "none" when "button" turn high
transition "none" to "led" when "button" turn high

initialState "none"

export "Scenario 4"
