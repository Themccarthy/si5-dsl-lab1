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
            accept('error', 'Le texte a afficher sur l ecran ne doit pas dépasser '+size+' caractères.', { node: screenAction, property: 'value' });
        }
    }

    pins: Map<SimplePin, Brick | undefined> = new Map();
    correctBus: Map<SimpleBus, Brick | undefined> = new Map();


    checkApp(app: App, accept: ValidationAcceptor): void {
        let numberPins;
            if(app.pins!== undefined && app.pins.length>0){
                numberPins = app.pins.length;
            }else{
                numberPins = availableDigitalPins.length;
            }
        if (app.bricks.filter(brick=> isActuator(brick) || isSensor(brick)).length > numberPins) {
            accept('error', 'Pas assez de pin disponible pour toutes les briques digitales crées, vous disposez de '+app.bricks.filter(brick=> isActuator(brick) || isSensor(brick)).length+' briques digitales dans votre systeme or vous n avez que '+numberPins+' pins disponibles pour les briques digitales', { node: app, property: 'bricks' });
        }

        let numberBus;
        if(app.bus!== undefined && app.bus.length>0){
            numberBus = app.bus.length;
        }else{
            numberBus = availableBus.length;
        }
        if (app.bricks.filter(brick=> isScreen(brick)).length > numberBus) {
            accept('error','Pas assez de pin disponible pour toutes les ecrans crées, vous disposez de '+app.bricks.filter(brick=> isScreen(brick)).length+' ecran dans votre systeme or vous n avez que '+numberBus+' bus disponible pour les ecran', { node: app, property: 'bricks' });
        }
    }

    checkPins(pin: Pin, accept: ValidationAcceptor): void {
        // Check if pin number is not already used
        let pinNumbers = Array.from(this.pins.keys()).map(item => item.pin.toString());
        if (pinNumbers.includes(pin.pin!.toString())) accept('error', 'Pin number already used.', { node: pin, property: 'pin' });

        // Check if pin name is not already used
        let pinNames = Array.from(this.pins.keys()).map(item => item.name);
        if (pinNames.includes(pin.name!)) accept('error', 'Pin name already used.', { node: pin, property: 'name' });

        // If all checks passed, add pin to the list
        this.pins.set(new SimplePin(pin.pin!.toString(), pin.name!, pin.type!.value), undefined);
    }

    checkBus(bus: Bus, accept: ValidationAcceptor): void {
        // Check if bus number is not already used
        let busNumbers = Array.from(this.correctBus.keys()).map(item => item.number.toString());
        if (busNumbers.includes(bus.number!.toString())) accept('error', 'Bus number already used.', { node: bus, property: 'number' });

        // Check bus pins 
        if (bus.pins.length!=7) accept('error', 'Les bus doivent posséder 7 pins', { node: bus, property: 'pins' });

        // If all checks passed, add pin to the list
        this.correctBus.set(new SimpleBus(bus.pins, bus.number!), undefined);
    }



    checkBricks(brick: Brick, accept: ValidationAcceptor): void {
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
                    if (pinNumbers.length !== 0 && !pinNumbers.includes(brick.pin.toString())) accept('error', 'Brick pin is not defined.', { node: brick, property: 'pin' });
                }
                
                // Check if brick pin is unique
                if (!hasCurrentBrick && allPinsDefined.some(item => brick.pin && item[0].pin === brick.pin.toString())) 
                    accept('error', 'Brick pin already used.', { node: brick, property: 'pin' });
    
                // Check if brick pin type is correct
                let currentPin = Array.from(this.pins.keys()).find(item =>  brick.pin && item.pin === brick.pin.toString());
                if (currentPin !== undefined && 
                    ((isSensor(brick)  && 
                    (currentPin.type !== 'DIGITAL_INPUT' && currentPin.type !== 'DIGITAL_OUTPUT'))||
                    ( isActuator(brick) && 
                    (currentPin.type !== 'DIGITAL_INPUT' && currentPin.type !== 'DIGITAL_OUTPUT')))) {
                    accept('error', 'Brick is assigned to wrong Pin (invalid type)', { node: brick, property: 'pin' });
                }
                // If all checks passed, add brick to the pin map
                this.pins.set(currentPin!, brick);
    
            }else if(isScreen(brick)){
                 // Define which list to use
                 if (this.correctBus.size === 0) {
                    availableBus.map(subArray => 
                        subArray.map(str => parseInt(str))
                    ).forEach(item => this.correctBus.set(new SimpleBus(item,availableBus.indexOf(item.map(pin => pin.toString()))+1), undefined));
                }

    
                // Check if too many bricks are defined
                let allBusDefined = Array.from(this.correctBus.entries()).filter(item => item[1] !== undefined);
                let hasCurrentBrick = Array.from(this.correctBus.values()).some(item => item?.name === brick.name);      
           
                // Check if brick pin is correct
                if(!brick.bus === undefined){
                    let busNumbers = Array.from(this.correctBus.keys()).map(item => item.number);
                    if (busNumbers.length !== 0 && busNumbers.filter(number => number <= this.correctBus.values.length).length > 0 ) accept('error', 'Brick bus is not defined.', { node: brick, property: 'bus' });
                }   
                // Check if brick pin is unique
                if (!hasCurrentBrick && allBusDefined.some(item => brick.bus && item[0].number === brick.bus)) 
                    accept('error', 'Brick bus already used.', { node: brick, property: 'bus' });
    
    
                // Check if brick pin type is correct
                let currentBus = Array.from(this.correctBus.keys()).find(item =>  brick.bus && item.number === brick.bus);
                
                // If all checks passed, add brick to the pin map
                this.correctBus.set(currentBus!, brick);
            }
        }
        
    }


}
