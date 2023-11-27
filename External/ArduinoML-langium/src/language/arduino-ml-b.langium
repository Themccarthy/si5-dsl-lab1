grammar ArduinoMlB

entry App:
    'app' name=ID 'initial' 'state' initial=[State:ID]
	'{'
        ('pins'
        pins+=Pin
        (pins+=Pin)*)?

		'bricks'
		bricks+=Brick
		(bricks+=Brick)* 
		
		'states'
		states+=State
		( states+=State)* 		
	'}';

Brick:
    (Actuator | Sensor);

Actuator:
    {infer Actuator}
	'Actuator' name=ID (':' pin=INT)?;

Sensor:
    {infer Sensor}
	'Sensor'  name=ID (':' pin=INT)?;

Pin:
    {infer Pin}
    'Pin' name=ID ':' pin=INT ':' type=PinType;

State:
    name=ID '{'
		actions+=Action
		(actions+=Action)* 
		transition=Transition
	'}';


Action:
    actuator=[Actuator:ID] '<=' value=Signal;

Transition:
    sensor=[Sensor:ID] 'is' value=Signal '=>' next=[State:ID];

Signal:
    value=(HIGH | LOW);
terminal HIGH: 'HIGH';
terminal LOW: 'LOW';

PinType:
    value=(DIGITAL_INPUT | DIGITAL_OUTPUT | ANALOG_INPUT | ANALOG_OUTPUT);
terminal DIGITAL_INPUT: 'DIGITAL_INPUT';
terminal DIGITAL_OUTPUT: 'DIGITAL_OUTPUT';
terminal ANALOG_INPUT: 'ANALOG_INPUT';
terminal ANALOG_OUTPUT: 'ANALOG_OUTPUT';

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;