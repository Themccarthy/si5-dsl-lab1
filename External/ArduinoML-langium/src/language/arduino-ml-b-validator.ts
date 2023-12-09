import type { ValidationChecks, ValidationAcceptor } from 'langium';
import type { ArduinoMlBServices } from './arduino-ml-b-module.js';
import { ArduinoMlBAstType, ScreenAction, Pin, App,Brick, isSensor, isActuator,Bus, isScreen, isApp } from './generated/ast.js';
import { availableDigitalPins, availableAnalogPins, availableBus } from '../cli/generator.js';
import { integer } from 'vscode-languageserver';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ArduinoMlBServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ArduinoMlBValidator;
    const checks: ValidationChecks<ArduinoMlBAstType> = {
        ScreenAction: validator.checkScreenActionLength,
        Pin: validator.checkPins,
        Bus: validator.checkBus,
        Brick: validator.checkBricks,
        App: validator.checkApp,
    
    };
    registry.register(checks, validator);
}

class SimplePin {
    pin: string;
    name: string;
    type: string;

    constructor(pin: string, name: string, type: string) {
        this.pin = pin;
        this.name = name;
        this.type = type;
    }
}

class SimpleBus {
    pins: number[];
    number: integer;

    constructor(pins: number[], number: integer) {
        this.pins = pins;
        this.number = number;
    }
}

/**
 * Implementation of custom validations.
 */
export class ArduinoMlBValidator {

    checkScreenActionLength(screenAction: ScreenAction, accept: ValidationAcceptor): void {
        let size = 16;
        if(screenAction.screen.ref?.size){
            size = screenAction.screen.ref?.size;
        }
        if (screenAction.value && screenAction.value.length > size) {
            accept('error', 'Le texte à afficher sur l\'écran ne doit pas dépasser ' + size + ' caractères.', { node: screenAction, property: 'value' });
        }
    }

    pins: Map<SimplePin, Brick | undefined> = new Map();
    correctBus: Map<SimpleBus, Brick | undefined> = new Map();


    checkApp(app: App, accept: ValidationAcceptor): void {
        let numberPins;
            if(app.pins!== undefined && app.pins.length>0){
                numberPins = app.pins.filter(pin => pin.type?.value=='DIGITAL_INPUT' || pin.type?.value=='DIGITAL_OUTPUT').length;
            }else{
                numberPins = availableDigitalPins.length;
            }
        if (app.bricks.filter(brick=> isActuator(brick) || isSensor(brick)).length > numberPins) {
            accept('error', 'Pas assez de pins disponibles pour toutes les briques digitales crées, vous disposez de ' + app.bricks.filter(brick=> isActuator(brick) || isSensor(brick)).length + ' briques digitales dans votre système. Or vous n\'avez que ' + numberPins + ' pins disponibles pour les briques digitales', { node: app, property: 'bricks' });
        }

        let pinsNumberUsed :integer[] =[] ;
        for( const brick of app.bricks){
            if((isActuator(brick) || isSensor(brick))  && brick.pin!==undefined){
                pinsNumberUsed.push(brick.pin)
            }
        }      

        let numberBus;
        if(app.bus!== undefined && app.bus.length>0){
            numberBus = app.bus.length;
        }else{
            numberBus = availableBus.length;
        }
        if (app.bricks.filter(brick=> isScreen(brick)).length > numberBus) {
            accept('error','Pas assez de pins disponibles pour tous les écrans crées, vous disposez de ' + app.bricks.filter(brick=> isScreen(brick)).length + ' écran(s) dans votre système. Or vous n\'avez que ' + numberBus + ' bus disponible(s) pour les écrans', { node: app, property: 'bricks' });
        }

        let bus : integer[]
        if(app.bus!== undefined && app.bus.length>0){
            bus = app.bus.map(b => b.number);
        }else{
            bus = [1,2,3];
        }



        app.bricks.forEach( screen => {
            if ( isScreen(screen) &&  screen.bus!=undefined && !bus.includes(screen.bus) ) {
                accept('error', 'Le bus ' + screen.bus + ' n\'existe pas', { node: screen, property: 'bus' });
            }
        })

        const compteur: { [key: number]: number } = {};
        for (const screen of app.bricks) {
            if(isScreen(screen) && screen.bus!==undefined){
                let pinsUsedNumberBus : number[] =[]
                if(app.bus!==undefined && app.bus.length > 0 && bus.includes(screen.bus)){
                    let pinsUsedNumberBusDoubleTab = app.bus.filter(b => b.number!==undefined && b.number == screen.bus).map(b => b.pins)
                    pinsUsedNumberBus = pinsUsedNumberBusDoubleTab.reduce((acc, currentArray) => acc.concat(currentArray), []);
                }else if(bus.includes(screen.bus)){
                    pinsUsedNumberBus = availableBus[screen.bus-1].map(pin => Number(pin))
                }
                const pinsCommun = pinsUsedNumberBus.find(element => pinsNumberUsed.includes(element));
                if(pinsCommun!==undefined){
                    accept('error', 'Le pin ' + pinsCommun + ' est utliisé dans le bus ' + screen.bus + ' est utilisé dans une autre brique', { node: screen, property: 'bus' });
                }
            }
            if ( isScreen(screen) && screen.bus!==undefined && compteur[screen.bus]) {
                compteur[screen.bus]++;
                if (compteur[screen.bus] > 1) {
                    accept('error', 'Le bus est déjà utilisé par une autre brique', { node: screen, property: 'bus' });
                }
            } else if(isScreen(screen) && screen.bus!==undefined){
                compteur[screen.bus] = 1;
            }
        }



        this.pins.clear();
        this.correctBus.clear();
    }

