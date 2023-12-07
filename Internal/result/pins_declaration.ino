// Wiring code generated from an ArduinoML model
// Application name: Scenario 1


long debounce = 200;

enum STATE {off, on};
STATE currentState = off;

boolean buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

void setup(){
  pinMode(8, INPUT);  // button [Sensor]
  pinMode(9, OUTPUT); // led1 [Actuator]
  pinMode(22, OUTPUT); // led2 [Actuator]
}

void loop() {
	switch(currentState){
		case off:
			digitalWrite(9,LOW);
			digitalWrite(22,LOW);
			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if(digitalRead(8) == LOW && buttonBounceGuard) {
				buttonLastDebounceTime = millis();
				currentState = on;
			}
		break;
		case on:
			digitalWrite(9,HIGH);
			digitalWrite(22,HIGH);
			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if(digitalRead(8) == HIGH && buttonBounceGuard) {
				buttonLastDebounceTime = millis();
				currentState = off;
			}
		break;
	}
}
