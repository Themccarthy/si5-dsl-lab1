
import * as fs from 'node:fs';
import { CompositeGeneratorNode, toString, NL } from 'langium';
import * as path from 'node:path';
import { extractDestinationAndName } from './cli-util.js';
import { App, State, Action, Transition, Actuator, Sensor, isSensor, isActuator} from '../language/generated/ast.js';
import { integer } from 'vscode-languageserver';

let availablePins = [8,9,10,11,12];

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
    reportInfo("Pin disponibles pour les brique:"+ availablePins)
    allocatePins(app,availablePins.length);
    fileNode.append(
	`
//Wiring code generated from an ArduinoML model
// Application name: `+app.name+`

long debounce = 200;
enum STATE {`+app.states.map(s => s.name).join(', ')+`};

STATE currentState = `+app.initial.ref?.name+`;`
    ,NL);
	
    for(const brick of app.bricks){
        if (isSensor(brick)){
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

    function allocatePins(app: App, pinSize: integer) {
        app.bricks.forEach(brick => {
            if (brick.pin !== undefined) {
                if(availablePins.includes(brick.pin)){
                    usePin(brick.pin);
                    reportInfo("La brique "+brick.name+' a bien été lié au pin '+brick.pin+ " comme demandé par l'utilisateur")
                }else{
                    reportWarning("Le pin "+ brick.pin+' n a pas pu etre assigné a la brique '+brick.name+' un pin lui a alors été assigné par defaut a un pin disponible')
                    brick.pin = undefined;
                }
            }
        
        });
        app.bricks.forEach(brick => {
            if (brick.pin === undefined) {
                if (availablePins.length === 0) {
                    reportError('Pas assez de pin disponible pour toutes les brique crées, vous disposez de '+app.bricks.length+' briques dans votre systeme or vous n avez que '+pinSize+' pin disponible pour les actuator')
                    throw new Error("Erreur : Plus de pins disponibles pour les sensors.");
                }
                // Attribuer un pin disponible pour le sensor
                let pinNumber = availablePins.shift();
                brick.pin = pinNumber;
                reportInfo("La brique "+brick.name+' a été lié dynamiquement au pin '+pinNumber)
            }
              
            
        });
    }

    function usePin(pinValue: integer) {
        let index = availablePins.indexOf(pinValue);
        if (index !== -1) {
            availablePins.splice(index, 1);
        }
    }

    function reportError(errorMessage: string, logFilePath: string = 'aml.log'): void {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} - Error: ${errorMessage}\n`;
    
        fs.appendFileSync(logFilePath, logMessage, 'utf8');
    }

    function reportInfo(message: string, logFilePath: string = 'aml.log'): void {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} - Info: ${message}\n`;
    
        fs.appendFileSync(logFilePath, logMessage, 'utf8');
    }

    function reportWarning(message: string, logFilePath: string = 'aml.log'): void {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} - Warning: ${message}\n`;
    
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
    /*

	function compileTransition(transition: Transition, fileNode:CompositeGeneratorNode) {
		fileNode.append(`
		 			`+transition.sensors.ref?.name+`BounceGuard = millis() - `+transition.sensor.ref?.name+`LastDebounceTime > debounce;
					if( digitalRead(`+transition.sensor.ref?.pin+`) == `+transition.value.value+` && `+transition.sensor.ref?.name+`BounceGuard) {
						`+transition.sensor.ref?.name+`LastDebounceTime = millis();
						currentState = `+transition.next.ref?.name+`;
					}
		`)
	}
    */   


    function compileTransition(transition: Transition, fileNode:CompositeGeneratorNode) {
        fileNode.append(`
		 			`+transition.sensorCondition1.sensor.ref?.name+`BounceGuard = millis() - `+transition.sensorCondition1.sensor.ref?.name+`LastDebounceTime > debounce;`);
        let ifCase : string='';
        ifCase += `digitalRead(${transition.sensorCondition1.sensor.ref?.pin}) == ${transition.sensorCondition1.value.value}`;
        transition.sensorConditions.forEach((condition) => {
            ifCase += ` ${condition.logicalOperator.value} `;
            ifCase += `digitalRead(${condition.sensor.ref?.pin}) == ${condition.value.value} `;
        
        });
        fileNode.append(`
                    if( ${ifCase} && `+transition.sensorCondition1.sensor.ref?.name+`BounceGuard) {
                        `+transition.sensorCondition1.sensor.ref?.name+`LastDebounceTime = millis();
                        currentState = `+transition.next.ref?.name+`;
                    }
        `)
    
    // ajouter un validateur pour pas mettre le meme bouton dans une condition
		
    }   