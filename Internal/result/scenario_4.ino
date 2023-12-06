// Wiring code generated from an ArduinoML model
// Application name: Scenario 4


long debounce = 200;

enum STATE {led1, led2, none};
STATE currentState = none;

boolean buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

void setup(){
  pinMode(9, INPUT);  // button [Sensor]
  pinMode(11, OUTPUT); // l1 [Actuator]
  pinMode(12, OUTPUT); // l2 [Actuator]
}

void loop() {
	switch(currentState){
		case led1:
			digitalWrite(11,HIGH);
			digitalWrite(12,LOW);
			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if(digitalRead(9) == HIGH && buttonBounceGuard) {
				buttonLastDebounceTime = millis();
				currentState = led2;
			}
		break;
		case led2:
			digitalWrite(11,LOW);
			digitalWrite(12,HIGH);
			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if(digitalRead(9) == HIGH && buttonBounceGuard) {
				buttonLastDebounceTime = millis();
				currentState = none;
			}
		break;
		case none:
			digitalWrite(11,LOW);
			digitalWrite(12,LOW);
			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if(digitalRead(9) == HIGH && buttonBounceGuard) {
				buttonLastDebounceTime = millis();
				currentState = led1;
			}
		break;
	}
}
