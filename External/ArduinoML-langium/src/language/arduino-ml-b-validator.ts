import type { ValidationChecks, ValidationAcceptor } from 'langium';
import type { ArduinoMlBServices } from './arduino-ml-b-module.js';
import { ArduinoMlBAstType, ScreenAction, Pin, App,Brick, isSensor, isActuator, } from './generated/ast.js';
import { availableDigitalPins, availableAnalogPins } from '../cli/generator.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ArduinoMlBServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ArduinoMlBValidator;
    const checks: ValidationChecks<ArduinoMlBAstType> = {
        ScreenAction: validator.checkScreenActionLength,
        App: validator.checkApp,
        Pin: validator.checkPins,
        Brick: validator.checkBricks
    
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

    checkApp(app: App, accept: ValidationAcceptor): void {
        // Reset pins map
        this.pins.clear();
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

    checkBricks(brick: Brick, accept: ValidationAcceptor): void {

        if(isSensor(brick) || isActuator(brick)){
            // Define which list to use
            if (this.pins.size === 0) {
                availableDigitalPins.forEach(item => this.pins.set(new SimplePin(item, `digital_${item}`, 'DIGITAL_INPUT'), undefined));
                availableAnalogPins.forEach(item => this.pins.set(new SimplePin(item, `analog_${item}`, 'ANALOG_INPUT'), undefined));
            }

            // Check if pin has changed to remove it from the map
            let currentBrick = Array.from(this.pins.entries()).find(item => item[1] === brick);

            if (currentBrick !== undefined && (brick.pin === undefined || currentBrick[0].pin !== brick.pin.toString()))
                this.pins.set(currentBrick[0], undefined);

            // If brick is not defined, do not check it
            if (brick.pin === undefined) return;

            // Check if too many bricks are defined
            let allPinsDefined = Array.from(this.pins.entries()).filter(item => item[1] !== undefined);
            let isAllDefined = allPinsDefined.length === this.pins.size;
            let hasCurrentBrick = Array.from(this.pins.values()).some(item => item?.name === brick.name);
            if (isAllDefined && !hasCurrentBrick) accept('error', 'Too many bricks defined.', { node: brick, property: 'pin' });

            // Check if brick pin is correct
            let pinNumbers = Array.from(this.pins.keys()).map(item => item.pin);
            if (pinNumbers.length !== 0 && !pinNumbers.includes(brick.pin.toString())) accept('error', 'Brick pin is not defined.', { node: brick, property: 'pin' });

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
        }
        
    }


}
