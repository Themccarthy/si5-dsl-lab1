package jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral;

import jvm.src.main.java.io.github.mosser.arduinoml.kernel.generator.Visitable;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.generator.Visitor;

public abstract class Action implements Visitable {
    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }
}
