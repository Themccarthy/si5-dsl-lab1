package jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral;


import jvm.src.main.java.io.github.mosser.arduinoml.kernel.generator.Visitable;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.generator.Visitor;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Actuator;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.SIGNAL;

public class Action implements Visitable {

	private SIGNAL value;
	private Actuator actuator;


	public SIGNAL getValue() {
		return value;
	}

	public void setValue(SIGNAL value) {
		this.value = value;
	}

	public Actuator getActuator() {
		return actuator;
	}

	public void setActuator(Actuator actuator) {
		this.actuator = actuator;
	}

	@Override
	public void accept(Visitor visitor) {
		visitor.visit(this);
	}
}
