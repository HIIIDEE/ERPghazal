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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pdfkit_1 = __importDefault(require("pdfkit"));
let HrService = class HrService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
        const payslips = [];
        const employeeContributions = await this.prisma.socialContribution.findMany({
            where: { type: 'EMPLOYEE', isActive: true }
        });
        const employerContributions = await this.prisma.socialContribution.findMany({
            where: { type: 'EMPLOYER', isActive: true }
        });
        for (const employeeId of employeeIds) {
            const employee = await this.prisma.employee.findUnique({
                where: { id: employeeId },
                include: {
                    contracts: true,
                    bonuses: {
                        include: { bonus: true }
                    }
                }
            });
            if (!employee)
                continue;
            const activeContract = employee.contracts.find(c => !c.endDate || new Date(c.endDate) > new Date());
            if (!activeContract)
                continue;
            const baseSalary = activeContract.wage || 0;
            const startOfMonth = new Date(year, month, 1);
            const endOfMonth = new Date(year, month + 1, 0);
            let totalBonuses = 0;
            for (const eb of employee.bonuses) {
                const bonusStart = new Date(eb.startDate);
                const bonusEnd = eb.endDate ? new Date(eb.endDate) : null;
                if (bonusStart > endOfMonth)
                    continue;
                if (bonusEnd && bonusEnd < startOfMonth)
                    continue;
                let isValid = false;
                if (eb.frequency === 'PONCTUELLE') {
                    isValid = bonusStart.getMonth() === month && bonusStart.getFullYear() === year;
                }
                else {
                    isValid = true;
                }
                if (!isValid)
                    continue;
                let value = 0;
                if (eb.amount !== null && eb.amount !== undefined) {
                    value = eb.amount;
                }
                else if (eb.bonus) {
                    if (eb.bonus.calculationMode === 'FIXE') {
                        value = eb.bonus.amount || 0;
                    }
                    else {
                        value = (baseSalary * (eb.bonus.percentage || 0)) / 100;
                    }
                }
                totalBonuses += value;
            }
            const grossSalary = baseSalary + totalBonuses;
            const employeeContribsDetail = {};
            let totalEmployeeContribs = 0;
            for (const contrib of employeeContributions) {
                const amount = (grossSalary * contrib.rate) / 100;
                employeeContribsDetail[contrib.code] = {
                    name: contrib.name,
                    rate: contrib.rate,
                    amount: Math.round(amount * 100) / 100
                };
                totalEmployeeContribs += amount;
            }
            const taxableSalary = grossSalary - totalEmployeeContribs;
            const incomeTax = this.calculateIRG(taxableSalary);
            const netSalary = taxableSalary - incomeTax;
            const employerContribsDetail = {};
            let totalEmployerContribs = 0;
            for (const contrib of employerContributions) {
                const amount = (grossSalary * contrib.rate) / 100;
                employerContribsDetail[contrib.code] = {
                    name: contrib.name,
                    rate: contrib.rate,
                    amount: Math.round(amount * 100) / 100
                };
                totalEmployerContribs += amount;
            }
            const payslip = await this.prisma.payslip.upsert({
                where: {
                    employeeId_month_year: {
                        employeeId,
                        month,
                        year
                    }
                },
                update: {
                    baseSalary,
                    bonuses: totalBonuses,
                    grossSalary,
                    employeeContributions: employeeContribsDetail,
                    totalEmployeeContributions: Math.round(totalEmployeeContribs * 100) / 100,
                    taxableSalary: Math.round(taxableSalary * 100) / 100,
                    incomeTax: Math.round(incomeTax * 100) / 100,
                    netSalary: Math.round(netSalary * 100) / 100,
                    employerContributions: employerContribsDetail,
                    totalEmployerContributions: Math.round(totalEmployerContribs * 100) / 100,
                    status: 'DRAFT'
                },
                create: {
                    employeeId,
                    month,
                    year,
                    baseSalary,
                    bonuses: totalBonuses,
                    grossSalary,
                    employeeContributions: employeeContribsDetail,
                    totalEmployeeContributions: Math.round(totalEmployeeContribs * 100) / 100,
                    taxableSalary: Math.round(taxableSalary * 100) / 100,
                    incomeTax: Math.round(incomeTax * 100) / 100,
                    netSalary: Math.round(netSalary * 100) / 100,
                    employerContributions: employerContribsDetail,
                    totalEmployerContributions: Math.round(totalEmployerContribs * 100) / 100,
                    status: 'DRAFT'
                },
                include: {
                    employee: {
                        include: {
                            department: true,
                            position: true
                        }
                    }
                }
            });
            payslips.push(payslip);
        }
        return payslips;
    }
    calculateIRG(taxableSalary) {
        if (taxableSalary <= 30000)
            return 0;
        let irg = 0;
        if (taxableSalary > 30000 && taxableSalary <= 120000) {
            irg = (taxableSalary - 30000) * 0.20;
        }
        else if (taxableSalary > 120000 && taxableSalary <= 360000) {
            irg = 18000 + (taxableSalary - 120000) * 0.30;
        }
        else if (taxableSalary > 360000) {
            irg = 90000 + (taxableSalary - 360000) * 0.35;
        }
        return Math.round(irg * 100) / 100;
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
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.fontSize(20).text('BULLETIN DE PAIE', { align: 'center' });
            doc.moveDown();
            const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            doc.fontSize(12).text(`Période: ${monthNames[payslip.month - 1]} ${payslip.year}`, { align: 'center' });
            doc.moveDown(2);
            doc.fontSize(14).text('INFORMATIONS EMPLOYÉ', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(10);
            doc.text(`Nom: ${payslip.employee.lastName} ${payslip.employee.firstName}`);
            doc.text(`Matricule: ${payslip.employee.badgeId || 'N/A'}`);
            doc.text(`Poste: ${payslip.employee.position?.title || 'N/A'}`);
            doc.text(`Département: ${payslip.employee.department?.name || 'N/A'}`);
            if (payslip.employee.socialSecurityNumber) {
                doc.text(`N° Sécurité Sociale: ${payslip.employee.socialSecurityNumber}`);
            }
            doc.moveDown(2);
            doc.fontSize(14).text('DÉTAILS DE LA RÉMUNÉRATION', { underline: true });
            doc.moveDown(0.5);
            const lineY = doc.y;
            doc.fontSize(10);
            doc.text('Salaire de base:', 50, doc.y);
            doc.text(`${payslip.baseSalary.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
            doc.moveDown();
            if (payslip.bonuses > 0) {
                doc.text('Primes et indemnités:', 50, doc.y);
                doc.text(`${payslip.bonuses.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
                doc.moveDown();
            }
            doc.fontSize(11).font('Helvetica-Bold');
            doc.text('Salaire Brut:', 50, doc.y);
            doc.text(`${payslip.grossSalary.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
            doc.font('Helvetica').fontSize(10);
            doc.moveDown(1.5);
            doc.fontSize(14).text('COTISATIONS SALARIALES (déduites du brut)', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(10);
            const employeeContribs = payslip.employeeContributions || {};
            for (const [code, detail] of Object.entries(employeeContribs)) {
                const contrib = detail;
                doc.text(`${contrib.name} (${contrib.rate}%):`, 50, doc.y);
                doc.text(`${contrib.amount.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
                doc.moveDown();
            }
            doc.font('Helvetica-Bold');
            doc.text('Total Cotisations Salariales:', 50, doc.y);
            doc.text(`${payslip.totalEmployeeContributions.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
            doc.font('Helvetica');
            doc.moveDown(1.5);
            doc.fontSize(11).font('Helvetica-Bold');
            doc.text('Salaire Imposable:', 50, doc.y);
            doc.text(`${payslip.taxableSalary.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
            doc.font('Helvetica').fontSize(10);
            doc.moveDown(1.5);
            doc.fontSize(14).text('IMPÔT SUR LE REVENU GLOBAL (IRG)', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(10);
            doc.text('IRG retenu à la source:', 50, doc.y);
            doc.text(`${payslip.incomeTax.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
            doc.moveDown(2);
            doc.fontSize(16).font('Helvetica-Bold');
            doc.fillColor('#006400');
            doc.text('SALAIRE NET À PAYER:', 50, doc.y);
            doc.text(`${payslip.netSalary.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
            doc.fillColor('#000000');
            doc.font('Helvetica').fontSize(10);
            doc.moveDown(2);
            doc.fontSize(14).text('COTISATIONS PATRONALES (à titre informatif)', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(10);
            const employerContribs = payslip.employerContributions || {};
            for (const [code, detail] of Object.entries(employerContribs)) {
                const contrib = detail;
                doc.text(`${contrib.name} (${contrib.rate}%):`, 50, doc.y);
                doc.text(`${contrib.amount.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
                doc.moveDown();
            }
            doc.font('Helvetica-Bold');
            doc.text('Total Cotisations Patronales:', 50, doc.y);
            doc.text(`${payslip.totalEmployerContributions.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
            doc.font('Helvetica');
            doc.moveDown(2);
            doc.fontSize(8).fillColor('#666666');
            doc.text('Ce document est généré automatiquement par le système ERP Ghazal', { align: 'center' });
            doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
            doc.end();
        });
    }
};
exports.HrService = HrService;
exports.HrService = HrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HrService);
//# sourceMappingURL=hr.service.js.map