sensor "button1" pin 9
sensor "button2" pin 10
actuator "led" pin 11

state "on" trigger "led" turn high
state "off" trigger "led" turn low

transition "on" to "off" when "button1" turn low or "button2" turn low
transition "off" to "on" when "button1" turn high and "button2" turn high

initialState "off"

export "Scenario 2"
