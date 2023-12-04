package TeamB.dsl

import jvm.src.main.java.io.github.mosser.arduinoml.kernel.App
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.Action
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.LogicalCondition
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.State
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.TransitionCondition
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.generator.ToWiring
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Sensor

abstract class Basescript extends Script {

    def sensor(String sensorName) {
        // By default auto allocate pin
        Integer pinNumber = PinAllocator.instance().allocateDigitalPin(sensorName)
        ((DSLBinding) this.getBinding()).getModel().createSensor(sensorName, pinNumber)

        [pin : { p ->
            // In case the user specifies the pin, we deallocate the pin auto allocated before
            PinAllocator.instance().deallocateDigitalPin(sensorName, pinNumber)

            // Then we allocate the pin specified by the user
            PinAllocator.instance().allocateDigitalPin(sensorName, Integer.valueOf(p))
            ((DSLBinding) this.getBinding()).getModel().createSensor(sensorName, p)
        }]
    }

    def actuator(String actuatorName) {
        // By default auto allocate pin
        Integer pinNumber = PinAllocator.instance().allocateAnalogPin(actuatorName)
        ((DSLBinding) this.getBinding()).getModel().createActuator(actuatorName, pinNumber)

        [pin : { p ->
            // In case the user specifies the pin, we deallocate the pin auto allocated before
            PinAllocator.instance().deallocateAnalogPin(actuatorName, pinNumber)

            // Then we allocate the pin specified by the user
            PinAllocator.instance().allocateAnalogPin(actuatorName, Integer.valueOf(p))
            ((DSLBinding) this.getBinding()).getModel().createActuator(actuatorName, p)
        }]
    }

    def state(String name) {
        List<Action> actions = new ArrayList<>();
        ((DSLBinding) this.getBinding()).getModel().createState(name, actions)

        def closure
        closure = { actuator ->
            [turn : { signal ->
                Action action = new Action()
                action.setActuator(((DSLBinding) this.getBinding()).getModel().getActuator(actuator))
                action.setValue(signal)
                actions.add(action)
                [and: closure]
            }]
        }

        [trigger : closure]
    }

    def transition(String baseState) {
        String destinationStateValue = "";
        State state1 = null;
        State state2 = null;
        List<TransitionCondition> transitionConditions = new ArrayList<>();

        def conditionClosure

        def handleAnd = { nextSensorName ->
            TransitionCondition transitionCondition = new TransitionCondition()
            transitionCondition.setLogicalCondition(LogicalCondition.AND)
            transitionConditions.add(transitionCondition)
            conditionClosure(nextSensorName) // Return to conditionClosure for chaining
        }

        def handleOr = { nextSensorName ->
            TransitionCondition transitionCondition = new TransitionCondition()
            transitionCondition.setLogicalCondition(LogicalCondition.OR)
            transitionConditions.add(transitionCondition)
            conditionClosure(nextSensorName) // Return to conditionClosure for chaining
        }

        def handleFirst = { destinationState, nextSensorName ->
            destinationStateValue = destinationState
            state1 = ((DSLBinding) this.getBinding()).getModel().getState(baseState)
            state2 = ((DSLBinding) this.getBinding()).getModel().getState(destinationStateValue)
            conditionClosure(nextSensorName) // Return to conditionClosure for chaining
        }

        def closure
        closure = { destinationState ->
            [when: {
                nextSensorName -> handleFirst(destinationState, nextSensorName)
            }]}

        conditionClosure = { sensorName ->
                [turn: { signal ->
                    Sensor sensor = ((DSLBinding) this.getBinding()).getModel().getSensor(sensorName)

                    TransitionCondition transitionCondition = new TransitionCondition()
                    transitionCondition.setSensor(sensor)
                    transitionCondition.setValue(signal)
                    LogicalCondition logicalCondition = LogicalCondition.NONE
                    transitionCondition.setLogicalCondition(logicalCondition)
                    transitionConditions.add(transitionCondition)

                    ((DSLBinding) this.getBinding()).getModel().createTransition(state1, state2, transitionConditions)


                     [and: {
                         nextSensorName -> handleAnd(nextSensorName)
                     },
                     or: {
                         nextSensorName -> handleOr(nextSensorName)
                     }]
                }]
            }

        [to : closure]
    }

    def initialState(String stateName) {
        State state = ((DSLBinding) this.getBinding()).getModel().getState(stateName)
        ((DSLBinding) this.getBinding()).getModel().createInitialState(state)
    }

    def export(String appName) {
        App app = ((DSLBinding) this.getBinding()).getModel().createApp(appName);
        println(((DSLBinding) this.getBinding()).getModel().generate(app, new ToWiring()))
    }
}