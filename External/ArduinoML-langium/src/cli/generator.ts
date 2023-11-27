
import * as fs from 'node:fs';
import { CompositeGeneratorNode, toString, NL } from 'langium';
import * as path from 'node:path';
import { extractDestinationAndName } from './cli-util.js';
import { App, State, Action, Transition, Actuator, Sensor} from '../language/generated/ast.js';


export function generateInoFile(app: App, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.ino`;

    const fileNode = new CompositeGeneratorNode();
    console.log("before compile")
    compile(app,fileNode)
    console.log("after compile")
    
    
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}

function compile(app:App, fileNode:CompositeGeneratorNode){
    console.log(" compile")
    fileNode.append(
	`
//Wiring code generated from an ArduinoML model
// Application name: `+app.name+`

long debounce = 200;
enum STATE {`+app.states.map(s => s.name).join(', ')+`};

STATE currentState = `+app.initial.ref?.name+`;`
    ,NL);
	
    for(const brick of app.bricks){
        if ("inputPin" in brick){
            fileNode.append(`
bool `+brick.name+`BounceGuard = false;
long `+brick.name+`LastDebounceTime = 0;

            `,NL);
        }
    }
    
    fileNode.append(`
	void setup(){`);
    for(const brick of app.bricks){
        if ("outputPin" in brick){
            compileActuator(brick,fileNode);
		}else if("inputPin" in brick){
            compileSensor(brick,fileNode);
        }
	}
    


    fileNode.append(`
	}
	void loop() {
			switch(currentState){`,NL)
			for(const state of app.states){
				compileState(state, fileNode)
            }
            
	fileNode.append(`
		}
	}
	`,NL);




    }


    function compileState(state: State, fileNode: CompositeGeneratorNode) {
        fileNode.append(`
				case `+state.name+`:`)
		for(const action of state.actions){
			compileAction(action, fileNode)
		}
		if (state.transition !== null){
			compileTransition(state.transition, fileNode)
		}
		fileNode.append(`
				break;`)
    }

    
	function compileActuator(actuator: Actuator, fileNode: CompositeGeneratorNode) {
        fileNode.append(`
		pinMode(`+actuator.outputPin+`, OUTPUT); // `+actuator.name+` [Actuator]`)
    }

	function compileSensor(sensor:Sensor, fileNode: CompositeGeneratorNode) {
    	fileNode.append(`
		pinMode(`+sensor.inputPin+`, INPUT); // `+sensor.name+` [Sensor]`)
	}
	

	function compileAction(action: Action, fileNode:CompositeGeneratorNode) {
		fileNode.append(`
					digitalWrite(`+action.actuator.ref?.outputPin+`,`+action.value.value+`);`)
	}

	function compileTransition(transition: Transition, fileNode:CompositeGeneratorNode) {
		fileNode.append(`
		 			`+transition.sensor.ref?.name+`BounceGuard = millis() - `+transition.sensor.ref?.name+`LastDebounceTime > debounce;
					if( digitalRead(`+transition.sensor.ref?.inputPin+`) == `+transition.value.value+` && `+transition.sensor.ref?.name+`BounceGuard) {
						`+transition.sensor.ref?.name+`LastDebounceTime = millis();
						currentState = `+transition.next.ref?.name+`;
					}
		`)
	}