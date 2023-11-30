
import * as fs from 'node:fs';
import { CompositeGeneratorNode, toString, NL } from 'langium';
import * as path from 'node:path';
import { extractDestinationAndName } from './cli-util.js';
import { App, State, Transition, Actuator, Sensor, isSensor, isActuator, isScreenAction, isActuatorAction, ActuatorAction, ScreenAction, isScreen, Screen} from '../language/generated/ast.js';
import { integer } from 'vscode-languageserver';

let availablePins = [8,9,10,11,12];
let availableBus = [1,2,3]
let bus1Pin =[2, 3, 4, 5, 6, 7, 8]
let bus2Pin =[2, 3, 4, 5, 6, 7, 8]
let bus3Pin =[2, 3, 4, 5, 6, 7, 8]



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
    reportInfo("Pin disponibles pour les briques numériques:"+ availablePins)
    reportInfo("Bus disponibles pour les ecran:"+ availableBus)
    allocatePins(app,availablePins.length, availableBus.length);
    let containScreen = app.bricks.find(brick => isScreen(brick))
    let screenImport = "#include <LiquidCrystal.h>"
    fileNode.append(
	`
//Wiring code generated from an ArduinoML model
// Application name: `+app.name+`
${containScreen? screenImport :''}
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

    let busPins;
    
    for(const brick of app.bricks){
        if (isScreen(brick)){
            switch(brick.bus){
                case 1 : busPins = bus1Pin;
                        break;
                case 2 : busPins = bus2Pin
                        break;
                case 3 : busPins = bus3Pin
            }
            fileNode.append(`
LiquidCrystal `+brick.name+`(${busPins});
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
        }else if(isScreen(brick)){
            compileScreen(brick,fileNode);
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

    function allocatePins(app: App, pinSize: integer, busSize : integer) {
        app.bricks.forEach(brick => {
            if(isActuator(brick) || isSensor(brick)){
                if (brick.pin !== undefined) {
                    if(availablePins.includes(brick.pin)){
                        usePin(brick.pin);
                        reportInfo("La brique "+brick.name+' a bien été lié au pin '+brick.pin+ " comme demandé par l'utilisateur")
                    }else{
                        reportWarning("Le pin "+ brick.pin+' n a pas pu etre assigné a la brique '+brick.name+' un pin lui a alors été assigné par defaut a un pin disponible')
                        brick.pin = undefined;
                    }
                }
            }else if(isScreen(brick)){
                if (brick.bus !== undefined) {
                    if(availableBus.includes(brick.bus)){
                        useBus(brick.bus);
                        reportInfo("La brique "+brick.name+' a bien été lié au bus '+brick.bus+ " comme demandé par l'utilisateur")
                    }else{
                        reportWarning("Le pin "+ brick.bus+' n a pas pu etre assigné a la brique '+brick.name+' un pin lui a alors été assigné par defaut a un pin disponible')
                        brick.bus = undefined;
                    }
                }
            }
        });
        app.bricks.forEach(brick => {
            if(isActuator(brick) || isSensor(brick)){
                if (brick.pin === undefined) {
                    if (availablePins.length === 0) {
                        reportError('Pas assez de pin disponible pour toutes les brique numérique crées, vous disposez de '+app.bricks.filter(brick=> isActuator(brick) || isSensor(brick)).length+' briques numérique dans votre systeme or vous n avez que '+pinSize+' pin disponible pour les brique numérique')
                        throw new Error("Erreur : Plus de pins disponibles pour les brique numérique.");
                    }
                    // Attribuer un pin disponible pour le sensor
                    let pinNumber = availablePins.shift();
                    brick.pin = pinNumber;
                    reportInfo("La brique "+brick.name+' a été lié dynamiquement au pin '+pinNumber)
                }
            }else if(isScreen(brick)){
                if (brick.bus === undefined) {
                    if (availableBus.length === 0) {
                        reportError('Pas assez de pin disponible pour toutes les ecran crées, vous disposez de '+app.bricks.filter(brick=> isScreen(brick)).length+' ecran dans votre systeme or vous n avez que '+busSize+' bus disponible pour les ecran')
                        throw new Error("Erreur : Plus de pins disponibles pour les ecran.");
                    }
                    // Attribuer un pin disponible pour le sensor
                    let busNumber = availableBus.shift();
                    brick.bus = busNumber;
                    reportInfo("La brique "+brick.name+' a été lié dynamiquement au bus '+busNumber)
                }
            }
        });
    }

    function usePin(pinValue: integer) {
        let index = availablePins.indexOf(pinValue);
        if (index !== -1) {
            availablePins.splice(index, 1);
        }
    }

    function useBus(pinValue: integer) {
        let index = availableBus.indexOf(pinValue);
        if (index !== -1) {
            availableBus.splice(index, 1);
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
            if (state.transition !== null){
                compileAction(action,state.transition, fileNode)
            }
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

    function compileScreen(screen:Screen, fileNode: CompositeGeneratorNode) {
    	fileNode.append(`
		${screen.name}.begin(16,2); // `+screen.name+` [Screen]`)
	}
	
	function compileAction(action: ActuatorAction | ScreenAction,transition: Transition, fileNode:CompositeGeneratorNode) {
        if(isScreenAction(action) && action.screen.ref){
            fileNode.append(`
                    if (!${transition.sensorCondition1.sensor.ref?.name}BounceGuard) {
                        ${action.screen.ref.name}.clear();
                        ${action.screen.ref.name}.print("${action.value}"); 
                    }
            `)
        }else if(isActuatorAction(action) && action.actuator.ref){
            fileNode.append(`
                    digitalWrite(`+action.actuator.ref.pin+`,`+action.value.value+`);`)
        }
	}


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
    		
    }   