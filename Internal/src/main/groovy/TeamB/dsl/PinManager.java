package TeamB.dsl;

import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Pin;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.PinType;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class PinManager {
    private static PinManager instance;
    private List<Pin> digitalPins = new ArrayList<>();
    private List<Pin> analogPins = new ArrayList<>();

    public PinManager() {
        defaultConfig();
    }

    public static PinManager instance() {
        if (instance == null) {
            instance = new PinManager();
        }
        return instance;
    }

    public void defaultConfig() {
        if (digitalPins.isEmpty()) {
            List<String> pinsNumber = List.of("8","9","10","11","12");
            for (String p : pinsNumber) {
                Pin pin = new Pin();
                pin.setName("digital_pin_" + p);
                pin.setNumber(p);
                pin.setPinType(PinType.DIGITAL_OUTPUT);
                digitalPins.add(pin);
            }
        }
        if (analogPins.isEmpty()) {
            List<String> pinsNumber = List.of("A0","A1","A2","A3","A4", "A5");
            for (String p : pinsNumber) {
                Pin pin = new Pin();
                pin.setName("analog_pin_" + p);
                pin.setNumber(p);
                pin.setPinType(PinType.ANALOG_OUTPUT);
                analogPins.add(pin);
            }
        }
    }

    public List<Pin> getDigitalPins() {
        return digitalPins;
    }

    public List<String> getDigitalPinsNumber() {
        return digitalPins.stream().map(Pin::getNumber).collect(Collectors.toList());
    }

    public List<Pin> getAnalogPins() {
        return analogPins;
    }

    public List<String> getAnalogPinsNumber() {
        return analogPins.stream().map(Pin::getNumber).collect(Collectors.toList());
    }

    public Pin getDigitalPin(String pinNumber) {
        for (Pin pin : digitalPins) {
            if (pin.getNumber().equals(pinNumber)) return pin;
        }
        return null;
    }

    public Pin getAnalogPin(String pinNumber) {
        for (Pin pin : analogPins) {
            if (pin.getNumber().equals(pinNumber)) return pin;
        }
        return null;
    }

    public void addPin(Pin pin) throws Exception {
        PinType type = pin.getPinType();
        if (type.equals(PinType.DIGITAL_INPUT) || type.equals(PinType.DIGITAL_OUTPUT)) {
            addDigitalPin(pin);
        }
        else {
            addAnalogPin(pin);
        }
    }

    private void addDigitalPin(Pin pin) throws Exception {
        verifyPin(pin, digitalPins);
        digitalPins.add(pin);
        pinManagerInfo(pin);
        logAvailableDigitalPins();
    }

    private void addAnalogPin(Pin pin) throws Exception {
        verifyPin(pin, analogPins);
        analogPins.add(pin);
        pinManagerInfo(pin);
        logAvailableAnalogPins();
    }

    public boolean containsPin(List<Pin> existingPins, Pin pin) {
        for (Pin pin1 : existingPins) {
            if (pin1.getName().equals(pin.getName())) return true;
            if (pin1.getNumber().equals(pin.getNumber())) return true;
        }
        return false;
    }

    private void verifyPin(Pin pin, List<Pin> pins) throws Exception {
        if (containsPin(pins, pin)) {
            pinManagerError(pin, "This pin already exists");
        }
        if (BusPinManager.instance().containsPin(pin.getNumber())) {
            pinManagerError(pin, "This pin is already used by the bus number " + BusPinManager.instance().getBusForPin(pin.getNumber()));
        }
    }

    public void pinManagerInfo(Pin pinDefined) {
        String infoTitle = "Define " + pinDefined.getName() + " (" + pinDefined.getPinType() + ")" + " on pin " + pinDefined.getNumber();
        String content = infoTitle + "\n";

        logInfoToFile(content);
    }

    public void pinManagerError(Pin wantedPin, String error) throws Exception {
        String errorTitle = "Cannot define " + wantedPin.getName() + " (" + wantedPin.getPinType() + ")" + " on pin " + wantedPin.getNumber();
        String errorDesc = error;
        String content = errorTitle + ": " + errorDesc + "\n";

        logErrorToFile(content);

        throw new Exception(content);
    }

    public void logAvailableDigitalPins() {
        String infoTitle = "Digital pins are : " + getDigitalPinsNumber().toString() + "\n";
        String content = infoTitle;

        logInfoToFile(content);
    }

    public void logAvailableAnalogPins() {
        String infoTitle = "Analog pins are : " + getAnalogPinsNumber().toString() + "\n";
        String content = infoTitle;

        logInfoToFile(content);
    }

    public void logInfoToFile(String content) {
        LogWritter.instance().logToFile(LogWritter.LOG_TYPE.INFO, content);
    }

    public void logErrorToFile(String content) {
        LogWritter.instance().logToFile(LogWritter.LOG_TYPE.ERROR, content);
    }
}
