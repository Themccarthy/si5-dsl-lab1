import type { ValidationChecks, ValidationAcceptor } from 'langium';
import type { ArduinoMlBServices } from './arduino-ml-b-module.js';
import { ArduinoMlBAstType, ScreenAction } from './generated/ast.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ArduinoMlBServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ArduinoMlBValidator;
    const checks: ValidationChecks<ArduinoMlBAstType> = {
        ScreenAction: validator.checkScreenActionLength
    
    };
    registry.register(checks, validator);
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


}
