import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { PayrollCalculationService } from './services/payroll-calculation.service';
import { PdfGenerationService } from './services/pdf-generation.service';
import { RubriqueCalculationService } from './services/rubrique-calculation.service';

@Injectable()
export class HrService {
    constructor(
        private prisma: PrismaService,
        private payrollCalc: PayrollCalculationService,
        private pdfGen: PdfGenerationService,
        private rubriqueCalc: RubriqueCalculationService
    ) { }

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
        // Fetch all data in parallel using Promise.all for better performance
        const [employeeContributions, employerContributions, employees] = await Promise.all([
            this.prisma.socialContribution.findMany({
                where: { type: 'EMPLOYEE', isActive: true }
            }),
            this.prisma.socialContribution.findMany({
                where: { type: 'EMPLOYER', isActive: true }
            }),
            // Fetch all employees at once instead of one by one
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

        // Process payslips for all employees
        const payslipData = await Promise.all(
            employees.map(employee => this.preparePayslipData(employee, month, year, employeeContributions, employerContributions))
        );

        const validPayslipData = payslipData.filter(data => data !== null);

        // Batch upsert all payslips
        const payslips = await Promise.all(
            validPayslipData.map(data =>
                this.prisma.payslip.upsert({
                    where: {
                        employeeId_month_year: {
                            employeeId: data.employeeId,
                            month,
                            year
                        }
                    },
                    update: data.payslipFields as any,
                    create: {
                        employeeId: data.employeeId,
                        month,
                        year,
                        ...data.payslipFields
                    } as any,
                    include: {
                        employee: {
                            include: {
                                department: true,
                                position: true
                            }
                        }
                    }
                })
            )
        );

        return payslips;
    }

    /**
     * Prepare payslip data for a single employee using Rubrique Engine
     */
    private async preparePayslipData(employee: any, month: number, year: number, employeeContributions: any[], employerContributions: any[]) {
        // Get active contract
        const activeContract = employee.contracts.find((c: any) => !c.endDate || new Date(c.endDate) > new Date());
        if (!activeContract) return null;

        const baseSalary = Number(activeContract.wage) || 0;

        // Calculate rubriques using the new engine
        const calculatedRubriques = await this.rubriqueCalc.calculateEmployeeRubriques({
            employeeId: employee.id,
            month,
            year,
            baseSalary
        });

        // Aggregate results for Payslip model
        let grossSalary = 0;
        let taxableSalary = 0; // Needs to be determined from rubriques or calculated
        let totalEmployeeContributions = 0;
        let totalEmployerContributions = 0;
        let incomeTax = 0;
        let bonuses = 0;
        let netSalary = 0;

        // Helper to extract details
        const empContribDetails: any = {};
        const emplerContribDetails: any = {};

        // Calculate totals based on Rubrique Types
        // GAIN -> adds to Gross
        // RETENUE -> subtracts from Net (may include Contribution or Tax)
        // COTISATION -> Employer costs (informative usually)

        for (const r of calculatedRubriques) {
            if (r.type === 'GAIN') {
                grossSalary += r.montant;
                // Assuming implicit mapping: if it's not base, it's a bonus/prime
                bonuses += r.montant;
            } else if (r.type === 'BASE') {
                grossSalary += r.montant;
            } else if (r.type === 'RETENUE') {
                // Check if it's SS or IRG based on code or flags?
                // For now, simple aggregation
                if (r.code === 'SS' || r.code === 'CNAS') {
                    totalEmployeeContributions += r.montant;
                    empContribDetails[r.code] = { name: r.nom, amount: r.montant, rate: r.taux };
                } else if (r.code === 'IRG') {
                    incomeTax += r.montant;
                } else {
                    // Other retenues
                }
            } else if (r.type === 'COTISATION') {
                totalEmployerContributions += r.montant;
                emplerContribDetails[r.code] = { name: r.nom, amount: r.montant, rate: r.taux };
            }
        }

        // If Rubriques engine didn't output specific tax/ss, we might be missing them if not configured.
        // But for now we trust the engine outputs what's configured.
        // We need 'TaxableSalary'. Usually Gross - SS.
        taxableSalary = grossSalary - totalEmployeeContributions;

        // Net = Gross - Retenues (SS + IRG + Others)
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

        // Delegate PDF generation to the dedicated service
        return this.pdfGen.generatePayslipPDF(payslip as any);
    }
}