
//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            

	void setup(){
		pinMode(8, OUTPUT); // red_led [Actuator]
		pinMode(9, OUTPUT); // red_led2 [Actuator]
		pinMode(10, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case off:
                    digitalWrite(8,LOW);
                    digitalWrite(9,LOW);
		 			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if( digitalRead(10) == HIGH && buttonBounceGuard) {
                        buttonLastDebounceTime = millis();
                        currentState = on;
                    }
        
				break;
				case on:
                    digitalWrite(9,HIGH);
                    digitalWrite(8,HIGH);
		 			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if( digitalRead(10) == LOW && buttonBounceGuard) {
                        buttonLastDebounceTime = millis();
                        currentState = off;
                    }
        
				break;
		}
	}
	
