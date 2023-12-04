grammar ArduinoMlB

entry App:
	'app' name=ID 'initial' 'state' initial=[State:ID]
	'{'
	('pins'
	pins+=Pin
	(pins+=Pin)*)?

	('bus'
	bus+=Bus
	(bus+=Bus)*)?

		'bricks'
		bricks+=Brick
		(bricks+=Brick)* 
		
		'states'
		states+=State
		( states+=State)* 		
	'}';

Brick:
	(Actuator | Sensor | Screen);

Actuator:
	{infer Actuator}
	'Actuator' name=ID (':' pin=INT)?;

Sensor:
	{infer Sensor}
	'Sensor'  name=ID (':' pin=INT)?;

Screen:
	{infer Screen}
	'Screen'  name=ID (':' bus=INT)?  ('size:' size=INT)?;

Pin:
	{infer Pin}
    'Pin' name=ID ':' pin=INT ':' type=PinType;

Bus:
	'bus' number=INT '{'
        pins+=INT
        (',' pins+=INT)*
    '}';

State:
	name=ID '{'
        actions+=(ActuatorAction | ScreenAction)
        (actions+=(ActuatorAction | ScreenAction))* 
        transition=Transition
    '}';

ActuatorAction:
	actuator=[Actuator:ID] '<=' value=Signal;

ScreenAction:
	screen=[Screen:ID] '<=' value=ID;

Transition:
	transitionFirst=TransitionFirst   ( transitionCondition+=TransitionCondition)* '=>' next=[State:ID];

TransitionFirst:
	sensor=[Sensor:ID] 'is' value=Signal;

TransitionCondition:
	logicalOperator=LogicalOperator sensor=[Sensor:ID] 'is' value=Signal;

LogicalOperator:
	value=('&&' | '||');

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