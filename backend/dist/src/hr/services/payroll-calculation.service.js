"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollCalculationService = void 0;
const common_1 = require("@nestjs/common");
let PayrollCalculationService = class PayrollCalculationService {
    calculateBonuses({ bonuses, baseSalary, month, year }) {
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        return bonuses.reduce((total, eb) => {
            const bonusStart = new Date(eb.startDate);
            const bonusEnd = eb.endDate ? new Date(eb.endDate) : null;
            if (bonusStart > endOfMonth || (bonusEnd && bonusEnd < startOfMonth)) {
                return total;
            }
            const isValid = eb.frequency === 'PONCTUELLE'
                ? bonusStart.getMonth() === month && bonusStart.getFullYear() === year
                : true;
            if (!isValid)
                return total;
            const value = this.calculateBonusValue(eb, baseSalary);
            return total + value;
        }, 0);
    }
    calculateBonusValue(employeeBonus, baseSalary) {
        if (employeeBonus.amount !== null && employeeBonus.amount !== undefined) {
            return employeeBonus.amount;
        }
        if (employeeBonus.bonus) {
            if (employeeBonus.bonus.calculationMode === 'FIXE') {
                return employeeBonus.bonus.amount || 0;
            }
            else {
                return (baseSalary * (employeeBonus.bonus.percentage || 0)) / 100;
            }
        }
        return 0;
    }
    calculateContributions(contributions, grossSalary) {
        const details = {};
        let total = 0;
        for (const contrib of contributions) {
            const amount = (grossSalary * contrib.rate) / 100;
            details[contrib.code] = {
                name: contrib.name,
                rate: contrib.rate,
                amount: this.roundToTwo(amount)
            };
            total += amount;
        }
        return { details, total: this.roundToTwo(total) };
    }
    calculateIRG(taxableSalary) {
        if (taxableSalary <= 30000)
            return 0;
        let irg = 0;
        if (taxableSalary <= 120000) {
            irg = (taxableSalary - 30000) * 0.20;
        }
        else if (taxableSalary <= 360000) {
            irg = 18000 + (taxableSalary - 120000) * 0.30;
        }
        else {
            irg = 90000 + (taxableSalary - 360000) * 0.35;
        }
        return this.roundToTwo(irg);
    }
    calculatePayslip(baseSalary, totalBonuses, employeeContributions, employerContributions) {
        const grossSalary = baseSalary + totalBonuses;
        const empContribs = this.calculateContributions(employeeContributions, grossSalary);
        const taxableSalary = this.roundToTwo(grossSalary - empContribs.total);
        const incomeTax = this.calculateIRG(taxableSalary);
        const netSalary = this.roundToTwo(taxableSalary - incomeTax);
        const emplerContribs = this.calculateContributions(employerContributions, grossSalary);
        return {
            baseSalary,
            bonuses: totalBonuses,
            grossSalary,
            employeeContributions: empContribs.details,
            totalEmployeeContributions: empContribs.total,
            taxableSalary,
            incomeTax,
            netSalary,
            employerContributions: emplerContribs.details,
            totalEmployerContributions: emplerContribs.total
        };
    }
    roundToTwo(num) {
        return Math.round(num * 100) / 100;
    }
};
exports.PayrollCalculationService = PayrollCalculationService;
exports.PayrollCalculationService = PayrollCalculationService = __decorate([
    (0, common_1.Injectable)()
], PayrollCalculationService);
//# sourceMappingURL=payroll-calculation.service.js.map