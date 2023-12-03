package jvm.src.main.java.io.github.mosser.arduinoml.kernel.generator;


import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.*;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Screen;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Sensor;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.App;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Actuator;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Brick;

import java.util.List;

/**
 * Quick and dirty visitor to support the generation of Wiring code
 */
public class ToWiring extends Visitor<StringBuffer> {
	enum PASS {ONE, TWO}


	public ToWiring() {
		this.result = new StringBuffer();
	}

	private void w(String s) {
		result.append(String.format("%s",s));
	}

	@Override
	public void visit(App app) {
		//first pass, create global vars
		context.put("pass", PASS.ONE);
		w("// Wiring code generated from an ArduinoML model\n");
		w(String.format("// Application name: %s\n", app.getName())+"\n");

		boolean containsScreen = app.getBricks().stream().anyMatch(brick -> brick instanceof Screen);
		if (containsScreen) {
			w("#include <LiquidCrystal.h>\n");
		}


		w("\nlong debounce = 200;\n");
		w("\nenum STATE {");
		String sep ="";
		for(State state: app.getStates()){
			w(sep);
			state.accept(this);
			sep=", ";
		}
		w("};\n");
		if (app.getInitial() != null) {
			w("STATE currentState = " + app.getInitial().getName()+";\n");
		}

		for(Brick brick: app.getBricks()){
			brick.accept(this);
		}

		//second pass, setup and loop
		context.put("pass",PASS.TWO);
		w("\nvoid setup(){\n");
		for(Brick brick: app.getBricks()){
			brick.accept(this);
		}
		w("}\n");

		w("\nvoid loop() {\n" +
			"\tswitch(currentState){\n");
		for(State state: app.getStates()){
			state.accept(this);
		}
		w("\t}\n" +
			"}");
	}

	@Override
	public void visit(Actuator actuator) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w(String.format("  pinMode(%d, OUTPUT); // %s [Actuator]\n", actuator.getPin(), actuator.getName()));
			return;
		}
	}


	@Override
	public void visit(Sensor sensor) {
		if(context.get("pass") == PASS.ONE) {
			w(String.format("\nboolean %sBounceGuard = false;\n", sensor.getName()));
			w(String.format("long %sLastDebounceTime = 0;\n", sensor.getName()));
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w(String.format("  pinMode(%d, INPUT);  // %s [Sensor]\n", sensor.getPin(), sensor.getName()));
			return;
		}
	}

	@Override
	public void visit(Screen screen) {
		if(context.get("pass") == PASS.ONE) {
			w(String.format("\nLiquidCrystal %s(%s);\n", screen.getName(), screen.getBusPins().toString().replace("[", "").replace("]", "")));
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w(String.format("  %s.begin(%d,%d);  // %s [Screen]\n", screen.getName(), screen.getLineLength(), screen.getRowLength(), screen.getName()));
			return;
		}
	}

	@Override
	public void visit(State state) {
		if(context.get("pass") == PASS.ONE){
			w(state.getName());
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w("\t\tcase " + state.getName() + ":\n");
			for (Action action : state.getActions()) {
				action.accept(this);
			}

			if (state.getTransition() != null) {
				state.getTransition().accept(this);
				w("\t\tbreak;\n");
			}
			return;
		}

	}

	@Override
	public void visit(Transition transition) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			List<TransitionCondition> transitionConditions = transition.getTransitionConditions();

			for (TransitionCondition transitionCondition : transitionConditions) {
				if (transitionCondition.getLogicalCondition().equals(LogicalCondition.NONE)) {
					String sensorName = transitionCondition.getSensor().getName();
					w(String.format("\t\t\t%sBounceGuard = millis() - %sLastDebounceTime > debounce;\n",
							sensorName, sensorName));
				}
			}

			w("\t\t\tif(");

			for (TransitionCondition transitionCondition : transitionConditions) {
				if (transitionCondition.getLogicalCondition().equals(LogicalCondition.NONE)) {
					w(String.format("digitalRead(%d) == %s && %sBounceGuard ",
							transitionCondition.getSensor().getPin(), transitionCondition.getValue(), transitionCondition.getSensor().getName()));
				}
				else {
					w(String.format("%s ", transitionCondition.getLogicalCondition().getOperator()));
				}
			}

			w(") {\n");

			for (TransitionCondition transitionCondition : transitionConditions) {
				if (transitionCondition.getLogicalCondition().equals(LogicalCondition.NONE)) {
					w(String.format("\t\t\t\t%sLastDebounceTime = millis();\n", transitionCondition.getSensor().getName()));
				}
			}

			w("\t\t\t\tcurrentState = " + transition.getNext().getName() + ";\n");
			w("\t\t\t}\n");

			return;
		}
	}

	@Override
	public void visit(Action action) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			if (action instanceof ActuatorAction a) {
				w(String.format("\t\t\tdigitalWrite(%d,%s);\n",a.getActuator().getPin(),a.getValue()));
			}
			else if (action instanceof ScreenAction s){
				w(String.format("\t\t\t%s.clear();\n",s.getScreen().getName()));
				w(String.format("\t\t\t%s.print(\"%s\");\n",s.getScreen().getName(),s.getContent()));
			}

			return;
		}
	}

}
