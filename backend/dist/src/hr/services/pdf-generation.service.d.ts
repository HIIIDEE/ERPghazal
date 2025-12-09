interface PayslipData {
    employee: {
        lastName: string;
        firstName: string;
        badgeId?: string;
        socialSecurityNumber?: string;
        position?: {
            title: string;
        };
        department?: {
            name: string;
        };
    };
    month: number;
    year: number;
    baseSalary: number;
    bonuses: number;
    grossSalary: number;
    employeeContributions: Record<string, any>;
    totalEmployeeContributions: number;
    taxableSalary: number;
    incomeTax: number;
    netSalary: number;
    employerContributions: Record<string, any>;
    totalEmployerContributions: number;
}
export declare class PdfGenerationService {
    private readonly MONTH_NAMES;
    generatePayslipPDF(payslip: PayslipData): Promise<Buffer>;
    private buildPDFContent;
    private addHeader;
    private addEmployeeInfo;
    private addSalaryDetails;
    private addEmployeeContributions;
    private addTaxableAndIRG;
    private addNetSalary;
    private addEmployerContributions;
    private addFooter;
    private addLine;
}
export {};
