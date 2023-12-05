
//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool button2BounceGuard = false;
long button2LastDebounceTime = 0;

            

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            

	void setup(){
		pinMode(12, OUTPUT); // red_led [Actuator]
		pinMode(10, INPUT); // button2 [Sensor]
		pinMode(9, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case off:
                    digitalWrite(12,LOW);
		 			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if( digitalRead(9) == HIGH && digitalRead(10) == HIGH  && buttonBounceGuard) {
                        buttonLastDebounceTime = millis();
                        currentState = on;
                    }
        
				break;
				case on:
                    digitalWrite(12,HIGH);
		 			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if( digitalRead(9) == LOW || digitalRead(10) == LOW  && buttonBounceGuard) {
                        buttonLastDebounceTime = millis();
                        currentState = off;
                    }
        
				break;
		}
	}
	
