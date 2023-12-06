// Wiring code generated from an ArduinoML model
// Application name: Screen LCD

#include <LiquidCrystal.h>

long debounce = 200;

enum STATE {off, on};
STATE currentState = off;

boolean buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

LiquidCrystal screen(2, 3, 4, 5, 6, 7, 9);

void setup(){
  pinMode(8, INPUT);  // button [Sensor]
  screen.begin(16,2);  // screen [Screen]
  pinMode(9, OUTPUT); // led [Actuator]
}

void loop() {
	switch(currentState){
		case off:
			digitalWrite(9,LOW);
			if(!buttonBounceGuard) {
				screen.clear();
				screen.print("éteint");
			}
			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if(digitalRead(8) == LOW && buttonBounceGuard) {
				buttonLastDebounceTime = millis();
				currentState = on;
			}
		break;
		case on:
			digitalWrite(9,HIGH);
			if(!buttonBounceGuard) {
				screen.clear();
				screen.print("allumé");
			}
			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if(digitalRead(8) == HIGH && buttonBounceGuard) {
				buttonLastDebounceTime = millis();
				currentState = off;
			}
		break;
	}
}
