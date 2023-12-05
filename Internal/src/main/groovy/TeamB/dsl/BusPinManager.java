package TeamB.dsl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BusPinManager {
    private static BusPinManager instance;
    private Map<Integer, List<Integer>> mapBusPins =  new HashMap<>();

    public BusPinManager() {
        try {
            addBusPins(1, List.of(2,3,4,5,6,7,8));
            addBusPins(2, List.of(9,10,11,12,13,14,15));
            addBusPins(3, List.of(16,17,18,19,20,21,22));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static BusPinManager instance() {
        if (instance == null) {
            instance = new BusPinManager();
        }
        return instance;
    }

    public int getBusSize() {
        return this.mapBusPins.size();
    }

    public List<Integer> getBusList() {
        return new ArrayList<>(this.mapBusPins.keySet());
    }

    public List<Integer> getBusPins(Integer busNumber) {
        return mapBusPins.getOrDefault(busNumber, List.of());
    }

    public void addBusPins(Integer busNumber, List<Integer> busPins) throws Exception {
        if (busPins.size() < 7) {
            busPinManagerError(busNumber, busPins);
        }
        mapBusPins.put(busNumber, busPins);
        busPinManagerInfo(busNumber, busPins);
    }

    public void busPinManagerInfo(Integer busNumber, List<Integer> busPins) {
        String infoTitle = "Add/Update bus number " + busNumber + " with pins " + busPins.toString();
        String content = infoTitle + "\n";

        logToFile(content);
    }

    public void busPinManagerError(Integer busNumber, List<Integer> busPins) throws Exception {
        String errorTitle = "Cannot add/update bus number " + busNumber + " with pins " + busPins.toString();
        String errorDesc = "The bus must contain at least 7 pins";
        String content = errorTitle + ",  " + errorDesc + "\n";

        logToFile(content);

        throw new Exception(content);
    }

    public void logToFile(String content) {
        LogWritter.instance().logToFile(LogWritter.LOG_TYPE.INFO, content);
    }
}
