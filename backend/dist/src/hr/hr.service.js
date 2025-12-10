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
    mapMaritalStatus(status) {
        if (!status || status === '')
            return undefined;
        const mapping = {
            'Célibataire': 'SINGLE',
            'Marié(e)': 'MARRIED',
            'Cohabitant': 'COHABITANT',
            'Veuf/Veuve': 'WIDOWER',
            'Divorcé(e)': 'DIVORCED',
            'SINGLE': 'SINGLE',
            'MARRIED': 'MARRIED',
            'COHABITANT': 'COHABITANT',
            'WIDOWER': 'WIDOWER',
            'DIVORCED': 'DIVORCED'
        };
        return mapping[status] || undefined;
    }
    mapGender(gender) {
        if (!gender || gender === '')
            return undefined;
        const mapping = {
            'Homme': 'MALE',
            'Femme': 'FEMALE',
            'Autre': 'OTHER',
            'MALE': 'MALE',
            'FEMALE': 'FEMALE',
            'OTHER': 'OTHER'
        };
        return mapping[gender] || undefined;
    }
    mapPaymentMethod(method) {
        if (!method || method === '')
            return undefined;
        const mapping = {
            'Virement': 'VIREMENT',
            'Espèce': 'ESPECE',
            'Chèque': 'CHEQUE',
            'VIREMENT': 'VIREMENT',
            'ESPECE': 'ESPECE',
            'CHEQUE': 'CHEQUE'
        };
        return mapping[method] || undefined;
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
                    jobTitle: data.jobTitle || undefined,
                    workPhone: data.workPhone || undefined,
                    workMobile: data.workMobile || undefined,
                    departmentId: data.departmentId || undefined,
                    workLocation: data.workLocation || undefined,
                    address: data.address || undefined,
                    phone: data.phone || undefined,
                    privateEmail: data.privateEmail || undefined,
                    identificationId: data.identificationId || undefined,
                    badgeId: data.badgeId || undefined,
                    paymentMethod: this.mapPaymentMethod(data.paymentMethod),
                    children: data.children ? Number(data.children) : 0,
                    maritalStatus: this.mapMaritalStatus(data.maritalStatus),
                    placeOfBirth: data.placeOfBirth || undefined,
                    countryOfBirth: data.countryOfBirth || undefined,
                    bankAccount: data.bankAccount || undefined,
                    gender: this.mapGender(data.gender),
                    nationality: data.nationality || undefined,
                    emergencyContact: data.emergencyContact || undefined,
                    emergencyPhone: data.emergencyPhone || undefined,
                    birthday: data.birthday ? new Date(data.birthday) : undefined,
                    socialSecurityNumber: data.socialSecurityNumber || undefined,
                    cnasAgency: data.cnasAgency || undefined,
                    cnasStartDate: data.cnasStartDate ? new Date(data.cnasStartDate) : undefined,
                    isHandicapped: data.isHandicapped ?? false,
                    cnasContribution: data.cnasContribution ?? true,
                    cnasRateSalary: data.cnasRateSalary || undefined,
                    cnasRatePatron: data.cnasRatePatron || undefined,
                    cnasRateSocial: data.cnasRateSocial || undefined,
                    cnasRateHousing: data.cnasRateHousing || undefined,
                    cnasRateCacobath: data.cnasRateCacobath || undefined,
                    cnasRateService: data.cnasRateService || undefined,
                    cnasMutual: data.cnasMutual || undefined,
                }
            });
        }
        catch (error) {
            console.error('Error creating employee:', error);
            throw error;
        }
    }
    async updateEmployee(id, data) {
        const { id: _id, department, position, contracts, documents, leaves, positionHistory, manager, subordinates, coach, mentees, user, attendances, createdAt, updatedAt, absences, company, bonuses, rubriques, payslips, ...updateData } = data;
        return this.prisma.employee.update({
            where: { id },
            data: {
                ...updateData,
                hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
                birthday: data.birthday ? new Date(data.birthday) : undefined,
                cnasStartDate: data.cnasStartDate ? new Date(data.cnasStartDate) : undefined,
                children: data.children ? Number(data.children) : undefined,
                maritalStatus: data.maritalStatus ? this.mapMaritalStatus(data.maritalStatus) : undefined,
                gender: data.gender ? this.mapGender(data.gender) : undefined,
                paymentMethod: data.paymentMethod ? this.mapPaymentMethod(data.paymentMethod) : undefined,
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
            throw new Error("La date de dÃ©but ne peut pas Ãªtre postÃ©rieure Ã  la date de fin.");
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
    async findAllTaxBrackets() {
        return this.prisma.taxBracket.findMany({
            orderBy: { ordre: 'asc' }
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
                        nextContract: true,
                        salaryStructure: {
                            include: {
                                rubriques: {
                                    include: {
                                        rubrique: true
                                    }
                                }
                            }
                        }
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
                },
                rubriques: {
                    include: {
                        rubrique: true
                    }
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
    async getEmployeesWithVariables(month, year) {
        const currentDate = new Date(year, month, 15);
        return this.prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            include: {
                department: true,
                position: true,
                rubriques: {
                    where: {
                        startDate: { lte: currentDate },
                        OR: [
                            { endDate: null },
                            { endDate: { gte: currentDate } }
                        ]
                    },
                    include: { rubrique: true }
                },
                contracts: {
                    where: {
                        OR: [
                            { endDate: null },
                            { endDate: { gte: currentDate } }
                        ]
                    },
                    include: {
                        salaryStructure: {
                            include: {
                                rubriques: {
                                    include: { rubrique: true },
                                    orderBy: { ordre: 'asc' }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { lastName: 'asc' }
        });
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
    async simulatePayslip(employeeId, month, year) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                contracts: {
                    include: {
                        salaryStructure: {
                            include: {
                                rubriques: {
                                    include: { rubrique: true },
                                    orderBy: { ordre: 'asc' }
                                }
                            }
                        }
                    }
                },
                rubriques: {
                    include: { rubrique: true }
                }
            }
        });
        if (!employee)
            throw new Error('EmployÃ© non trouvÃ©');
        return this.preparePayslipData(employee, month, year, [], []).then(result => {
            if (!result)
                return null;
            return {
                employeeId: result.employeeId,
                ...result.payslipFields
            };
        });
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
            baseSalary,
            hireDate: new Date(employee.hireDate)
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
        const gainDetails = [];
        const retenueDetails = [];
        for (const r of calculatedRubriques) {
            if (r.type === 'GAIN') {
                grossSalary += r.montant;
                bonuses += r.montant;
                gainDetails.push({
                    code: r.code,
                    name: r.nom,
                    amount: r.montant,
                    rate: r.taux
                });
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
                retenueDetails.push({
                    code: r.code,
                    name: r.nom,
                    amount: r.montant,
                    rate: r.taux
                });
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
                status: 'DRAFT',
                details: {
                    gains: gainDetails,
                    retenues: retenueDetails
                }
            }
        };
    }
    async debugEmployeeRubriques(name) {
        const employee = await this.prisma.employee.findFirst({
            where: {
                OR: [
                    { lastName: { contains: name, mode: 'insensitive' } },
                    { firstName: { contains: name, mode: 'insensitive' } }
                ]
            },
            include: { contracts: true }
        });
        if (!employee)
            return { error: 'Employee not found' };
        const assignments = await this.prisma.employeeRubrique.findMany({
            where: { employeeId: employee.id },
            include: { rubrique: true }
        });
        let structureRubriques = [];
        const contract = employee.contracts[0];
        if (contract && contract.salaryStructureId) {
            const structure = await this.prisma.salaryStructure.findUnique({
                where: { id: contract.salaryStructureId },
                include: { rubriques: { include: { rubrique: true } } }
            });
            if (structure) {
                structureRubriques = structure.rubriques.map((sr) => ({
                    code: sr.rubrique.code,
                    name: sr.rubrique.nom,
                    type: sr.rubrique.type
                }));
            }
        }
        return {
            employee: { id: employee.id, name: `${employee.firstName} ${employee.lastName}` },
            baseWage: employee.contracts[0]?.wage,
            assignments: assignments.map(a => ({
                id: a.id,
                rubriqueCode: a.rubrique.code,
                rubriqueName: a.rubrique.nom,
                type: a.rubrique.type,
                amountOverride: a.montantOverride,
                valeur: a.rubrique.valeur
            })),
            structureRubriques
        };
    }
    async debugRubriqueFormulas(codes) {
        const rubriques = await this.prisma.rubrique.findMany({
            where: { code: { in: codes } }
        });
        return rubriques;
    }
    async fixStructureDuplications(name) {
        const employee = await this.prisma.employee.findFirst({
            where: {
                OR: [
                    { lastName: { contains: name, mode: 'insensitive' } },
                    { firstName: { contains: name, mode: 'insensitive' } }
                ]
            },
            include: { contracts: true }
        });
        if (!employee || !employee.contracts[0]?.salaryStructureId) {
            return { error: 'Employee or Structure not found' };
        }
        const structureId = employee.contracts[0].salaryStructureId;
        const rubriquesToRemove = await this.prisma.rubrique.findMany({
            where: { code: { in: ['CNR_SALARIE', 'CNAC_SALARIE'] } }
        });
        const idsToRemove = rubriquesToRemove.map(r => r.id);
        const deleted = await this.prisma.structureRubrique.deleteMany({
            where: {
                salaryStructureId: structureId,
                rubriqueId: { in: idsToRemove }
            }
        });
        return {
            message: `Removed ${deleted.count} redundant rubriques from structure.`,
            structureId: structureId,
            removedCodes: ['CNR_SALARIE', 'CNAC_SALARIE']
        };
    }
    async cleanupDuplicates(name) {
        const employee = await this.prisma.employee.findFirst({
            where: {
                OR: [
                    { lastName: { contains: name, mode: 'insensitive' } },
                    { firstName: { contains: name, mode: 'insensitive' } }
                ]
            }
        });
        if (!employee)
            return { error: 'Employee not found' };
        const rubriques = await this.prisma.rubrique.findMany({
            where: {
                code: { in: ['PRIME_RESP', 'PRIME_DISPO'] }
            }
        });
        const rubIds = rubriques.map(r => r.id);
        const deleted = await this.prisma.employeeRubrique.deleteMany({
            where: {
                employeeId: employee.id,
                rubriqueId: { in: rubIds }
            }
        });
        const assignments = [];
        const startDate = new Date('2025-12-01T00:00:00.000Z');
        for (const rub of rubriques) {
            const assignment = await this.prisma.employeeRubrique.create({
                data: {
                    employeeId: employee.id,
                    rubriqueId: rub.id,
                    startDate: startDate,
                    montantOverride: 20000
                }
            });
            assignments.push(assignment);
        }
        return {
            message: `Cleaned ${deleted.count} assignments. Re-assigned ${assignments.length} unique bonuses.`,
            employee: employee.lastName
        };
    }
    async addDemoBonuses() {
        const employee = await this.prisma.employee.findFirst({
            where: {
                OR: [
                    { lastName: { contains: 'Votre', mode: 'insensitive' } },
                    { firstName: { contains: 'Votre', mode: 'insensitive' } }
                ]
            }
        });
        if (!employee)
            throw new Error('Employee not found');
        const bonuses = [
            { nom: 'Prime de ResponsabilitÃ©', code: 'PRIME_RESP', montant: 20000 },
            { nom: 'Prime de DisponibilitÃ©', code: 'PRIME_DISPO', montant: 20000 }
        ];
        for (const bonus of bonuses) {
            let rubrique = await this.prisma.rubrique.findFirst({ where: { code: bonus.code } });
            if (!rubrique) {
                rubrique = await this.prisma.rubrique.create({
                    data: {
                        code: bonus.code,
                        nom: bonus.nom,
                        type: 'GAIN',
                        montantType: 'FIXE',
                        valeur: bonus.montant,
                        isActive: true,
                        ordreAffichage: 10,
                        soumisCnas: true,
                        soumisIrg: true
                    }
                });
            }
            const startDate = new Date('2025-12-01T00:00:00.000Z');
            const existing = await this.prisma.employeeRubrique.findFirst({
                where: {
                    employeeId: employee.id,
                    rubriqueId: rubrique.id,
                    startDate: startDate
                }
            });
            if (!existing) {
                await this.prisma.employeeRubrique.create({
                    data: {
                        employeeId: employee.id,
                        rubriqueId: rubrique.id,
                        startDate: startDate,
                        montantOverride: bonus.montant
                    }
                });
            }
            else {
                await this.prisma.employeeRubrique.update({
                    where: { id: existing.id },
                    data: { montantOverride: bonus.montant }
                });
            }
        }
        return { success: true, message: 'Bonuses added for ' + employee.lastName };
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
            throw new Error('Bulletin de paie non trouvÃ©');
        }
        return this.pdfGen.generatePayslipPDF(payslip);
    }
    async updateTaxBrackets() {
        await this.prisma.taxBracket.deleteMany({});
        await this.prisma.taxBracket.createMany({
            data: [
                {
                    nom: 'Tranche 1 - ExonÃ©rÃ©',
                    minAmount: 0,
                    maxAmount: 30000,
                    rate: 0,
                    ordre: 1,
                    startDate: new Date('2020-01-01T00:00:00.000Z')
                },
                {
                    nom: 'Tranche 2 - 30%',
                    minAmount: 30001,
                    maxAmount: 120000,
                    rate: 30,
                    ordre: 2,
                    startDate: new Date('2020-01-01T00:00:00.000Z')
                },
                {
                    nom: 'Tranche 3 - 35%',
                    minAmount: 120001,
                    maxAmount: 999999999,
                    rate: 35,
                    ordre: 3,
                    startDate: new Date('2020-01-01T00:00:00.000Z')
                }
            ]
        });
        return { message: 'Tax Brackets Updated to 2020 Standard (Matching Reference)' };
    }
    async removeCnacFromStructure(name) {
        const employee = await this.prisma.employee.findFirst({
            where: {
                OR: [
                    { lastName: { contains: name, mode: 'insensitive' } },
                    { firstName: { contains: name, mode: 'insensitive' } }
                ]
            },
            include: { contracts: true }
        });
        if (!employee || !employee.contracts[0]?.salaryStructureId) {
            return { error: 'Employee or Structure not found' };
        }
        const structureId = employee.contracts[0].salaryStructureId;
        const rubCnac = await this.prisma.rubrique.findFirst({
            where: { code: 'CNAC_SALARIE' }
        });
        if (!rubCnac)
            return { error: 'CNAC rubrique not found' };
        const deleted = await this.prisma.structureRubrique.deleteMany({
            where: {
                salaryStructureId: structureId,
                rubriqueId: rubCnac.id
            }
        });
        return { message: `Removed CNAC from structure. Deleted ${deleted.count} entries.`, structureId };
    }
    async fixBaseType() {
        const result = await this.prisma.rubrique.updateMany({
            where: { code: 'SALAIRE_BASE', type: 'GAIN' },
            data: { type: 'BASE' }
        });
        return { message: `Updated ${result.count} definitions of SALAIRE_BASE to type BASE.` };
    }
    async addCnacToStructure(name) {
        const employee = await this.prisma.employee.findFirst({
            where: {
                OR: [
                    { lastName: { contains: name, mode: 'insensitive' } },
                    { firstName: { contains: name, mode: 'insensitive' } }
                ]
            },
            include: { contracts: true }
        });
        if (!employee || !employee.contracts[0]?.salaryStructureId) {
            return { error: 'Employee or Structure not found' };
        }
        const structureId = employee.contracts[0].salaryStructureId;
        const rubCnac = await this.prisma.rubrique.findFirst({
            where: { code: 'CNAC_SALARIE' }
        });
        if (!rubCnac)
            return { error: 'CNAC rubrique not found' };
        const existing = await this.prisma.structureRubrique.findFirst({
            where: {
                salaryStructureId: structureId,
                rubriqueId: rubCnac.id
            }
        });
        if (!existing) {
            await this.prisma.structureRubrique.create({
                data: {
                    salaryStructureId: structureId,
                    rubriqueId: rubCnac.id,
                    ordre: 22
                }
            });
            return { message: 'Restored CNAC (1%) to structure', structureId };
        }
        return { message: 'CNAC already in structure' };
    }
    async getEmployeeRubriques(employeeId) {
        return this.prisma.employeeRubrique.findMany({
            where: { employeeId },
            include: { rubrique: true },
            orderBy: { startDate: 'desc' }
        });
    }
    async getAllRubriques() {
        return this.prisma.rubrique.findMany({
            where: { isActive: true },
            orderBy: { ordreAffichage: 'asc' }
        });
    }
    async assignRubriqueToEmployee(employeeId, data) {
        const existing = await this.prisma.employeeRubrique.findFirst({
            where: {
                employeeId,
                rubriqueId: data.rubriqueId,
                endDate: null
            }
        });
        if (existing) {
            return this.prisma.employeeRubrique.update({
                where: { id: existing.id },
                data: {
                    montantOverride: data.montantOverride,
                    tauxOverride: data.tauxOverride,
                    startDate: new Date(data.startDate)
                },
                include: { rubrique: true }
            });
        }
        return this.prisma.employeeRubrique.create({
            data: {
                employeeId,
                rubriqueId: data.rubriqueId,
                montantOverride: data.montantOverride,
                tauxOverride: data.tauxOverride,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null
            },
            include: { rubrique: true }
        });
    }
    async updateEmployeeRubrique(employeeId, rubriqueId, data) {
        const existing = await this.prisma.employeeRubrique.findFirst({
            where: {
                employeeId,
                rubriqueId,
                endDate: null
            }
        });
        if (!existing) {
            throw new Error('Assignment not found');
        }
        return this.prisma.employeeRubrique.update({
            where: { id: existing.id },
            data: {
                montantOverride: data.montantOverride !== undefined ? data.montantOverride : existing.montantOverride,
                tauxOverride: data.tauxOverride !== undefined ? data.tauxOverride : existing.tauxOverride,
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate
            },
            include: { rubrique: true }
        });
    }
    async deleteEmployeeRubrique(employeeId, rubriqueId) {
        return this.prisma.employeeRubrique.deleteMany({
            where: {
                employeeId,
                rubriqueId
            }
        });
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