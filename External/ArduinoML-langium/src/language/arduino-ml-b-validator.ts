import type { ValidationChecks, ValidationAcceptor } from 'langium';
import type { ArduinoMlBServices } from './arduino-ml-b-module.js';
import { ArduinoMlBAstType, Sensor, Transition } from './generated/ast.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ArduinoMlBServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ArduinoMlBValidator;
    const checks: ValidationChecks<ArduinoMlBAstType> = {
        Transition: validator.checkUniqueSensorsInTransition 
    
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class ArduinoMlBValidator {

    checkUniqueSensorsInTransition(transition: Transition, accept: ValidationAcceptor): void {
        if (transition) {
            const sensorsUsed = new Set<Sensor>();

            // Vérifier le SensorCondition1
            if (transition.sensorCondition1 && transition.sensorCondition1.sensor && transition.sensorCondition1.sensor.ref) {
                if (sensorsUsed.has(transition.sensorCondition1.sensor.ref)) {
                    accept('error', 'Le même sensor est utilisé plusieurs fois dans la conditon de transition.', { node: transition.sensorCondition1.sensor.ref });
                } else {
                    sensorsUsed.add(transition.sensorCondition1.sensor.ref);
                }
            }

            // Vérifier les SensorCondition
            transition.sensorConditions.forEach(condition => {
                if (condition.sensor && condition.sensor.ref) {
                    if (sensorsUsed.has(condition.sensor.ref)) {
                        accept('error', 'Le même capteur est utilisé plusieurs fois dans la transition.', { node: condition.sensor.ref });
                    } else {
                        sensorsUsed.add(condition.sensor.ref);
                    }
                }
            });
        }
    }


}
