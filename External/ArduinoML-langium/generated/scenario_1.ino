
//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            

	void setup(){
		pinMode(12, OUTPUT); // red_led [Actuator]
		pinMode(11, OUTPUT); // red_led2 [Actuator]
		pinMode(9, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case off:
                    digitalWrite(12,LOW);
                    digitalWrite(11,LOW);
		 			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if( digitalRead(9) == HIGH && buttonBounceGuard) {
                        buttonLastDebounceTime = millis();
                        currentState = on;
                    }
        
				break;
				case on:
                    digitalWrite(11,HIGH);
                    digitalWrite(12,HIGH);
		 			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if( digitalRead(9) == LOW && buttonBounceGuard) {
                        buttonLastDebounceTime = millis();
                        currentState = off;
                    }
        
				break;
		}
	}
	
