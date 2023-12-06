// Wiring code generated from an ArduinoML model
// Application name: Pins


long debounce = 200;

enum STATE {off, on};
STATE currentState = off;

boolean buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

void setup(){
  pinMode(8, INPUT);  // button [Sensor]
  pinMode(8, OUTPUT); // led1 [Actuator]
  pinMode(8, OUTPUT); // led2 [Actuator]
}

void loop() {
	switch(currentState){
		case off:
			digitalWrite(8,LOW);
			digitalWrite(8,LOW);
			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if(digitalRead(8) == HIGH && buttonBounceGuard) {
				buttonLastDebounceTime = millis();
				currentState = on;
			}
		break;
		case on:
			digitalWrite(8,HIGH);
			digitalWrite(8,HIGH);
			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if(digitalRead(8) == LOW && buttonBounceGuard) {
				buttonLastDebounceTime = millis();
				currentState = off;
			}
		break;
	}
}
