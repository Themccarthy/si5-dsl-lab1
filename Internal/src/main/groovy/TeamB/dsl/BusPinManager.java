package TeamB.dsl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class BusPinManager {
    private static BusPinManager instance;
    private Map<Integer, List<String>> mapBusPins =  new HashMap<>();

    public BusPinManager() {
        defaultConfig();
    }

    public static BusPinManager instance() {
        if (instance == null) {
            instance = new BusPinManager();
        }
        return instance;
    }

    public void defaultConfig() {
        if (mapBusPins.isEmpty()) {
            try {
                addBusPins(1, List.of("2","3","4","5","6","7","8"));
                addBusPins(2, List.of("10","11","12","13","A0","A1","A2"));
                addBusPins(3, List.of("10","11","12","13","A4","A5","1"));
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }

    public int getBusSize() {
        return this.mapBusPins.size();
    }

    public List<Integer> getBusList() {
        return new ArrayList<>(this.mapBusPins.keySet());
    }

    public List<String> getBusListAsString() {
        return this.mapBusPins.keySet().stream().map(Object::toString).collect(Collectors.toList());
    }

    public List<String> getBusPins(Integer busNumber) {
        return mapBusPins.getOrDefault(busNumber, List.of());
    }

    public Integer getBusForPin(String pin) {
        for (Integer bus : mapBusPins.keySet()) {
            if (getBusPins(bus).contains(pin)) return bus;
        }
        return -1;
    }

    public boolean containsPin(String pin) {
        for (List<String> pins : mapBusPins.values()) {
            if (pins.contains(pin)) return true;
        }
        return false;
    }

    public void addBusPins(Integer busNumber, List<String> busPins) throws Exception {
        if (busPins.size() < 7) {
            busPinManagerError(busNumber, busPins, "The bus must contain at least 7 pins");
        }
        if (mapBusPins.containsKey(busNumber)) {
            busPinManagerError(busNumber, busPins, "The bus number " + busNumber + " is already used");
        }
        mapBusPins.put(busNumber, busPins);
        busPinManagerInfo(busNumber, busPins);
    }

    public void busPinManagerInfo(Integer busNumber, List<String> busPins) {
        String infoTitle = "Add/Update bus number " + busNumber + " with pins " + busPins.toString();
        String content = infoTitle + "\n";

        logToFile(content);
    }

    public void busPinManagerError(Integer busNumber, List<String> busPins, String error) throws Exception {
        String errorTitle = "Cannot add/update bus number " + busNumber + " with pins " + busPins.toString();
        String errorDesc = error;
        String content = errorTitle + ": " + errorDesc + "\n";

        logToFile(content);

        throw new Exception(content);
    }

    public void logToFile(String content) {
        LogWritter.instance().logToFile(LogWritter.LOG_TYPE.INFO, content);
    }
}
