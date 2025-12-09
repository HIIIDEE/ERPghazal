import { Injectable } from '@nestjs/common';

interface FormulaContext {
    SALAIRE_BASE: number;
    SALAIRE_BRUT: number;
    SALAIRE_IMPOSABLE?: number;
    [key: string]: number | undefined;
}

@Injectable()
export class FormulaEngineService {
    /**
     * Evaluate a formula string with given context
     * Example: "SALAIRE_BASE * 0.09" with context { SALAIRE_BASE: 50000 } => 4500
     */
    evaluate(formula: string, context: FormulaContext): number {
        try {
            // Security: Only allow mathematical operations and known variables
            const sanitizedFormula = this.sanitizeFormula(formula, context);

            // Use Function constructor for safe evaluation
            const func = new Function(...Object.keys(context), `return ${sanitizedFormula};`);
            const result = func(...Object.values(context));

            if (typeof result !== 'number' || !isFinite(result)) {
                throw new Error(`Formula evaluation resulted in invalid number: ${result}`);
            }

            return this.roundToTwo(result);
        } catch (error) {
            console.error(`Error evaluating formula "${formula}":`, error);
            throw new Error(`Invalid formula: ${formula}`);
        }
    }

    /**
     * Sanitize formula to prevent code injection
     */
    private sanitizeFormula(formula: string, context: FormulaContext): string {
        // Replace known variables with their context keys
        let sanitized = formula;

        // Check that formula only contains allowed characters
        const allowedPattern = /^[0-9+\-*/(). _A-Z]+$/;
        if (!allowedPattern.test(formula)) {
            throw new Error('Formula contains invalid characters');
        }

        // Validate that all uppercase words are in context
        const variables = formula.match(/[A-Z_][A-Z_0-9]*/g) || [];
        for (const variable of variables) {
            if (!(variable in context)) {
                throw new Error(`Unknown variable in formula: ${variable}`);
            }
        }

        return sanitized;
    }

    /**
     * Test if a formula is valid
     */
    isValidFormula(formula: string): boolean {
        try {
            // Test with dummy context
            const testContext: FormulaContext = {
                SALAIRE_BASE: 30000,
                SALAIRE_BRUT: 35000,
                SALAIRE_IMPOSABLE: 30000
            };
            this.evaluate(formula, testContext);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get available variables for formulas
     */
    getAvailableVariables(): string[] {
        return [
            'SALAIRE_BASE',
            'SALAIRE_BRUT',
            'SALAIRE_IMPOSABLE',
            'SNMG',
            'PLAFOND_CNAS',
            'POINT_INDICE'
        ];
    }

    /**
     * Round to 2 decimal places
     */
    private roundToTwo(num: number): number {
        return Math.round(num * 100) / 100;
    }
}
