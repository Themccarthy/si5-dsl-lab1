package TeamB.dsl;

import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Screen;

public class ScreenValidator {
    private static ScreenValidator instance;

    public static ScreenValidator instance() {
        if (instance == null) {
            instance = new ScreenValidator();
        }
        return instance;
    }

    public void verifyScreenContent(Screen screen, String screenContent) throws Exception {
        if (screenContent.length() > screen.getLineLength()) {
            String errorTitle = "The content " + screenContent + " is invalid for screen " + screen.getName();
            String errorDesc = "The content length should not be more than " + screen.getLineLength();
            String content = errorTitle + ",  " + errorDesc + "\n";

            logToFile(content);

            throw new Exception(content);
        }
    }

    public void logToFile(String content) {
        LogWritter.instance().logToFile(LogWritter.LOG_TYPE.ERROR, content);
    }
}
