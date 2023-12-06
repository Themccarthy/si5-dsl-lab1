package TeamB.dsl

import jvm.src.main.java.io.github.mosser.arduinoml.kernel.App
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.Action
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.ActuatorAction
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.LogicalOperator
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.ScreenAction
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.State
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.TransitionCondition
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.behavioral.TransitionFirst
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.generator.ToWiring
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Pin
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.PinType
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Screen
import jvm.src.main.java.io.github.mosser.arduinoml.kernel.structural.Sensor

abstract class Basescript extends Script {

    def pin(String pinName) {
        [on: { p ->
            [type : { t ->
                Pin pin = new Pin()
                pin.setName(pinName)
                pin.setNumber(p)
                pin.setPinType(t)
                PinManager.instance().addPin(pin)
            }]
        }]
    }

    def bus(Integer busNumber) {
        [pins : { ps ->
            String pinsUsed = ps
            List<String> pins = pinsUsed.split(",") as List<String>
            BusPinManager.instance().addBusPins(busNumber, pins);
        }]
    }

    def sensor(String sensorName) {
        // By default auto allocate pin
        String pinNumber = PinAllocator.instance().allocatePin(sensorName)
        ((DSLBinding) this.getBinding()).getModel().createSensor(sensorName, pinNumber as Integer)

        [pin : { p ->
            // First verify that the pin is digital
            PinAllocator.instance().verifyPinType(sensorName, p as String, PinType.DIGITAL_INPUT)

            // In case the user specifies the pin, we deallocate the pin auto allocated before
            PinAllocator.instance().deallocatePin(sensorName, pinNumber)

            // Then we allocate the pin specified by the user
            PinAllocator.instance().allocatePin(sensorName, p as String)
            ((DSLBinding) this.getBinding()).getModel().createSensor(sensorName, p as Integer)
        }]
    }

    def actuator(String actuatorName) {
        // By default auto allocate pin
        String pinNumber = PinAllocator.instance().allocatePin(actuatorName)
        ((DSLBinding) this.getBinding()).getModel().createActuator(actuatorName, pinNumber as Integer)

        [pin : { p ->
            // First verify that the pin is digital
            PinAllocator.instance().verifyPinType(actuatorName, p as String, PinType.DIGITAL_INPUT)

            // In case the user specifies the pin, we deallocate the pin auto allocated before
            PinAllocator.instance().deallocatePin(actuatorName, pinNumber)

            // Then we allocate the pin specified by the user
            PinAllocator.instance().allocatePin(actuatorName, p as String)
            ((DSLBinding) this.getBinding()).getModel().createActuator(actuatorName, p as Integer)
        }]
    }

    def screen(String screenName) {
        // By default auto allocate pin
        String pinNumber = PinAllocator.instance().allocateBusPin(screenName)
        ((DSLBinding) this.getBinding()).getModel().createScreen(screenName, pinNumber as Integer)

        def screenClosure
        screenClosure =
            [bus : { b ->
                // In case the user specifies the pin, we deallocate the pin auto allocated before
                PinAllocator.instance().deallocateBusPin(screenName, pinNumber)

                // Then we allocate the pin specified by the user
                PinAllocator.instance().allocateBusPin(screenName, b)
                ((DSLBinding) this.getBinding()).getModel().createScreen(screenName, b as Integer)

                return screenClosure
            },
             size: { s ->
                 ((DSLBinding) this.getBinding()).getModel().setScreenSize(screenName, s)
                 return screenClosure
             }]

        return screenClosure
    }

    def state(String name) {
        List<Action> actions = new ArrayList<>();
        ((DSLBinding) this.getBinding()).getModel().createState(name, actions)

        def closure
        closure = { analogBrick ->
            [turn : { signal ->
                ActuatorAction action = new ActuatorAction()
                action.setActuator(((DSLBinding) this.getBinding()).getModel().getActuator(analogBrick))
                action.setValue(signal)
                actions.add(action)
                [and: closure]
            },
            display : { content ->
                Screen screen = ((DSLBinding) this.getBinding()).getModel().getScreen(analogBrick)
                ScreenValidator.instance().verifyScreenContent(screen, content)
                ScreenAction action = new ScreenAction()
                action.setScreen(screen)
                action.setContent(content)
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
        boolean isFirst = true;
        TransitionFirst transitionFirst = new TransitionFirst()
        List<TransitionCondition> transitionConditions = new ArrayList<>();

        def conditionClosure

        def handleAnd = { nextSensorName ->
            isFirst = false;
            TransitionCondition transitionCondition = new TransitionCondition()
            transitionCondition.setLogicalCondition(LogicalOperator.AND)
            transitionConditions.add(transitionCondition)
            conditionClosure(nextSensorName) // Return to conditionClosure for chaining
        }

        def handleOr = { nextSensorName ->
            isFirst = false;
            TransitionCondition transitionCondition = new TransitionCondition()
            transitionCondition.setLogicalCondition(LogicalOperator.OR)
            transitionConditions.add(transitionCondition)
            conditionClosure(nextSensorName) // Return to conditionClosure for chaining
        }

        def handleFirst = { destinationState, nextSensorName ->
            isFirst = true;
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

                    if (isFirst) {
                        transitionFirst = new TransitionFirst()
                        transitionFirst.setSensor(sensor)
                        transitionFirst.setValue(signal)
                    }
                    else {
                        TransitionCondition transitionCondition = new TransitionCondition()
                        transitionCondition.setSensor(sensor)
                        transitionCondition.setValue(signal)
                        LogicalOperator logicalOperator = LogicalOperator.NONE
                        transitionCondition.setLogicalCondition(logicalOperator)
                        transitionConditions.add(transitionCondition)
                    }

                    ((DSLBinding) this.getBinding()).getModel().createTransition(state1, state2, transitionFirst, transitionConditions)


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