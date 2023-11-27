package TeamB.dsl

import jvm.src.main.java.io.github.mosser.arduinoml.kernel.App
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.Action
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.State
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.Transition
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.generator.ToWiring
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.SIGNAL
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Sensor

abstract class Basescript extends Script {
    def sensor(String name, Integer pin) {
        ((DSLBinding) this.getBinding()).getModel().createSensor(name, pin);
    }

    def actuator(String name, Integer pin) {
        ((DSLBinding) this.getBinding()).getModel().createActuator(name, pin);
    }

    def state(String name, String sensorName, SIGNAL value) {
        Sensor sensor = ((DSLBinding) this.getBinding()).getModel().getSensor(sensorName);

        Transition transition = new Transition();
        transition.setSensor(sensor);
        transition.setValue(value);

        ((DSLBinding) this.getBinding()).getModel().createState(name, new ArrayList<Action>(), transition);
    }

    def transition(String baseState, String destinationState, String sensorName, SIGNAL value) {
        State state1 = ((DSLBinding) this.getBinding()).getModel().getState(baseState);
        State state2 = ((DSLBinding) this.getBinding()).getModel().getState(destinationState);
        Sensor sensor = ((DSLBinding) this.getBinding()).getModel().getSensor(sensorName);

        ((DSLBinding) this.getBinding()).getModel().createTransition(state1, state2, sensor, value);
    }

    def initialState(String stateName) {
        State state = ((DSLBinding) this.getBinding()).getModel().getState(stateName);
        ((DSLBinding) this.getBinding()).getModel().createInitialState(state);
    }

    def export(String appName) {
        App app = ((DSLBinding) this.getBinding()).getModel().createApp(appName);
        println(((DSLBinding) this.getBinding()).getModel().generate(app, new ToWiring()))
    }
}