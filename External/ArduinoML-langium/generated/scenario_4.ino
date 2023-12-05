
//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {led1, led2, none};

STATE currentState = none;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            

	void setup(){
		pinMode(12, OUTPUT); // red_led [Actuator]
		pinMode(11, OUTPUT); // red_led2 [Actuator]
		pinMode(9, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case led1:
                    digitalWrite(12,LOW);
                    digitalWrite(11,HIGH);
		 			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if( digitalRead(9) == HIGH && buttonBounceGuard) {
                        buttonLastDebounceTime = millis();
                        currentState = led2;
                    }
        
				break;
				case led2:
                    digitalWrite(12,HIGH);
                    digitalWrite(11,LOW);
		 			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if( digitalRead(9) == HIGH && buttonBounceGuard) {
                        buttonLastDebounceTime = millis();
                        currentState = none;
                    }
        
				break;
				case none:
                    digitalWrite(12,LOW);
                    digitalWrite(11,LOW);
		 			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if( digitalRead(9) == HIGH && buttonBounceGuard) {
                        buttonLastDebounceTime = millis();
                        currentState = led1;
                    }
        
				break;
		}
	}
	
