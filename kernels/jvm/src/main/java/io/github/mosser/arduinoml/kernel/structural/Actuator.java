package jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural;


import jvm.src.main.java.io.github.mosser.arduinoml.kernel.generator.Visitor;

public class Actuator extends Brick {

	@Override
	public void accept(Visitor visitor) {
		visitor.visit(this);
	}
}
