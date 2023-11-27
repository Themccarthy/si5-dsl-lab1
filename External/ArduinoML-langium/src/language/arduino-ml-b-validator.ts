import type { ValidationChecks } from 'langium';
import type { ArduinoMlBAstType } from './generated/ast.js';
import type { ArduinoMlBServices } from './arduino-ml-b-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ArduinoMlBServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ArduinoMlBValidator;
    const checks: ValidationChecks<ArduinoMlBAstType> = {
    
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class ArduinoMlBValidator {


}
