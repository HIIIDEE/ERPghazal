"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const payroll_calculation_service_1 = require("./services/payroll-calculation.service");
const pdf_generation_service_1 = require("./services/pdf-generation.service");
const rubrique_calculation_service_1 = require("./services/rubrique-calculation.service");
let HrService = class HrService {
    prisma;
    payrollCalc;
    pdfGen;
    rubriqueCalc;
    constructor(prisma, payrollCalc, pdfGen, rubriqueCalc) {
        this.prisma = prisma;
        this.payrollCalc = payrollCalc;
        this.pdfGen = pdfGen;
        this.rubriqueCalc = rubriqueCalc;
    }
    async createEmployee(data) {
        try {
            console.log('Creating employee with data:', data);
            return await this.prisma.employee.create({
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    workEmail: data.workEmail,
                    hireDate: new Date(data.hireDate),
                    jobTitle: data.jobTitle,
                    workPhone: data.workPhone,
                    workMobile: data.workMobile,
                    departmentId: data.departmentId,
                    workLocation: data.workLocation,
                    address: data.address,
                    phone: data.phone,
                    privateEmail: data.privateEmail,
                    identificationId: data.identificationId,
                    badgeId: data.badgeId,
                    paymentMethod: data.paymentMethod,
                    children: data.children ? Number(data.children) : 0,
                    maritalStatus: data.maritalStatus,
                    placeOfBirth: data.placeOfBirth,
                    countryOfBirth: data.countryOfBirth,
                    bankAccount: data.bankAccount,
                    gender: data.gender,
                    nationality: data.nationality,
                    emergencyContact: data.emergencyContact,
                    emergencyPhone: data.emergencyPhone,
                    birthday: data.birthday ? new Date(data.birthday) : undefined,
                    socialSecurityNumber: data.socialSecurityNumber,
                    cnasAgency: data.cnasAgency,
                    cnasStartDate: data.cnasStartDate ? new Date(data.cnasStartDate) : undefined,
                    isHandicapped: data.isHandicapped ?? false,
                    cnasContribution: data.cnasContribution ?? true,
                    cnasRateSalary: data.cnasRateSalary,
                    cnasRatePatron: data.cnasRatePatron,
                    cnasRateSocial: data.cnasRateSocial,
                    cnasRateHousing: data.cnasRateHousing,
                    cnasRateCacobath: data.cnasRateCacobath,
                    cnasRateService: data.cnasRateService,
                    cnasMutual: data.cnasMutual,
                }
            });
        }
        catch (error) {
            console.error('Error creating employee:', error);
            throw error;
        }
    }
    async updateEmployee(id, data) {
        const { id: _id, department, position, contracts, documents, leaves, positionHistory, manager, subordinates, coach, mentees, user, attendances, createdAt, updatedAt, absences, company, ...updateData } = data;
        return this.prisma.employee.update({
            where: { id },
            data: {
                ...updateData,
                hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
                birthday: data.birthday ? new Date(data.birthday) : undefined,
                cnasStartDate: data.cnasStartDate ? new Date(data.cnasStartDate) : undefined,
                children: data.children ? Number(data.children) : undefined,
            }
        });
    }
    async createContract(data) {
        if (data.type === 'CDI' && data.endDate) {
        }
        const startDate = new Date(data.startDate);
        let endDate = data.endDate ? new Date(data.endDate) : null;
        if (data.type === 'CDI') {
            endDate = null;
        }
        else {
            if (!data.endDate) {
                throw new Error("La date de fin est obligatoire pour les contrats non-CDI.");
            }
        }
        if (endDate && startDate > endDate) {
            throw new Error("La date de début ne peut pas être postérieure à la date de fin.");
        }
        return this.prisma.contract.create({
            data: {
                ...data,
                wage: Number(data.wage),
                hourlyWage: data.hourlyWage ? Number(data.hourlyWage) : undefined,
                weeklyHours: data.weeklyHours ? Number(data.weeklyHours) : undefined,
                startDate: startDate,
                endDate: endDate,
                trialPeriodEndDate: data.trialPeriodEndDate ? new Date(data.trialPeriodEndDate) : null,
            }
        });
    }
    async updateContract(id, data) {
        const payload = { ...data };
        if (data.startDate)
            payload.startDate = new Date(data.startDate);
        if (data.endDate)
            payload.endDate = new Date(data.endDate);
        if (data.trialPeriodEndDate)
            payload.trialPeriodEndDate = new Date(data.trialPeriodEndDate);
        if (data.wage)
            payload.wage = Number(data.wage);
        if (data.hourlyWage)
            payload.hourlyWage = Number(data.hourlyWage);
        if (data.weeklyHours)
            payload.weeklyHours = Number(data.weeklyHours);
        return this.prisma.contract.update({
            where: { id },
            data: payload
        });
    }
    async findAllContracts() {
        return this.prisma.contract.findMany({
            include: {
                employee: true,
                previousContract: true,
                nextContract: true
            },
            orderBy: { startDate: 'desc' }
        });
    }
    async createPosition(title) {
        return this.prisma.position.create({ data: { title } });
    }
    async findAllPositions() {
        return this.prisma.position.findMany();
    }
    async assignPosition(employeeId, positionId, startDate) {
        const currentHistory = await this.prisma.positionHistory.findFirst({
            where: { employeeId, endDate: null }
        });
        if (currentHistory) {
            await this.prisma.positionHistory.update({
                where: { id: currentHistory.id },
                data: { endDate: new Date() }
            });
        }
        await this.prisma.positionHistory.create({
            data: {
                employeeId,
                positionId,
                startDate: new Date(startDate)
            }
        });
        return this.prisma.employee.update({
            where: { id: employeeId },
            data: { positionId }
        });
    }
    async getPositionHistory(employeeId) {
        return this.prisma.positionHistory.findMany({
            where: { employeeId },
            include: { position: true },
            orderBy: { startDate: 'desc' }
        });
    }
    async findAllEmployees() {
        return this.prisma.employee.findMany({
            include: {
                department: true,
                position: true,
                contracts: {
                    include: {
                        previousContract: true,
                        nextContract: true
                    }
                },
                bonuses: {
                    include: {
                        bonus: true
                    },
                    orderBy: { startDate: 'desc' }
                }
            }
        });
    }
    async findAllDepartments() {
        return this.prisma.department.findMany();
    }
    async findOneEmployee(id) {
        return this.prisma.employee.findUnique({
            where: { id },
            include: {
                department: true,
                position: true,
                contracts: {
                    include: {
                        previousContract: true,
                        nextContract: true
                    }
                },
                positionHistory: {
                    include: { position: true },
                    orderBy: { startDate: 'desc' }
                },
                bonuses: {
                    include: {
                        bonus: true
                    },
                    orderBy: { startDate: 'desc' }
                }
            }
        });
    }
    async createPayrollBonus(data) {
        return this.prisma.payrollBonus.create({ data });
    }
    async findAllPayrollBonuses() {
        return this.prisma.payrollBonus.findMany();
    }
    async deletePayrollBonus(id) {
        return this.prisma.payrollBonus.delete({ where: { id } });
    }
    async assignBonusToEmployee(employeeId, bonusId, details) {
        return this.prisma.employeeBonus.create({
            data: {
                employeeId,
                bonusId,
                amount: details?.amount,
                frequency: details?.frequency || 'MONTHLY',
                startDate: details?.startDate ? new Date(details.startDate) : new Date(),
                endDate: details?.endDate ? new Date(details.endDate) : null
            }
        });
    }
    async removeBonusFromEmployee(employeeId, bonusId) {
        return this.prisma.employeeBonus.deleteMany({
            where: { employeeId, bonusId }
        });
    }
    async getEmployeeBonuses(employeeId) {
        return this.prisma.employeeBonus.findMany({
            where: { employeeId },
            include: { bonus: true }
        });
    }
    async createAbsence(data) {
        const { reasonId, date, ...rest } = data;
        return this.prisma.absence.create({
            data: {
                ...rest,
                date: new Date(date),
                reasonRelId: reasonId || null
            }
        });
    }
    async getAbsences(employeeId) {
        return this.prisma.absence.findMany({
            where: { employeeId },
            include: { reasonRel: true },
            orderBy: { date: 'desc' }
        });
    }
    async deleteAbsence(id) {
        return this.prisma.absence.delete({ where: { id } });
    }
    async createAbsenceReason(data) {
        return this.prisma.absenceReason.create({ data });
    }
    async getAbsenceReasons() {
        return this.prisma.absenceReason.findMany();
    }
    async deleteAbsenceReason(id) {
        return this.prisma.absenceReason.delete({ where: { id } });
    }
    async generatePayslips(employeeIds, month, year) {
        const [employeeContributions, employerContributions, employees] = await Promise.all([
            this.prisma.socialContribution.findMany({
                where: { type: 'EMPLOYEE', isActive: true }
            }),
            this.prisma.socialContribution.findMany({
                where: { type: 'EMPLOYER', isActive: true }
            }),
            this.prisma.employee.findMany({
                where: { id: { in: employeeIds } },
                include: {
                    contracts: true,
                    bonuses: {
                        include: { bonus: true }
                    }
                }
            })
        ]);
        const payslipData = await Promise.all(employees.map(employee => this.preparePayslipData(employee, month, year, employeeContributions, employerContributions)));
        const validPayslipData = payslipData.filter(data => data !== null);
        const payslips = await Promise.all(validPayslipData.map(data => this.prisma.payslip.upsert({
            where: {
                employeeId_month_year: {
                    employeeId: data.employeeId,
                    month,
                    year
                }
            },
            update: data.payslipFields,
            create: {
                employeeId: data.employeeId,
                month,
                year,
                ...data.payslipFields
            },
            include: {
                employee: {
                    include: {
                        department: true,
                        position: true
                    }
                }
            }
        })));
        return payslips;
    }
    async preparePayslipData(employee, month, year, employeeContributions, employerContributions) {
        const activeContract = employee.contracts.find((c) => !c.endDate || new Date(c.endDate) > new Date());
        if (!activeContract)
            return null;
        const baseSalary = Number(activeContract.wage) || 0;
        const calculatedRubriques = await this.rubriqueCalc.calculateEmployeeRubriques({
            employeeId: employee.id,
            month,
            year,
            baseSalary
        });
        let grossSalary = 0;
        let taxableSalary = 0;
        let totalEmployeeContributions = 0;
        let totalEmployerContributions = 0;
        let incomeTax = 0;
        let bonuses = 0;
        let netSalary = 0;
        const empContribDetails = {};
        const emplerContribDetails = {};
        for (const r of calculatedRubriques) {
            if (r.type === 'GAIN') {
                grossSalary += r.montant;
                bonuses += r.montant;
            }
            else if (r.type === 'BASE') {
                grossSalary += r.montant;
            }
            else if (r.type === 'RETENUE') {
                if (r.code === 'SS' || r.code === 'CNAS') {
                    totalEmployeeContributions += r.montant;
                    empContribDetails[r.code] = { name: r.nom, amount: r.montant, rate: r.taux };
                }
                else if (r.code === 'IRG') {
                    incomeTax += r.montant;
                }
                else {
                }
            }
            else if (r.type === 'COTISATION') {
                totalEmployerContributions += r.montant;
                emplerContribDetails[r.code] = { name: r.nom, amount: r.montant, rate: r.taux };
            }
        }
        taxableSalary = grossSalary - totalEmployeeContributions;
        const totalRetenues = calculatedRubriques
            .filter(r => r.type === 'RETENUE')
            .reduce((sum, r) => sum + r.montant, 0);
        netSalary = grossSalary - totalRetenues;
        return {
            employeeId: employee.id,
            payslipFields: {
                baseSalary: baseSalary,
                bonuses: bonuses,
                grossSalary: grossSalary,
                employeeContributions: empContribDetails,
                totalEmployeeContributions: totalEmployeeContributions,
                taxableSalary: taxableSalary,
                incomeTax: incomeTax,
                netSalary: netSalary,
                employerContributions: emplerContribDetails,
                totalEmployerContributions: totalEmployerContributions,
                status: 'DRAFT'
            }
        };
    }
    async getPayslips(month, year) {
        const where = {};
        if (month !== undefined)
            where.month = month;
        if (year !== undefined)
            where.year = year;
        return this.prisma.payslip.findMany({
            where,
            include: {
                employee: {
                    include: {
                        department: true,
                        position: true
                    }
                }
            },
            orderBy: [
                { year: 'desc' },
                { month: 'desc' },
                { employee: { lastName: 'asc' } }
            ]
        });
    }
    async deletePayslip(id) {
        return this.prisma.payslip.delete({ where: { id } });
    }
    async getAllContributions() {
        return this.prisma.socialContribution.findMany({
            orderBy: [
                { type: 'asc' },
                { name: 'asc' }
            ]
        });
    }
    async createContribution(data) {
        return this.prisma.socialContribution.create({ data });
    }
    async updateContribution(id, data) {
        return this.prisma.socialContribution.update({
            where: { id },
            data
        });
    }
    async deleteContribution(id) {
        return this.prisma.socialContribution.delete({ where: { id } });
    }
    async generatePayslipPDF(payslipId) {
        const payslip = await this.prisma.payslip.findUnique({
            where: { id: payslipId },
            include: {
                employee: {
                    include: {
                        department: true,
                        position: true
                    }
                }
            }
        });
        if (!payslip) {
            throw new Error('Bulletin de paie non trouvé');
        }
        return this.pdfGen.generatePayslipPDF(payslip);
    }
};
exports.HrService = HrService;
exports.HrService = HrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payroll_calculation_service_1.PayrollCalculationService,
        pdf_generation_service_1.PdfGenerationService,
        rubrique_calculation_service_1.RubriqueCalculationService])
], HrService);
//# sourceMappingURL=hr.service.js.map