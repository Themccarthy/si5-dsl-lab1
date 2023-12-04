package jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral;

import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.SIGNAL;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Sensor;

public class TransitionCondition{
    private Sensor sensor;
    private SIGNAL value;
    private LogicalCondition logicalCondition = LogicalCondition.NONE;

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

    public void setLogicalCondition(LogicalCondition logicalCondition) {
        this.logicalCondition = logicalCondition;
    }

    public LogicalCondition getLogicalCondition() {
        return logicalCondition;
    }
}
