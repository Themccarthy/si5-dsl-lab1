
//Wiring code generated from an ArduinoML model
// Application name: RedButton
#include <LiquidCrystal.h>
long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            

LiquidCrystal screen(2,3,4,5,6,7,8);
            

	void setup(){
		pinMode(12, OUTPUT); // red_led [Actuator]
		pinMode(9, INPUT); // button [Sensor]
		screen.begin(16,2); // screen [Screen]
	}
	void loop() {
			switch(currentState){

				case off:
                    digitalWrite(12,LOW);
                    if (!buttonBounceGuard) {
                        screen.clear();
                        screen.print("eteint"); 
                    }
            
		 			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if( digitalRead(9) == HIGH && buttonBounceGuard) {
                        buttonLastDebounceTime = millis();
                        currentState = on;
                    }
        
				break;
				case on:
                    digitalWrite(12,HIGH);
                    if (!buttonBounceGuard) {
                        screen.clear();
                        screen.print("allume"); 
                    }
            
		 			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if( digitalRead(9) == HIGH && buttonBounceGuard) {
                        buttonLastDebounceTime = millis();
                        currentState = off;
                    }
        
				break;
		}
	}
	
