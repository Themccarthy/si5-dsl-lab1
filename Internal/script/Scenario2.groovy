sensor "button1" pin 9
sensor "button2" pin 10
actuator "buzzer" pin 11

state "on" trigger "buzzer" turn high
state "off" trigger "buzzer" turn low

transition "on" to "off" when "button1" turn high and "button2" turn high
transition "off" to "on" when "button1" turn low or "button2" turn low

initialState "off"

export "Scenario 2"
