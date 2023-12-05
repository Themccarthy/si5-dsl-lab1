sensor "button" pin 9
actuator "l1" pin 11
actuator "l2" pin 12

state "led1" trigger "l1" turn high and "l2" turn low
state "led2" trigger "l1" turn low and "l2" turn high
state "none" trigger "l1" turn low and "l2" turn low

transition "led1" to "led2" when "button" turn high
transition "led2" to "none" when "button" turn high
transition "none" to "led1" when "button" turn high

initialState "none"

export "Scenario 4"
