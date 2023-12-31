package TeamB.dsl;

import java.io.*;

public class LogWritter {
    private static LogWritter instance;
    private final String FILE_PATH = "aml.log";
    public enum LOG_TYPE {
        INFO("INFO"),
        ERROR("ERROR");

        private String title;

        LOG_TYPE(String title) {
            this.title = title;
        }
    }

    public LogWritter() {
        try {
            new FileOutputStream(FILE_PATH).close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static LogWritter instance() {
        if (instance == null) {
            instance = new LogWritter();
        }
        return instance;
    }

    public void logToFile(LOG_TYPE type, String content) {
        try {
            File file = new File(FILE_PATH);
            FileWriter fr = new FileWriter(file, true);
            BufferedWriter br = new BufferedWriter(fr);
            br.write(type + " : " + content);

            br.close();
            fr.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
