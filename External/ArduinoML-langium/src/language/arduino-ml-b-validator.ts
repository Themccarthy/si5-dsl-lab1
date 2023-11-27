import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { isSensor, type ArduinoMlBAstType, type Brick, Pin, type App, isActuator } from './generated/ast.js';
import type { ArduinoMlBServices } from './arduino-ml-b-module.js';
import { availableAnalogPins, availableDigitalPins } from '../cli/generator.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ArduinoMlBServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ArduinoMlBValidator;
    const checks: ValidationChecks<ArduinoMlBAstType> = {
        App: validator.checkApp,
        Pin: validator.checkPins,
        Brick: validator.checkBricks
    };
    registry.register(checks, validator);
}

class SimplePin {
    pin: number;
    name: string;
    type: string;

    constructor(pin: number, name: string, type: string) {
        this.pin = pin;
        this.name = name;
        this.type = type;
    }
}

/**
 * Implementation of custom validations.
 */
export class ArduinoMlBValidator {
    pins: Map<SimplePin, Brick | undefined> = new Map();

    checkApp(app: App, accept: ValidationAcceptor): void {
        // Reset pins map
        this.pins.clear();
    }

    checkPins(pin: Pin, accept: ValidationAcceptor): void {
        // Check if pin number is not already used
        let pinNumbers = Array.from(this.pins.keys()).map(item => item.pin);
        if (pinNumbers.includes(pin.pin!)) accept('error', 'Pin number already used.', { node: pin, property: 'pin' });

        // Check if pin name is not already used
        let pinNames = Array.from(this.pins.keys()).map(item => item.name);
        if (pinNames.includes(pin.name!)) accept('error', 'Pin name already used.', { node: pin, property: 'name' });

        // If all checks passed, add pin to the list
        this.pins.set(new SimplePin(pin.pin!, pin.name!, pin.type!.value), undefined);
    }

    checkBricks(brick: Brick, accept: ValidationAcceptor): void {
        // Define which list to use
        if (this.pins.size === 0) {
            availableAnalogPins.forEach(item => this.pins.set(new SimplePin(item, `analog_${item}`, 'ANALOG_INPUT'), undefined));
            availableDigitalPins.forEach(item => this.pins.set(new SimplePin(item, `digital_${item}`, 'DIGITAL_INPUT'), undefined));
        }

        // Check if pin has changed to remove it from the map
        let currentBrick = Array.from(this.pins.entries()).find(item => item[1] === brick);

        if (currentBrick !== undefined && (brick.pin === undefined || currentBrick[0].pin !== brick.pin))
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
        if (pinNumbers.length !== 0 && !pinNumbers.includes(brick.pin)) accept('error', 'Brick pin is not defined.', { node: brick, property: 'pin' });

        // Check if brick pin is unique
        if (!hasCurrentBrick && allPinsDefined.some(item => item[0].pin === brick.pin)) 
            accept('error', 'Brick pin already used.', { node: brick, property: 'pin' });

        // Check if brick pin type is correct
        let currentPin = Array.from(this.pins.keys()).find(item => item.pin === brick.pin);
        if (currentPin !== undefined && 
            (((currentPin.type === 'DIGITAL_INPUT' || currentPin.type === 'DIGITAL_OUTPUT') && !isSensor(brick)) ||
            ((currentPin.type === 'ANALOG_OUTPUT' || currentPin.type === 'ANALOG_INPUT') && !isActuator(brick)))) {
            accept('error', 'Brick is assigned to wrong Pin (invalid type)', { node: brick, property: 'pin' });
        }

        // If all checks passed, add brick to the pin map
        this.pins.set(currentPin!, brick);
    }
}
