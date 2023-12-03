package TeamB.dsl;

import java.util.ArrayList;
import java.util.List;

public class PinAllocator {
    private static PinAllocator instance;
    private List<Integer> availableAnalogPins = new ArrayList<>();
    private List<Integer> availableDigitalPins =  new ArrayList<>();

    public PinAllocator() {
        availableAnalogPins.addAll(List.of(23,24,25,26,27,28));
        availableDigitalPins.addAll(List.of(2,3,4,5,6,11,12,13,14,15,16,17,18,19));
    }

    public static PinAllocator instance() {
        if (instance == null) {
            instance = new PinAllocator();
        }
        return instance;
    }

    public List<Integer> getAvailableAnalogPins() {
        return availableAnalogPins;
    }

    public List<Integer> getAvailableDigitalPins() {
        return availableDigitalPins;
    }

    public void deallocateAnalogPin(String brickName, Integer pinNumber) {
        if (!availableAnalogPins.contains(pinNumber)) {
            availableAnalogPins.add(pinNumber);
            pinDeallocationInfo(brickName, pinNumber);
        }
    }

    public void deallocateDigitalPin(String brickName, Integer pinNumber) {
        if (!availableDigitalPins.contains(pinNumber)) {
            availableDigitalPins.add(pinNumber);
            pinDeallocationInfo(brickName, pinNumber);
        }
    }

    public Integer allocateAnalogPin(String brickName, Integer pinNumber) throws Exception {
        if (availableAnalogPins.isEmpty() || !availableAnalogPins.contains(pinNumber)) {
            pinAllocationError(brickName, String.valueOf(pinNumber), availableAnalogPins);
        }
        availableAnalogPins.remove(pinNumber);
        pinAllocationInfo(brickName, pinNumber);
        return pinNumber;
    }

    public Integer allocateDigitalPin(String brickName, Integer pinNumber) throws Exception {
        if (availableDigitalPins.isEmpty() || !availableDigitalPins.contains(pinNumber)) {
            pinAllocationError(brickName, String.valueOf(pinNumber), availableDigitalPins);
        }
        availableDigitalPins.remove(pinNumber);
        pinAllocationInfo(brickName, pinNumber);
        return pinNumber;
    }

    public Integer allocateAnalogPin(String brickName) throws Exception {
        if (availableAnalogPins.isEmpty()) {
            pinAllocationError(brickName, "", availableAnalogPins);
        }
        return allocateAnalogPin(brickName, availableAnalogPins.get(0));
    }

    public Integer allocateDigitalPin(String brickName) throws Exception {
        if (availableDigitalPins.isEmpty()) {
            pinAllocationError(brickName, "", availableDigitalPins);
        }
        return allocateDigitalPin(brickName, availableDigitalPins.get(0));
    }

    public void pinDeallocationInfo(String brickName, Integer pinDeallocated) {
        String infoTitle = "Deallocate pin " + pinDeallocated.toString() + " for brick " + brickName;
        String content = infoTitle + "\n";

        logToFile(content);
    }

    public void pinAllocationInfo(String brickName, Integer pinAllocated) {
        String infoTitle = "Allocate pin " + pinAllocated.toString() + " for brick " + brickName;
        String content = infoTitle + "\n";

        logToFile(content);
    }

    public void pinAllocationError(String brickName, String wantedPin, List<Integer> availablePins) throws Exception {
        String errorTitle = "Cannot allocate pin " + wantedPin + " for brick " + brickName;
        String errorDesc = "Pins available are: " + availablePins.toString();
        String content = "\n" + errorTitle + "\n" + errorDesc;

        logToFile(content);

        throw new Exception(content);
    }

    public void logToFile(String content) {
        LogWritter.instance().logToFile(content);
    }
}
