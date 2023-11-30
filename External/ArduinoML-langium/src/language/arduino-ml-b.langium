grammar ArduinoMlB

entry App:
	'app' name=ID 'initial' 'state' initial=[State:ID]
	'{'
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
	'Screen'  name=ID (':' bus=INT)?;


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
	sensorCondition1=SensorCondition1 ( sensorConditions+=SensorCondition)* '=>' next=[State:ID];

SensorCondition1:
	sensor=[Sensor:ID] 'is' value=Signal;

SensorCondition:
	logicalOperator=LogicalOperator sensor=[Sensor:ID] 'is' value=Signal;

LogicalOperator:
	value=('&&' | '||');

Signal:
	value=(HIGH | LOW);
terminal HIGH: 'HIGH';
terminal LOW: 'LOW';

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;