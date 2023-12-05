package TeamB.dsl;


import jvm.src.main.java.io.github.mosser.arduinoml.kernel.App;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.*;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.generator.ToWiring;
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.*;

import java.util.*;

public class Model {
    private Map<String, Brick> brickMap = new HashMap<>();
    private Map<String, State> stateMap = new HashMap<>();
    private State initialState = new State();

    private DSLBinding binding;

    public Model(DSLBinding dslBinding) {
        this.binding = dslBinding;
    }

    private void bindVariable(String name, Object variable) {
        binding.setVariable(name, variable);
    }

    public void createSensor(String name, Integer pin){
        Sensor sensor = new Sensor();
        sensor.setName(name);
        sensor.setPin(pin);
        brickMap.put(name, sensor);

        bindVariable(name, sensor);
    }

    public Sensor getSensor(String name) {
        return (Sensor) brickMap.getOrDefault(name, null);
    }

    public void createActuator(String name, Integer pin) {
        Actuator actuator = new Actuator();
        actuator.setName(name);
        actuator.setPin(pin);
        brickMap.put(name, actuator);

        bindVariable(name, actuator);
    }

    public Actuator getActuator(String name) {
        return (Actuator) brickMap.getOrDefault(name, null);
    }

    public void createScreen(String name, Integer bus) {
        Screen screen = new Screen();
        screen.setName(name);
        screen.setPin(bus);
        screen.setBusPins(BusPinManager.instance().getBusPins(bus));
        brickMap.put(name, screen);

        bindVariable(name, screen);
    }

    public void setScreenSize(String name, Integer screenLineLength) {
        if (brickMap.containsKey(name)) {
            Screen screen = (Screen) brickMap.get(name);
            screen.setLineLength(screenLineLength);
        }
    }

    public Screen getScreen(String name) {
        return (Screen) brickMap.getOrDefault(name, null);
    }

    public void createState(String name, List<Action> actions) {
        State state = new State();
        state.setName(name);
        state.setActions(actions);
        stateMap.put(name, state);

        bindVariable(name, state);
    }

    public State getState(String name) {
        return stateMap.getOrDefault(name, null);
    }

    public void createTransition(State baseState, State destinationState, TransitionFirst transitionFirst, List<TransitionCondition> transitionConditions) {
        Transition transition = new Transition();
        transition.setNext(destinationState);
        transition.setTransitionFirst(transitionFirst);
        transition.addAllTransitionConditions(transitionConditions);
        baseState.setTransition(transition);
    }

    public void createInitialState(State state) {
        initialState = state;
    }

    public App createApp(String name) {
        App app = new App();
        app.setName(name);
        app.setStates(new ArrayList<>(stateMap.values()));
        app.setInitial(initialState);
        app.setBricks(new ArrayList<>(brickMap.values()));
        return app;
    }

    public Object generate(App app, ToWiring visitor) {
        app.accept(visitor);

        return visitor.getResult();
    }
}
