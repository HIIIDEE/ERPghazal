interface FormulaContext {
    SALAIRE_BASE: number;
    SALAIRE_BRUT: number;
    SALAIRE_IMPOSABLE?: number;
    [key: string]: number | undefined;
}
export declare class FormulaEngineService {
    evaluate(formula: string, context: FormulaContext): number;
    private sanitizeFormula;
    isValidFormula(formula: string): boolean;
    getAvailableVariables(): string[];
    private roundToTwo;
}
export {};
