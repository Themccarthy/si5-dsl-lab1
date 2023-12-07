package jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural;

public enum PinType {
    DIGITAL_INPUT("DIGITAL_INPUT"),
    DIGITAL_OUTPUT("DIGITAL_OUTPUT"),
    ANALOG_INPUT("ANALOG_INPUT"),
    ANALOG_OUTPUT("ANALOG_OUTPUT");

    private String title;

    PinType(String title) {
        this.title = title;
    }
}
