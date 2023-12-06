// Wiring code generated from an ArduinoML model
// Application name: Screen BIG

#include <LiquidCrystal.h>

long debounce = 200;

enum STATE {off, on};
STATE currentState = off;

boolean buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

LiquidCrystal screen(2, 3, 4, 5, 6, 7, 8);

void setup(){
  pinMode(9, INPUT);  // button [Sensor]
  screen.begin(26,2);  // screen [Screen]
  pinMode(12, OUTPUT); // led [Actuator]
}

void loop() {
	switch(currentState){
		case off:
			digitalWrite(12,LOW);
			if(!buttonBounceGuard) {
				screen.clear();
				screen.print("anticonstitutionnellement");
			}
			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if(digitalRead(9) == HIGH && buttonBounceGuard) {
				buttonLastDebounceTime = millis();
				currentState = on;
			}
		break;
		case on:
			digitalWrite(12,HIGH);
			if(!buttonBounceGuard) {
				screen.clear();
				screen.print("allumé");
			}
			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if(digitalRead(9) == HIGH && buttonBounceGuard) {
				buttonLastDebounceTime = millis();
				currentState = off;
			}
		break;
	}
}
