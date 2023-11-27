
import * as fs from 'node:fs';
import { CompositeGeneratorNode, toString, NL } from 'langium';
import * as path from 'node:path';
import { extractDestinationAndName } from './cli-util.js';
import { App, State, Action, Transition, Actuator, Sensor, isSensor, isActuator} from '../language/generated/ast.js';
import { integer } from 'vscode-languageserver';

let availableActuatorPins = [23,24,25,26,27,28];
let availableSensorPins = [2,3,4,5,6,11,12,13,14,15,16,17,18,19];

export function generateInoFile(app: App, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.ino`;

    const fileNode = new CompositeGeneratorNode();
    compile(app,fileNode)
    
    
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}

function compile(app:App, fileNode:CompositeGeneratorNode){
    allocatePins(app,availableActuatorPins.length, availableSensorPins.length);
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
        if (isActuator(brick)){
            compileActuator(brick,fileNode);
		}else if(isSensor(brick)){
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

    function allocatePins(app: App, actuatorsSize: integer, sensorsSize : integer) {
        app.bricks.forEach(brick => {
            if (brick.pin !== undefined) {
                if(availableActuatorPins.includes(brick.pin)){
                    if (isActuator(brick)) {
                        useActuatorPin(brick.pin);
                    }else if(isSensor(brick)){
                        useSensorPin(brick.pin);
                    }
                }else{
                    reportWarning("le pin "+ brick.pin+' n a pas pu etre assigné a la brique '+brick.name+' un pin lui a alors été assigné par defaut a un pin disponible')
                    brick.pin = undefined;
                }
            }
        
        });
        app.bricks.forEach(brick => {
            if (brick.pin === undefined) {
                if (isActuator(brick)) {
                    if (availableActuatorPins.length === 0) {
                        reportError('Pas assez de pin disponible pour toutes les actuators crées, vous disposez de '+app.bricks.filter(brick => isActuator(brick)).length+' actuator dans votre systeme or vous n avez que '+actuatorsSize+' pin disponible pour les actuator')
                        throw new Error("Erreur : Plus de pins disponibles pour les actuators.");
                    }
                    // Attribuer un pin disponible pour l'actuator
                    brick.pin = availableActuatorPins.shift();
                }else if(isSensor(brick)){
                    if (availableSensorPins.length === 0) {
                        reportError('Pas assez de pin disponible pour toutes les sensors crées, vous disposez de '+app.bricks.filter(brick => isSensor(brick)).length+' actuator dans votre systeme or vous n avez que '+sensorsSize+' pin disponible pour les actuator')
                        throw new Error("Erreur : Plus de pins disponibles pour les sensors.");
                    }
                    // Attribuer un pin disponible pour le sensor
                    brick.pin = availableSensorPins.shift();
                }
              
            }
        });
    }

    function useActuatorPin(pinValue: integer) {
        let index = availableActuatorPins.indexOf(pinValue);
        if (index !== -1) {
            availableActuatorPins.splice(index, 1);
        }
    }

    function useSensorPin(pinValue: integer) {
        let index = availableSensorPins.indexOf(pinValue);
        if (index !== -1) {
            availableSensorPins.splice(index, 1);
        }
    }

    function reportError(errorMessage: string, logFilePath: string = 'error.log'): void {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} - Error: ${errorMessage}\n`;
    
        fs.appendFileSync(logFilePath, logMessage, 'utf8');
    }

    function reportWarning(errorMessage: string, logFilePath: string = 'error.log'): void {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} - Warning: ${errorMessage}\n`;
    
        fs.appendFileSync(logFilePath, logMessage, 'utf8');
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
		pinMode(`+actuator.pin+`, OUTPUT); // `+actuator.name+` [Actuator]`)
    }

	function compileSensor(sensor:Sensor, fileNode: CompositeGeneratorNode) {
    	fileNode.append(`
		pinMode(`+sensor.pin+`, INPUT); // `+sensor.name+` [Sensor]`)
	}
	

	function compileAction(action: Action, fileNode:CompositeGeneratorNode) {
		fileNode.append(`
					digitalWrite(`+action.actuator.ref?.pin+`,`+action.value.value+`);`)
	}

	function compileTransition(transition: Transition, fileNode:CompositeGeneratorNode) {
		fileNode.append(`
		 			`+transition.sensor.ref?.name+`BounceGuard = millis() - `+transition.sensor.ref?.name+`LastDebounceTime > debounce;
					if( digitalRead(`+transition.sensor.ref?.pin+`) == `+transition.value.value+` && `+transition.sensor.ref?.name+`BounceGuard) {
						`+transition.sensor.ref?.name+`LastDebounceTime = millis();
						currentState = `+transition.next.ref?.name+`;
					}
		`)
	}