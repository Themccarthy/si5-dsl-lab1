package TeamB.dsl;

import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Pin;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.PinType;

import java.util.ArrayList;
import java.util.List;

public class PinAllocator {
    private static PinAllocator instance;
    private List<String> availableDigitalPins = new ArrayList<>();
    private List<String> availableAnalogPins = new ArrayList<>();
    private List<String> availableBusPins =  new ArrayList<>();

    public PinAllocator() {
        defaultConfig();
    }

    public static PinAllocator instance() {
        if (instance == null) {
            instance = new PinAllocator();
        }
        return instance;
    }

    public void defaultConfig() {
        availableDigitalPins.addAll(PinManager.instance().getDigitalPinsNumber());
        availableAnalogPins.addAll(PinManager.instance().getAnalogPinsNumber());
        availableBusPins.addAll(BusPinManager.instance().getBusListAsString());
    }

    public List<String> getAvailableDigitalPins() {
        return availableDigitalPins;
    }

    public List<String> getAvailableAnalogPins() {
        return availableAnalogPins;
    }

    public List<String> getAvailableBusPins() {
        return availableBusPins;
    }

    public void deallocatePin(String brickName, String pinNumber) {
        if (!availableDigitalPins.contains(pinNumber)) {
            availableDigitalPins.add(pinNumber);
            pinDeallocationInfo("(DYNAMIC)", brickName, pinNumber);
        }
    }

    public void deallocateBusPin(String brickName, String pinNumber) {
        if (!availableBusPins.contains(pinNumber)) {
            availableBusPins.add(pinNumber);
            pinDeallocationInfo("(DYNAMIC)", brickName, pinNumber);
        }
    }

    public String allocatePin(String brickName, String pinNumber) throws Exception {
        if (availableDigitalPins.isEmpty() || !availableDigitalPins.contains(pinNumber)) {
            pinAllocationError(brickName, String.valueOf(pinNumber), availableDigitalPins);
        }
        availableDigitalPins.remove(pinNumber);
        pinAllocationInfo("(USER NEEDS)", brickName, pinNumber);
        return pinNumber;
    }

    public String allocateBusPin(String brickName, String pinNumber) throws Exception {
        if (availableBusPins.isEmpty() || !availableBusPins.contains(pinNumber)) {
            pinAllocationError(brickName, String.valueOf(pinNumber), availableBusPins);
        }
        availableBusPins.remove(pinNumber);
        pinAllocationInfo("(USER NEEDS)", brickName, pinNumber);
        return pinNumber;
    }

    public String allocatePin(String brickName) throws Exception {
        if (availableDigitalPins.isEmpty()) {
            pinAllocationError(brickName, "", availableDigitalPins);
        }
        String pinNumber = availableDigitalPins.get(0);
        availableDigitalPins.remove(pinNumber);
        pinAllocationInfo("(DYNAMIC)", brickName, pinNumber);
        return pinNumber;
    }

    public String allocateBusPin(String brickName) throws Exception {
        if (availableBusPins.isEmpty()) {
            pinAllocationError(brickName, "", availableBusPins);
        }
        String pinNumber = availableBusPins.get(0);
        availableBusPins.remove(pinNumber);
        pinAllocationInfo("(DYNAMIC)", brickName, pinNumber);
        return pinNumber;
    }

    public void pinDeallocationInfo(String action, String brickName, String pinDeallocated) {
        String infoTitle = "Deallocate pin " + pinDeallocated + " for brick " + brickName;
        String content = infoTitle + " " + action + "\n";

        logInfoToFile(content);
    }

    public void pinAllocationInfo(String action, String brickName, String pinAllocated) {
        String infoTitle = "Allocate pin " + pinAllocated + " for brick " + brickName;
        String content = infoTitle + " " + action + "\n";

        logInfoToFile(content);
    }

    public void verifyPinType(String brickName, String pin, PinType typeWanted) throws Exception {
        Pin pinResult;
        if (typeWanted.equals(PinType.DIGITAL_OUTPUT) || typeWanted.equals(PinType.DIGITAL_INPUT)) {
            pinResult = PinManager.instance().getDigitalPin(pin);
        }
        else {
            pinResult = PinManager.instance().getAnalogPin(pin);
        }

        if (pinResult == null) {
            pinGlobalError(brickName, pin, "Pin is not of type " + typeWanted);
        }
    }

    public void pinAllocationError(String brickName, String wantedPin, List<String> availablePins) throws Exception {
        pinGlobalError(brickName, wantedPin, "Pins available are: " + availablePins.toString());
    }

    public void pinGlobalError(String brickName, String wantedPin, String errorDesc) throws Exception {
        String errorTitle = "Cannot allocate pin " + wantedPin + " for brick " + brickName;

        String content = errorTitle + ": " + errorDesc + "\n";

        logErrorToFile(content);

        throw new Exception(content);
    }

    public void logInfoToFile(String content) {
        LogWritter.instance().logToFile(LogWritter.LOG_TYPE.INFO, content);
    }

    public void logErrorToFile(String content) {
        LogWritter.instance().logToFile(LogWritter.LOG_TYPE.ERROR, content);
    }
}
