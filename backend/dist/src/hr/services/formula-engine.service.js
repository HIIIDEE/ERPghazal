"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormulaEngineService = void 0;
const common_1 = require("@nestjs/common");
let FormulaEngineService = class FormulaEngineService {
    evaluate(formula, context) {
        try {
            const sanitizedFormula = this.sanitizeFormula(formula, context);
            const func = new Function(...Object.keys(context), `return ${sanitizedFormula};`);
            const result = func(...Object.values(context));
            if (typeof result !== 'number' || !isFinite(result)) {
                throw new Error(`Formula evaluation resulted in invalid number: ${result}`);
            }
            return this.roundToTwo(result);
        }
        catch (error) {
            console.error(`Error evaluating formula "${formula}":`, error);
            throw new Error(`Invalid formula: ${formula}`);
        }
    }
    sanitizeFormula(formula, context) {
        let sanitized = formula;
        const allowedPattern = /^[0-9+\-*/(). _A-Z]+$/;
        if (!allowedPattern.test(formula)) {
            throw new Error('Formula contains invalid characters');
        }
        const variables = formula.match(/[A-Z_][A-Z_0-9]*/g) || [];
        for (const variable of variables) {
            if (!(variable in context)) {
                throw new Error(`Unknown variable in formula: ${variable}`);
            }
        }
        return sanitized;
    }
    isValidFormula(formula) {
        try {
            const testContext = {
                SALAIRE_BASE: 30000,
                SALAIRE_BRUT: 35000,
                SALAIRE_IMPOSABLE: 30000
            };
            this.evaluate(formula, testContext);
            return true;
        }
        catch {
            return false;
        }
    }
    getAvailableVariables() {
        return [
            'SALAIRE_BASE',
            'SALAIRE_BRUT',
            'SALAIRE_IMPOSABLE',
            'SNMG',
            'PLAFOND_CNAS',
            'POINT_INDICE'
        ];
    }
    roundToTwo(num) {
        return Math.round(num * 100) / 100;
    }
};
exports.FormulaEngineService = FormulaEngineService;
exports.FormulaEngineService = FormulaEngineService = __decorate([
    (0, common_1.Injectable)()
], FormulaEngineService);
//# sourceMappingURL=formula-engine.service.js.map