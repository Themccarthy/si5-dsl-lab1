
//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            

	void setup(){
		pinMode(26, OUTPUT); // red_led [Actuator]
		pinMode(21, OUTPUT); // red_led2 [Actuator]
		pinMode(22, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case off:
                    digitalWrite(26,LOW);
                    digitalWrite(21,LOW);
		 			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if( digitalRead(22) == HIGH && buttonBounceGuard) {
                        buttonLastDebounceTime = millis();
                        currentState = on;
                    }
        
				break;
				case on:
                    digitalWrite(21,HIGH);
                    digitalWrite(26,HIGH);
		 			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if( digitalRead(22) == LOW && buttonBounceGuard) {
                        buttonLastDebounceTime = millis();
                        currentState = off;
                    }
        
				break;
		}
	}
	
