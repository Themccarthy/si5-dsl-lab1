package jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural;

import jvm.src.main.java.io.github.mosser.arduinoml.kernel.NamedElement;

public class Pin implements NamedElement {
    private String name;
    private String number;
    private PinType pinType;

    @Override
    public String getName() {
        return name;
    }

    public String getNumber() {
        return number;
    }

    public PinType getPinType() {
        return pinType;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public void setPinType(PinType pinType) {
        this.pinType = pinType;
    }

    @Override
    public String toString() {
        return "Pin{" +
                "name='" + name + '\'' +
                ", number='" + number + '\'' +
                ", pinType=" + pinType +
                '}';
    }
}
