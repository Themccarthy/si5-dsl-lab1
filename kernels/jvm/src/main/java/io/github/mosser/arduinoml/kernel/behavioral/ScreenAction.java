package jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral;

import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Screen;

public class ScreenAction extends Action {
    private Screen screen;
    private String content;

    public Screen getScreen() {
        return screen;
    }

    public String getContent() {
        return content;
    }

    public void setScreen(Screen screen) {
        this.screen = screen;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
