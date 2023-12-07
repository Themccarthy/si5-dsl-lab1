// Wiring code generated from an ArduinoML model
// Application name: Scenario 2


long debounce = 200;

enum STATE {off, on};
STATE currentState = off;

boolean button2BounceGuard = false;
long button2LastDebounceTime = 0;

boolean button1BounceGuard = false;
long button1LastDebounceTime = 0;

void setup(){
  pinMode(10, INPUT);  // button2 [Sensor]
  pinMode(11, OUTPUT); // led [Actuator]
  pinMode(9, INPUT);  // button1 [Sensor]
}

void loop() {
	switch(currentState){
		case off:
			digitalWrite(11,LOW);
			button1BounceGuard = millis() - button1LastDebounceTime > debounce;
			if(digitalRead(9) == HIGH && digitalRead(10) == HIGH && button1BounceGuard) {
				button1LastDebounceTime = millis();
				currentState = on;
			}
		break;
		case on:
			digitalWrite(11,HIGH);
			button1BounceGuard = millis() - button1LastDebounceTime > debounce;
			if(digitalRead(9) == LOW || digitalRead(10) == LOW && button1BounceGuard) {
				button1LastDebounceTime = millis();
				currentState = off;
			}
		break;
	}
}
