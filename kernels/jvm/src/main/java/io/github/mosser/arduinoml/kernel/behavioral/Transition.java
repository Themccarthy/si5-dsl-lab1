package jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral;


import jvm.src.main.java.io.github.mosser.arduinoml.kernel.generator.Visitable;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.generator.Visitor;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.SIGNAL;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Sensor;

import java.util.ArrayList;
import java.util.List;

public class Transition implements Visitable {

	private State next;
	private List<TransitionCondition> transitionConditions = new ArrayList<>();


	public State getNext() {
		return next;
	}

	public void setNext(State next) {
		this.next = next;
	}

	public List<TransitionCondition> getTransitionConditions() {
		return transitionConditions;
	}

	public TransitionCondition getTransitionConditionAtIndex(int index) {
		if (transitionConditions.isEmpty()) return null;
		return transitionConditions.get(index);
	}

	public void addTransitionCondition(TransitionCondition transitionCondition) {
		this.transitionConditions.add(transitionCondition);
	}

	public void addAllTransitionConditions(List<TransitionCondition> transitionConditions) {
		this.transitionConditions.addAll(transitionConditions);
	}

	@Override
	public void accept(Visitor visitor) {
		visitor.visit(this);
	}
}
