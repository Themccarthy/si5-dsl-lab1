package jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural;

import jvm.src.main.java.io.github.mosser.arduinoml.kernel.generator.Visitor;

import java.util.ArrayList;
import java.util.List;

public class Screen extends Brick {
    private List<Integer> busPins = new ArrayList<>();
    private Integer lineLength = 16;
    private Integer rowLength = 2;

    public List<Integer> getBusPins() {
        return busPins;
    }

    public Integer getLineLength() {
        return lineLength;
    }

    public Integer getRowLength() {
        return rowLength;
    }

    public void setBusPins(List<Integer> busPins) {
        this.busPins = busPins;
    }

    public void setLineLength(Integer lineLength) {
        this.lineLength = lineLength;
    }

    public void setRowLength(Integer rowLength) {
        this.rowLength = rowLength;
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }
}
