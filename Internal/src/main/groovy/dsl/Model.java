package dsl;

import io.github.mosser.arduinoml.kernel.structural.Actuator;
import io.github.mosser.arduinoml.kernel.structural.Sensor;

public class Model {
    public Sensor createSensor(String name, Integer pin){
        Sensor sensor = new Sensor();
        sensor.setName(name);
        sensor.setPin(pin);
        return sensor;
    }


}
