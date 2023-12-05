package jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral;

import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.SIGNAL;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Sensor;

public class TransitionFirst {
    private Sensor sensor;
    private SIGNAL value;

    public Sensor getSensor() {
        return sensor;
    }

    public SIGNAL getValue() {
        return value;
    }

    public void setSensor(Sensor sensor) {
        this.sensor = sensor;
    }

    public void setValue(SIGNAL value) {
        this.value = value;
    }
}
