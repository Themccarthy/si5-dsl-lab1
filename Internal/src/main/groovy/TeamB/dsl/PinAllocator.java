package TeamB.dsl;

import java.util.ArrayList;
import java.util.List;

public class PinAllocator {
    private static PinAllocator instance;
    private List<Integer> availablePins = new ArrayList<>();
    private List<Integer> availableBusPins =  new ArrayList<>();

    public PinAllocator() {
        availablePins.addAll(List.of(8,9,10,11,12));
        availableBusPins.addAll(BusPinManager.instance().getBusList());
    }

    public static PinAllocator instance() {
        if (instance == null) {
            instance = new PinAllocator();
        }
        return instance;
    }

    public List<Integer> getAvailablePins() {
        return availablePins;
    }

    public List<Integer> getAvailableBusPins() {
        return availableBusPins;
    }

    public void deallocatePin(String brickName, Integer pinNumber) {
        if (!availablePins.contains(pinNumber)) {
            availablePins.add(pinNumber);
            pinDeallocationInfo("(DYNAMIC)", brickName, pinNumber);
        }
    }

    public void deallocateBusPin(String brickName, Integer pinNumber) {
        if (!availableBusPins.contains(pinNumber)) {
            availableBusPins.add(pinNumber);
            pinDeallocationInfo("(DYNAMIC)", brickName, pinNumber);
        }
    }

    public Integer allocatePin(String brickName, Integer pinNumber) throws Exception {
        if (availablePins.isEmpty() || !availablePins.contains(pinNumber)) {
            pinAllocationError(brickName, String.valueOf(pinNumber), availablePins);
        }
        availablePins.remove(pinNumber);
        pinAllocationInfo("(USER NEEDS)", brickName, pinNumber);
        return pinNumber;
    }

    public Integer allocateBusPin(String brickName, Integer pinNumber) throws Exception {
        if (availableBusPins.isEmpty() || !availableBusPins.contains(pinNumber)) {
            pinAllocationError(brickName, String.valueOf(pinNumber), availableBusPins);
        }
        availableBusPins.remove(pinNumber);
        pinAllocationInfo("(USER NEEDS)", brickName, pinNumber);
        return pinNumber;
    }

    public Integer allocatePin(String brickName) throws Exception {
        if (availablePins.isEmpty()) {
            pinAllocationError(brickName, "", availablePins);
        }
        Integer pinNumber = availablePins.get(0);
        availablePins.remove(pinNumber);
        pinAllocationInfo("(DYNAMIC)", brickName, pinNumber);
        return pinNumber;
    }

    public Integer allocateBusPin(String brickName) throws Exception {
        if (availableBusPins.isEmpty()) {
            pinAllocationError(brickName, "", availableBusPins);
        }
        Integer pinNumber = availableBusPins.get(0);
        availableBusPins.remove(pinNumber);
        pinAllocationInfo("(DYNAMIC)", brickName, pinNumber);
        return pinNumber;
    }

    public void pinDeallocationInfo(String action, String brickName, Integer pinDeallocated) {
        String infoTitle = "Deallocate pin " + pinDeallocated.toString() + " for brick " + brickName;
        String content = infoTitle + action + "\n";

        logInfoToFile(content);
    }

    public void pinAllocationInfo(String action, String brickName, Integer pinAllocated) {
        String infoTitle = "Allocate pin " + pinAllocated.toString() + " for brick " + brickName;
        String content = infoTitle + " " + action + "\n";

        logInfoToFile(content);
    }

    public void pinAllocationError(String brickName, String wantedPin, List<Integer> availablePins) throws Exception {
        String errorTitle = "Cannot allocate pin " + wantedPin + " for brick " + brickName;
        String errorDesc = "Pins available are: " + availablePins.toString();
        String content = errorTitle + ",  " + errorDesc + "\n";

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
