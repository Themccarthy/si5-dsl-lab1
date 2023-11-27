sensor "button", 9
actuator "led", 12

state "on", "button", high
state "off", "button", low

transition "on", "off", "button", high
transition "off", "on", "button", high

initialState "off"

export "Switch!"
