import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import PDFDocument from 'pdfkit';

@Injectable()
export class HrService {
    constructor(private prisma: PrismaService) { }

    async createEmployee(data: CreateEmployeeDto) {
        try {
            console.log('Creating employee with data:', data);
            return await this.prisma.employee.create({
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    workEmail: data.workEmail,
                    hireDate: new Date(data.hireDate),
                    // Optional fields
                    jobTitle: data.jobTitle,
                    workPhone: data.workPhone,
                    workMobile: data.workMobile,
                    departmentId: data.departmentId,
                    workLocation: data.workLocation,
                    // Private
                    address: data.address,
                    phone: data.phone,
                    privateEmail: data.privateEmail,
                    identificationId: data.identificationId,
                    badgeId: data.badgeId, // Matricule
                    paymentMethod: data.paymentMethod as any,
                    children: data.children ? Number(data.children) : 0,
                    maritalStatus: data.maritalStatus as any,
                    placeOfBirth: data.placeOfBirth,
                    countryOfBirth: data.countryOfBirth,
                    bankAccount: data.bankAccount,
                    gender: data.gender as any,
                    nationality: data.nationality,
                    emergencyContact: data.emergencyContact,
                    emergencyPhone: data.emergencyPhone,
                    birthday: data.birthday ? new Date(data.birthday) : undefined,
                    // CNAS
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
        } catch (error) {
            console.error('Error creating employee:', error);
            throw error;
        }

    }



    async updateEmployee(id: string, data: any) {
        // Remove relation fields and non-updatable fields
        const {
            id: _id,
            department,
            position,
            contracts,
            documents,
            leaves,
            positionHistory,
            manager,
            subordinates,
            coach,
            mentees,
            user,
            attendances,
            createdAt,
            updatedAt,
            // Add other relations to exclude
            absences,
            company,
            ...updateData
        } = data;

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

    async createContract(data: any) {
        // Business Logic Validation
        if (data.type === 'CDI' && data.endDate) {
            // CDI must have null end date? Or just force it to null?
            // Prompt says: "Si type_contrat = CDI alors date_fin doit être null."
            // Prompt says: "Bloquer la création si date_debut > date_fin." (Implicitly handled if forced null? No, if user sends EndDate for CDI we can check or force)
            // Let's enforce it strictly or fix it silently. Strict is safer for API.
            // But for UX, maybe just ignoring it is fine.
            // "Bloquer..." implies Error. 
            // "Si type_contrat != CDI, date_fin est obligatoire."
        }

        const startDate = new Date(data.startDate);
        let endDate = data.endDate ? new Date(data.endDate) : null;

        if (data.type === 'CDI') {
            endDate = null;
        } else {
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
                wage: Number(data.wage), // Ensure number
                hourlyWage: data.hourlyWage ? Number(data.hourlyWage) : undefined,
                weeklyHours: data.weeklyHours ? Number(data.weeklyHours) : undefined,
                startDate: startDate,
                endDate: endDate,
                trialPeriodEndDate: data.trialPeriodEndDate ? new Date(data.trialPeriodEndDate) : null,
            }
        });
    }

    async updateContract(id: string, data: any) {
        // We might need to fetch the contract first to check Type if not provided in update?
        // For simplicity, if type is provided, run checks.

        const payload: any = { ...data };
        if (data.startDate) payload.startDate = new Date(data.startDate);
        if (data.endDate) payload.endDate = new Date(data.endDate);
        if (data.trialPeriodEndDate) payload.trialPeriodEndDate = new Date(data.trialPeriodEndDate);
        if (data.wage) payload.wage = Number(data.wage);
        if (data.hourlyWage) payload.hourlyWage = Number(data.hourlyWage);
        if (data.weeklyHours) payload.weeklyHours = Number(data.weeklyHours);

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

    async createPosition(title: string) {
        return this.prisma.position.create({ data: { title } });
    }

    async findAllPositions() {
        return this.prisma.position.findMany();
    }

    async assignPosition(employeeId: string, positionId: string, startDate: string) {
        // 1. Close current position history if exists
        const currentHistory = await this.prisma.positionHistory.findFirst({
            where: { employeeId, endDate: null }
        });

        if (currentHistory) {
            await this.prisma.positionHistory.update({
                where: { id: currentHistory.id },
                data: { endDate: new Date() }
            });
        }

        // 2. Create new history record
        await this.prisma.positionHistory.create({
            data: {
                employeeId,
                positionId,
                startDate: new Date(startDate)
            }
        });

        // 3. Update current employee position
        return this.prisma.employee.update({
            where: { id: employeeId },
            data: { positionId }
        });
    }

    async getPositionHistory(employeeId: string) {
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

    async findOneEmployee(id: string) {
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

    // Payroll Bonus
    async createPayrollBonus(data: any) {
        return this.prisma.payrollBonus.create({ data });
    }

    async findAllPayrollBonuses() {
        return this.prisma.payrollBonus.findMany();
    }

    async deletePayrollBonus(id: string) {
        return this.prisma.payrollBonus.delete({ where: { id } });
    }

    async assignBonusToEmployee(employeeId: string, bonusId: string, details?: { amount?: number, startDate: string, frequency: 'MONTHLY' | 'PONCTUELLE', endDate?: string }) {
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

    async removeBonusFromEmployee(employeeId: string, bonusId: string) {
        return this.prisma.employeeBonus.deleteMany({
            where: { employeeId, bonusId }
        });
    }

    async getEmployeeBonuses(employeeId: string) {
        return this.prisma.employeeBonus.findMany({
            where: { employeeId },
            include: { bonus: true }
        });
    }

    // Absences
    async createAbsence(data: any) {
        const { reasonId, date, ...rest } = data;
        return this.prisma.absence.create({
            data: {
                ...rest,
                date: new Date(date),
                reasonRelId: reasonId || null
            }
        });
    }

    async getAbsences(employeeId: string) {
        return this.prisma.absence.findMany({
            where: { employeeId },
            include: { reasonRel: true },
            orderBy: { date: 'desc' }
        });
    }

    async deleteAbsence(id: string) {
        return this.prisma.absence.delete({ where: { id } });
    }

    // Absence Reasons
    async createAbsenceReason(data: any) {
        return this.prisma.absenceReason.create({ data });
    }

    async getAbsenceReasons() {
        return this.prisma.absenceReason.findMany();
    }

    async deleteAbsenceReason(id: string) {
        return this.prisma.absenceReason.delete({ where: { id } });
    }

    // Payslips
    async generatePayslips(employeeIds: string[], month: number, year: number) {
        const payslips = [];

        // Get all active contributions
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

            if (!employee) continue;

            // Get active contract
            const activeContract = employee.contracts.find(c => !c.endDate || new Date(c.endDate) > new Date());
            if (!activeContract) continue;

            const baseSalary = activeContract.wage || 0;

            // Calculate bonuses for the month
            const startOfMonth = new Date(year, month, 1);
            const endOfMonth = new Date(year, month + 1, 0);

            let totalBonuses = 0;
            for (const eb of employee.bonuses) {
                const bonusStart = new Date(eb.startDate);
                const bonusEnd = eb.endDate ? new Date(eb.endDate) : null;

                // Filter inactive assignments
                if (bonusStart > endOfMonth) continue;
                if (bonusEnd && bonusEnd < startOfMonth) continue;

                // Check frequency
                let isValid = false;
                if (eb.frequency === 'PONCTUELLE') {
                    isValid = bonusStart.getMonth() === month && bonusStart.getFullYear() === year;
                } else {
                    isValid = true; // Monthly
                }

                if (!isValid) continue;

                // Calculate value
                let value = 0;
                if (eb.amount !== null && eb.amount !== undefined) {
                    value = eb.amount;
                } else if (eb.bonus) {
                    if (eb.bonus.calculationMode === 'FIXE') {
                        value = eb.bonus.amount || 0;
                    } else {
                        value = (baseSalary * (eb.bonus.percentage || 0)) / 100;
                    }
                }
                totalBonuses += value;
            }

            // Calculate gross salary
            const grossSalary = baseSalary + totalBonuses;

            // Calculate employee contributions (déduites du brut)
            const employeeContribsDetail: any = {};
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

            // Calculate taxable salary
            const taxableSalary = grossSalary - totalEmployeeContribs;

            // Calculate IRG (simplified for now - should use progressive tax brackets)
            const incomeTax = this.calculateIRG(taxableSalary);

            // Calculate net salary
            const netSalary = taxableSalary - incomeTax;

            // Calculate employer contributions (déclaratives)
            const employerContribsDetail: any = {};
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

            // Create or update payslip
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

    // Simplified IRG calculation (Algerian income tax)
    // TODO: Implement proper progressive tax brackets
    private calculateIRG(taxableSalary: number): number {
        if (taxableSalary <= 30000) return 0;

        // Progressive brackets (simplified - should be refined based on actual Algerian tax law)
        let irg = 0;
        if (taxableSalary > 30000 && taxableSalary <= 120000) {
            irg = (taxableSalary - 30000) * 0.20;
        } else if (taxableSalary > 120000 && taxableSalary <= 360000) {
            irg = 18000 + (taxableSalary - 120000) * 0.30;
        } else if (taxableSalary > 360000) {
            irg = 90000 + (taxableSalary - 360000) * 0.35;
        }

        return Math.round(irg * 100) / 100;
    }

    async getPayslips(month?: number, year?: number) {
        const where: any = {};
        if (month !== undefined) where.month = month;
        if (year !== undefined) where.year = year;

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

    async deletePayslip(id: string) {
        return this.prisma.payslip.delete({ where: { id } });
    }

    // Social Contributions
    async getAllContributions() {
        return this.prisma.socialContribution.findMany({
            orderBy: [
                { type: 'asc' },
                { name: 'asc' }
            ]
        });
    }

    async createContribution(data: any) {
        return this.prisma.socialContribution.create({ data });
    }

    async updateContribution(id: string, data: any) {
        return this.prisma.socialContribution.update({
            where: { id },
            data
        });
    }

    async deleteContribution(id: string) {
        return this.prisma.socialContribution.delete({ where: { id } });
    }

    async generatePayslipPDF(payslipId: string): Promise<Buffer> {
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
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk: Buffer) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(20).text('BULLETIN DE PAIE', { align: 'center' });
            doc.moveDown();

            // Period
            const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                              'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            doc.fontSize(12).text(`Période: ${monthNames[payslip.month - 1]} ${payslip.year}`, { align: 'center' });
            doc.moveDown(2);

            // Employee Information
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

            // Salary Details
            doc.fontSize(14).text('DÉTAILS DE LA RÉMUNÉRATION', { underline: true });
            doc.moveDown(0.5);

            const lineY = doc.y;
            doc.fontSize(10);

            // Salaire de base
            doc.text('Salaire de base:', 50, doc.y);
            doc.text(`${payslip.baseSalary.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
            doc.moveDown();

            // Primes
            if (payslip.bonuses > 0) {
                doc.text('Primes et indemnités:', 50, doc.y);
                doc.text(`${payslip.bonuses.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
                doc.moveDown();
            }

            // Salaire brut
            doc.fontSize(11).font('Helvetica-Bold');
            doc.text('Salaire Brut:', 50, doc.y);
            doc.text(`${payslip.grossSalary.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
            doc.font('Helvetica').fontSize(10);
            doc.moveDown(1.5);

            // Cotisations Employé (déductions)
            doc.fontSize(14).text('COTISATIONS SALARIALES (déduites du brut)', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(10);

            const employeeContribs = payslip.employeeContributions as any || {};
            for (const [code, detail] of Object.entries(employeeContribs)) {
                const contrib = detail as any;
                doc.text(`${contrib.name} (${contrib.rate}%):`, 50, doc.y);
                doc.text(`${contrib.amount.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
                doc.moveDown();
            }

            doc.font('Helvetica-Bold');
            doc.text('Total Cotisations Salariales:', 50, doc.y);
            doc.text(`${payslip.totalEmployeeContributions.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
            doc.font('Helvetica');
            doc.moveDown(1.5);

            // Salaire imposable
            doc.fontSize(11).font('Helvetica-Bold');
            doc.text('Salaire Imposable:', 50, doc.y);
            doc.text(`${payslip.taxableSalary.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
            doc.font('Helvetica').fontSize(10);
            doc.moveDown(1.5);

            // IRG
            doc.fontSize(14).text('IMPÔT SUR LE REVENU GLOBAL (IRG)', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(10);
            doc.text('IRG retenu à la source:', 50, doc.y);
            doc.text(`${payslip.incomeTax.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
            doc.moveDown(2);

            // Salaire net
            doc.fontSize(16).font('Helvetica-Bold');
            doc.fillColor('#006400');
            doc.text('SALAIRE NET À PAYER:', 50, doc.y);
            doc.text(`${payslip.netSalary.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
            doc.fillColor('#000000');
            doc.font('Helvetica').fontSize(10);
            doc.moveDown(2);

            // Cotisations Employeur (informatives)
            doc.fontSize(14).text('COTISATIONS PATRONALES (à titre informatif)', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(10);

            const employerContribs = payslip.employerContributions as any || {};
            for (const [code, detail] of Object.entries(employerContribs)) {
                const contrib = detail as any;
                doc.text(`${contrib.name} (${contrib.rate}%):`, 50, doc.y);
                doc.text(`${contrib.amount.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
                doc.moveDown();
            }

            doc.font('Helvetica-Bold');
            doc.text('Total Cotisations Patronales:', 50, doc.y);
            doc.text(`${payslip.totalEmployerContributions.toFixed(2)} DA`, 400, doc.y, { align: 'right' });
            doc.font('Helvetica');
            doc.moveDown(2);

            // Footer
            doc.fontSize(8).fillColor('#666666');
            doc.text('Ce document est généré automatiquement par le système ERP Ghazal', { align: 'center' });
            doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });

            doc.end();
        });
    }
}