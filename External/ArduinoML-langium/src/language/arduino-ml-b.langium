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
	(Actuator | Sensor);

Actuator:
	{infer Actuator}
	'Actuator' name=ID (':' pin=INT)?;

Sensor:
	{infer Sensor}
	'Sensor'  name=ID (':' pin=INT)?;

State:
	name=ID '{'
		actions+=Action
		(actions+=Action)* 
		transition=Transition
	'}';


Action:
	actuator=[Actuator:ID] '<=' value=Signal;


Transition:
	sensorConditions+=SensorCondition ('&&' sensorConditions+=SensorCondition)* '=>' next=[State:ID];

SensorCondition:
	sensor=[Sensor:ID] 'is' value=Signal;



Signal:
	value=(HIGH | LOW);
terminal HIGH: 'HIGH';
terminal LOW: 'LOW';

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;