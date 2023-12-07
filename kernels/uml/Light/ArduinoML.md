classDiagram
direction LR
class Action
class Actuator
class ActuatorAction {
  - SIGNAL value
  - Actuator actuator
}
class App {
  - State initial
  - List~State~ states
  - List~Brick~ bricks
  - String name
}
class Brick {
  - String name
  - int pin
}
class LogicalOperator {
<<enumeration>>
  +  NONE
  +  OR
  - String operator
  +  AND
}
class NamedElement {
<<Interface>>

}
class Pin {
  - String name
  - String number
  - PinType pinType
}
class PinType {
<<enumeration>>
  - String title
  +  DIGITAL_OUTPUT
  +  ANALOG_INPUT
  +  ANALOG_OUTPUT
  +  DIGITAL_INPUT
}
class SIGNAL {
<<enumeration>>
  +  HIGH
  +  LOW
}
class Screen {
  - Integer rowLength
  - List~Integer~ busPins
  - Integer lineLength
}
class ScreenAction {
  - Screen screen
  - String content
}
class Sensor
class State {
  - String name
  - List~Action~ actions
  - Transition transition
}
class ToWiring {
  - String bounceGardName
}
class Transition {
  - List~TransitionCondition~ transitionConditions
  - State next
  - TransitionFirst transitionFirst
}
class TransitionCondition {
  - SIGNAL value
  - Sensor sensor
  - LogicalOperator logicalOperator
}
class TransitionFirst {
  - Sensor sensor
  - SIGNAL value
}
class Visitable {
<<Interface>>

}
class Visitor~T~ {
  # T result
  # Map~String, Object~ context
}

Action  ..>  Visitable 
Actuator  -->  Brick 
ActuatorAction  -->  Action 
ActuatorAction "1" *--> "actuator 1" Actuator 
ActuatorAction "1" *--> "value 1" SIGNAL 
App "1" *--> "bricks *" Brick 
App  ..>  NamedElement 
App "1" *--> "states *" State 
App  ..>  Visitable 
Brick  ..>  NamedElement 
Brick  ..>  Visitable 
Pin  ..>  NamedElement 
Pin "1" *--> "pinType 1" PinType 
Screen  -->  Brick 
ScreenAction  -->  Action 
ScreenAction "1" *--> "screen 1" Screen 
Sensor  -->  Brick 
State "1" *--> "actions *" Action 
State  ..>  NamedElement 
State "1" *--> "transition 1" Transition 
State  ..>  Visitable 
ToWiring  -->  Visitor~T~ 
Transition "1" *--> "next 1" State 
Transition "1" *--> "transitionConditions *" TransitionCondition 
Transition "1" *--> "transitionFirst 1" TransitionFirst 
Transition  ..>  Visitable 
TransitionCondition "1" *--> "logicalOperator 1" LogicalOperator 
TransitionCondition "1" *--> "value 1" SIGNAL 
TransitionCondition "1" *--> "sensor 1" Sensor 
TransitionFirst "1" *--> "value 1" SIGNAL 
TransitionFirst "1" *--> "sensor 1" Sensor 
