export declare enum BonusCalculationMode {
    FIXE = "FIXE",
    POURCENTAGE = "POURCENTAGE"
}
export declare class CreatePayrollBonusDto {
    name: string;
    calculationMode: BonusCalculationMode;
    amount?: number;
    percentage?: number;
    description?: string;
}
