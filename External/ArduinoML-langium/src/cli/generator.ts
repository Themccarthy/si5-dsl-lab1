
import * as fs from 'node:fs';
import { CompositeGeneratorNode, toString, NL } from 'langium';
import * as path from 'node:path';
import { extractDestinationAndName } from './cli-util.js';
import { App, State, Transition, Actuator, Sensor, isSensor, isActuator, isScreenAction, isActuatorAction, ActuatorAction, ScreenAction, isScreen, Screen} from '../language/generated/ast.js';
import { integer } from 'vscode-languageserver';

export let availableDigitalPins = ['8','9','10','11','12'];
export let availableAnalogPins = ['A0','A1','A2','A4','A5']
export let availableBus :string[][] = [['2', '3', '4', '5', '6', '7', '8'],['10','11','12','13','A0','A1','A2'],['10','11','12','13','A4','A5','1']]
export let allBus :string[][] = [['2', '3', '4', '5', '6', '7', '8'],['10','11','12','13','A0','A1','A2'],['10','11','12','13','A4','A5','1']]
let usedPins : string[] = []



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
    usedPins=[];
    [availableBus] = updateAvailableBus(app, availableBus);
    allBus = [...availableBus];
    [availableAnalogPins, availableDigitalPins] = updateAvailablePins(app, availableAnalogPins, availableDigitalPins);
    reportInfo("Pin disponibles pour les briques digital : "+ availableDigitalPins)
    reportInfo("Pin disponibles pour les briques analog : "+ availableAnalogPins)
    reportInfo("Bus disponibles pour les ecrans : "+ availableBus)
    allocatePins(app,availableDigitalPins.length, availableBus.length);
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
        if (isScreen(brick) && brick.bus!=undefined){
            busPins = allBus[brick.bus]
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


     function updateAvailablePins(app: App, analogs: string[], digitals : string[]) {
        if (app.pins.length === 0) return [analogs, digitals];

        analogs = [];
        digitals = [];

        app.pins.forEach(pin => {
            if (pin.pin && (pin.type?.value === 'ANALOG_INPUT' || pin.type?.value === 'ANALOG_OUTPUT')) {
                analogs.push(pin.pin?.toString());
            } else if (pin.pin && (pin.type?.value === 'DIGITAL_INPUT' || pin.type?.value === 'DIGITAL_OUTPUT')) {
                digitals.push(pin.pin?.toString());
            }
        });
        return [analogs, digitals];
    }

    function updateAvailableBus(app: App,  bus: string[][]) {
        if (app.bus.length === 0) return [bus];
        bus = [];
        app.bus.forEach(item => {
            bus.push(item.pins.map(pin => pin.toString()))
        });
        return [bus];
    }

    function allocatePins(app: App, pinSize: integer, busSize : integer) {
        app.bricks.forEach(brick => {
            if(isActuator(brick) || isSensor(brick)){
                if (brick.pin ) {
                    if(availableDigitalPins.includes(brick.pin?.toString())){
                        usePin(brick.pin?.toString());
                        reportInfo("La brique "+brick.name+' a bien été lié au pin '+brick.pin+ " comme demandé par l'utilisateur")
                    }else{
                        reportWarning("Le pin "+ brick.pin+' n a pas pu etre assigné a la brique '+brick.name+' un pin lui a alors été assigné par defaut a un pin disponible')
                        brick.pin = undefined;
                    }
                }
            }else if(isScreen(brick)){
                if (brick.bus !== undefined) {
                    brick.bus = Number(brick.bus) -1 
                    if(availableBus[brick.bus].length > 0){
                        useBus(brick.bus);
                        reportInfo("La brique "+brick.name+' a bien été lié au bus '+Number(brick.bus+1)+ " qui posséde les pins :"+allBus[brick.bus]+ " comme demandé par l'utilisateur")
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
                    if (availableDigitalPins.length === 0) {
                        reportError('Pas assez de pin disponible pour toutes les briques digitales crées, vous disposez de '+app.bricks.filter(brick=> isActuator(brick) || isSensor(brick)).length+' briques digitales dans votre systeme or vous n avez que '+pinSize+' pin disponible pour les briques digitales')
                        throw new Error("Erreur : Plus de pins disponibles pour les brique numérique.");
                    }
                    // Attribuer un pin disponible pour le sensor
                    let available = availableDigitalPins.filter(pin => !usedPins.includes(pin))
                    if(available.length > 0){
                        let pinNumber = available[0];
                        if(pinNumber != undefined){
                            brick.pin = Number(pinNumber);
                            usePin(pinNumber?.toString())
                            reportInfo("La brique "+brick.name+' a été lié dynamiquement au pin digital '+pinNumber)
                        }
                    }else{
                        reportError('Il n y a plus de pin disponible pour utiliser un pin')
                        throw new Error("Il n y a plus de pin disponible pour utiliser un pin");
                    }
                }
            }else if(isScreen(brick)){
                if (brick.bus === undefined) {
                    if (availableBus.length === 0) {
                        reportError('Pas assez de pin disponible pour toutes les ecrans crées, vous disposez de '+app.bricks.filter(brick=> isScreen(brick)).length+' ecran dans votre systeme or vous n avez que '+busSize+' bus disponible pour les ecran')
                        throw new Error("Erreur : Plus de pins disponibles pour les ecran.");
                    }
         
                    // Attribuer un pin disponible pour le screen
                    let available = availableBus.filter(bus => bus.length>0 && bus.every(pin => !usedPins.includes(pin)));
                    if(available.length > 0){
                        let busNumber = availableBus.indexOf(available[0]);
                        if(busNumber != undefined){
                            brick.bus = Number(busNumber);
                            useBus(busNumber)
                            reportInfo("La brique "+brick.name+' a été lié dynamiquement au bus '+Number(busNumber+1)+ " qui posséde les pins :"+allBus[brick.bus])
                        }
                    }else{
                        reportError('Il n y a plus de pin disponible pour utiliser un bus')
                        throw new Error("Il n y a plus de pin disponible pour utiliser un bus");
                    }
                }
            }
        });
    }

    function usePin(pinValue: string) {
        usedPins.push(pinValue)
        let index = availableDigitalPins.indexOf(pinValue);
        if (index !== -1) {
            availableDigitalPins.splice(index, 1);
        }
    }

    function useBus(busNumber: integer) {
        availableBus[busNumber].forEach(pins => {
            usedPins.push(pins)
        })
        availableBus[busNumber] = [];
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
                    if (!${transition.transitionFirst.sensor.ref?.name}BounceGuard) {
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
		 			`+transition.transitionFirst.sensor.ref?.name+`BounceGuard = millis() - `+transition.transitionFirst.sensor.ref?.name+`LastDebounceTime > debounce;`);
        let ifCase : string='';
        ifCase += `digitalRead(${transition.transitionFirst.sensor.ref?.pin}) == ${transition.transitionFirst.value.value}`;
        transition.transitionCondition.forEach((condition) => {
            ifCase += ` ${condition.logicalOperator.value} `;
            ifCase += `digitalRead(${condition.sensor.ref?.pin}) == ${condition.value.value} `;
        
        });
        fileNode.append(`
                    if( ${ifCase} && `+transition.transitionFirst.sensor.ref?.name+`BounceGuard) {
                        `+transition.transitionFirst.sensor.ref?.name+`LastDebounceTime = millis();
                        currentState = `+transition.next.ref?.name+`;
                    }
        `)
    		
    }   