
//Wiring code generated from an ArduinoML model
// Application name: RedButton
#include <LiquidCrystal.h>
long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            

LiquidCrystal screen(21,22,23,25,26,27,28);
            

	void setup(){
		pinMode(8, OUTPUT); // red_led [Actuator]
		screen.begin(16,2); // screen [Screen]
		pinMode(9, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case off:
                    digitalWrite(8,LOW);
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
                    digitalWrite(8,HIGH);
                    if (!buttonBounceGuard) {
                        screen.clear();
                        screen.print("allume"); 
                    }
            
		 			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if( digitalRead(9) == LOW && buttonBounceGuard) {
                        buttonLastDebounceTime = millis();
                        currentState = off;
                    }
        
				break;
		}
	}
	