    checkPins(pin: Pin, accept: ValidationAcceptor): void {
        // Check if pin number is not already used
        let pinNumbers = Array.from(this.pins.keys()).map(item => item.pin.toString());
        if (pinNumbers.includes(pin.pin!.toString())) accept('error', 'Ce numéro de pin est déjà utilisé par un autre pin', { node: pin, property: 'pin' });

        // Check if pin name is not already used
        let pinNames = Array.from(this.pins.keys()).map(item => item.name);
        if (pinNames.includes(pin.name!)) accept('error', 'Ce nom de pin est deja utilisé par un autre pin', { node: pin, property: 'name' });

        // If all checks passed, add pin to the list
        this.pins.set(new SimplePin(pin.pin!.toString(), pin.name!, pin.type!.value), undefined);
    }

    checkBus(bus: Bus, accept: ValidationAcceptor): void {
        // Check if bus number is not already used
        let busNumbers = Array.from(this.correctBus.keys()).map(item => item.number.toString());
        if (busNumbers.includes(bus.number!.toString())) accept('error', 'Ce numéro de bus est deja utilisé par un autre bus', { node: bus, property: 'number' });

        // Check bus pins 
        if (bus.pins.length!=7) accept('error', 'Les bus doivent posséder 7 pins', { node: bus, property: 'pins' });

        // If all checks passed, add pin to the list
        this.correctBus.set(new SimpleBus(bus.pins, bus.number!), undefined);
    }



    checkBricks(brick: Brick, accept: ValidationAcceptor): void {
        let error = false;
        let app;
        let current = brick.$container;
        if (isApp(current)) {
            app = current;
        }
        if(app!=undefined){
            if(isSensor(brick) || isActuator(brick)){
                // Define which list to use
                if (this.pins.size === 0) {
                    availableDigitalPins.forEach(item => this.pins.set(new SimplePin(item, `digital_${item}`, 'DIGITAL_INPUT'), undefined));
                    availableAnalogPins.forEach(item => this.pins.set(new SimplePin(item, `analog_${item}`, 'ANALOG_INPUT'), undefined));
                }

                // Check if too many bricks are defined
                let allPinsDefined = Array.from(this.pins.entries()).filter(item => item[1] !== undefined);
                let hasCurrentBrick = Array.from(this.pins.values()).some(item => item?.name === brick.name);
              
                // Check if brick bus is correct
                if(brick.pin !== undefined){
                    let pinNumbers = Array.from(this.pins.keys()).map(item => item.pin);
                    if (pinNumbers.length !== 0 && !pinNumbers.includes(brick.pin.toString())) {
                        error =true;
                        accept('error', 'Le pin '+ brick.pin +' n\'existe pas', { node: brick, property: 'pin' });
                    }
                }
                
                // Check if brick pin is unique
                if (brick.pin !== undefined && !hasCurrentBrick && allPinsDefined.some(item => brick.pin && item[0].pin === brick.pin.toString())){
                    error =true;
                    accept('error', 'Le pin est déjà utlisé par une autre brique', { node: brick, property: 'pin' });
                }
                // Check if brick pin type is correct
                if(brick.pin !== undefined){
                    let currentPin = Array.from(this.pins.keys()).find(item =>  brick.pin && item.pin === brick.pin.toString());
                    if (currentPin !== undefined && 
                        ((isSensor(brick)  && 
                        (currentPin.type !== 'DIGITAL_INPUT' && currentPin.type !== 'DIGITAL_OUTPUT'))||
                        ( isActuator(brick) && 
                        (currentPin.type !== 'DIGITAL_INPUT' && currentPin.type !== 'DIGITAL_OUTPUT')))) {
                        error =true;
                        accept('error', 'La brique est assignée au mauvais type de pin (type invalide)', { node: brick, property: 'pin' });
                    }
                if(error == false){
                    this.pins.set(currentPin!, brick);
                }
                }
            }
        }
        
    }


}
