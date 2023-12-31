package jvm.src.main.java.io.github.mosser.arduinoml.kernel.samples;

import jvm.src.main.java.io.github.mosser.arduinoml.kernel.App;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.*;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.generator.ToWiring;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.generator.Visitor;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.*;

import java.util.Arrays;

public class Switch {

	public static void main(String[] args) {

		// Declaring elementary bricks
		Sensor button = new Sensor();
		button.setName("button");
		button.setPin(9);

		Actuator led = new Actuator();
		led.setName("LED");
		led.setPin(12);

		// Declaring states
		State on = new State();
		on.setName("on");

		State off = new State();
		off.setName("off");

		// Creating actions
		ActuatorAction switchTheLightOn = new ActuatorAction();
		switchTheLightOn.setActuator(led);
		switchTheLightOn.setValue(SIGNAL.HIGH);

		ActuatorAction switchTheLightOff = new ActuatorAction();
		switchTheLightOff.setActuator(led);
		switchTheLightOff.setValue(SIGNAL.LOW);

		// Binding actions to states
		on.setActions(Arrays.asList(switchTheLightOn));
		off.setActions(Arrays.asList(switchTheLightOff));

		// Creating transitions
		Transition on2off = new Transition();
		on2off.setNext(off);
		TransitionCondition transitionCondition = new TransitionCondition();
		transitionCondition.setSensor(button);
		transitionCondition.setValue(SIGNAL.HIGH);
		on2off.addTransitionCondition(transitionCondition);

		Transition off2on = new Transition();
		off2on.setNext(on);
		on2off.addTransitionCondition(transitionCondition);

		// Binding transitions to states
		on.setTransition(on2off);
		off.setTransition(off2on);

		// Building the App
		App theSwitch = new App();
		theSwitch.setName("Switch!");
		theSwitch.setBricks(Arrays.asList(button, led ));
		theSwitch.setStates(Arrays.asList(on, off));
		theSwitch.setInitial(off);

		// Generating Code
		Visitor codeGenerator = new ToWiring();
		theSwitch.accept(codeGenerator);

		// Printing the generated code on the console
		System.out.println(codeGenerator.getResult());
	}

}
