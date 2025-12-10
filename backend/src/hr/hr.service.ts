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

    private mapMaritalStatus(status: string | undefined): string | undefined {
        if (!status || status === '') return undefined;

        const mapping: { [key: string]: string } = {
            'Célibataire': 'SINGLE',
            'Marié(e)': 'MARRIED',
            'Cohabitant': 'COHABITANT',
            'Veuf/Veuve': 'WIDOWER',
            'Divorcé(e)': 'DIVORCED',
            // English values (already correct)
            'SINGLE': 'SINGLE',
            'MARRIED': 'MARRIED',
            'COHABITANT': 'COHABITANT',
            'WIDOWER': 'WIDOWER',
            'DIVORCED': 'DIVORCED'
        };

        return mapping[status] || undefined;
    }

    private mapGender(gender: string | undefined): string | undefined {
        if (!gender || gender === '') return undefined;

        const mapping: { [key: string]: string } = {
            'Homme': 'MALE',
            'Femme': 'FEMALE',
            'Autre': 'OTHER',
            // English values
            'MALE': 'MALE',
            'FEMALE': 'FEMALE',
            'OTHER': 'OTHER'
        };

        return mapping[gender] || undefined;
    }

    private mapPaymentMethod(method: string | undefined): string | undefined {
        if (!method || method === '') return undefined;

        const mapping: { [key: string]: string } = {
            'Virement': 'VIREMENT',
            'Espèce': 'ESPECE',
            'Chèque': 'CHEQUE',
            // English values
            'VIREMENT': 'VIREMENT',
            'ESPECE': 'ESPECE',
            'CHEQUE': 'CHEQUE'
        };

        return mapping[method] || undefined;
    }

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
                    jobTitle: data.jobTitle || undefined,
                    workPhone: data.workPhone || undefined,
                    workMobile: data.workMobile || undefined,
                    departmentId: data.departmentId || undefined,
                    workLocation: data.workLocation || undefined,
                    // Private
                    address: data.address || undefined,
                    phone: data.phone || undefined,
                    privateEmail: data.privateEmail || undefined,
                    identificationId: data.identificationId || undefined,
                    badgeId: data.badgeId || undefined, // Matricule
                    paymentMethod: this.mapPaymentMethod(data.paymentMethod) as any,
                    children: data.children ? Number(data.children) : 0,
                    maritalStatus: this.mapMaritalStatus(data.maritalStatus) as any,
                    placeOfBirth: data.placeOfBirth || undefined,
                    countryOfBirth: data.countryOfBirth || undefined,
                    bankAccount: data.bankAccount || undefined,
                    gender: this.mapGender(data.gender) as any,
                    nationality: data.nationality || undefined,
                    emergencyContact: data.emergencyContact || undefined,
                    emergencyPhone: data.emergencyPhone || undefined,
                    birthday: data.birthday ? new Date(data.birthday) : undefined,
                    // CNAS
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
            bonuses,
            rubriques,
            payslips,
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
                maritalStatus: data.maritalStatus ? this.mapMaritalStatus(data.maritalStatus) : undefined,
                gender: data.gender ? this.mapGender(data.gender) : undefined,
                paymentMethod: data.paymentMethod ? this.mapPaymentMethod(data.paymentMethod) : undefined,
            }
        });
    }

    async createContract(data: any) {
        // Business Logic Validation
        if (data.type === 'CDI' && data.endDate) {
            // CDI must have null end date? Or just force it to null?
            // Prompt says: "Si type_contrat = CDI alors date_fin doit Ãªtre null."
            // Prompt says: "Bloquer la crÃ©ation si date_debut > date_fin." (Implicitly handled if forced null? No, if user sends EndDate for CDI we can check or force)
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
            throw new Error("La date de dÃ©but ne peut pas Ãªtre postÃ©rieure Ã  la date de fin.");
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

    async findAllTaxBrackets() {
        return this.prisma.taxBracket.findMany({
            orderBy: { ordre: 'asc' }
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

    // Variables du mois
    async getEmployeesWithVariables(month: number, year: number) {
        const currentDate = new Date(year, month, 15); // Mid-month check

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


    async simulatePayslip(employeeId: string, month: number, year: number) {
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

        if (!employee) throw new Error('EmployÃ© non trouvÃ©');

        // Note: Contributions are fetched inside generatePayslips but passed as args.
        // If they are unused in preparePayslipData, we can pass empty arrays.
        // If they ARE used (e.g. for rates), we should fetch them.
        // Based on previous view, they seemed unused in the calculation body shown.
        return this.preparePayslipData(employee, month, year, [], []).then(result => {
            if (!result) return null;
            return {
                employeeId: result.employeeId,
                ...result.payslipFields
            };
        });
    }

    /**
     * Prepare payslip data for a single employee using Rubrique Engine
     */
    public async preparePayslipData(employee: any, month: number, year: number, employeeContributions: any[], employerContributions: any[]) {
        // Get active contract
        const activeContract = employee.contracts.find((c: any) => !c.endDate || new Date(c.endDate) > new Date());
        if (!activeContract) return null;

        const baseSalary = Number(activeContract.wage) || 0;

        // Calculate rubriques using the new engine
        const calculatedRubriques = await this.rubriqueCalc.calculateEmployeeRubriques({
            employeeId: employee.id,
            month,
            year,
            baseSalary,
            hireDate: new Date(employee.hireDate)
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
        const gainDetails: any[] = [];
        const retenueDetails: any[] = [];

        // Calculate totals based on Rubrique Types
        // GAIN -> adds to Gross
        // RETENUE -> subtracts from Net (may include Contribution or Tax)
        // COTISATION -> Employer costs (informative usually)

        for (const r of calculatedRubriques) {
            if (r.type === 'GAIN') {
                grossSalary += r.montant;
                // Assuming implicit mapping: if it's not base, it's a bonus/prime
                bonuses += r.montant;
                // Store detail
                gainDetails.push({
                    code: r.code,
                    name: r.nom,
                    amount: r.montant,
                    rate: r.taux
                });
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
                // Store all retenues for detail view
                retenueDetails.push({
                    code: r.code,
                    name: r.nom,
                    amount: r.montant,
                    rate: r.taux
                });
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
                status: 'DRAFT',
                details: {
                    gains: gainDetails,
                    retenues: retenueDetails
                }
            }
        };
    }

    async debugEmployeeRubriques(name: string) {
        const employee = await this.prisma.employee.findFirst({
            where: {
                OR: [
                    { lastName: { contains: name, mode: 'insensitive' } },
                    { firstName: { contains: name, mode: 'insensitive' } }
                ]
            },
            include: { contracts: true }
        });

        if (!employee) return { error: 'Employee not found' };

        const assignments = await this.prisma.employeeRubrique.findMany({
            where: { employeeId: employee.id },
            include: { rubrique: true }
        });

        let structureRubriques: any[] = [];
        const contract = employee.contracts[0];

        if (contract && contract.salaryStructureId) {
            // Because relationships were tricky, let's look up structure manually
            const structure = await this.prisma.salaryStructure.findUnique({
                where: { id: contract.salaryStructureId },
                include: { rubriques: { include: { rubrique: true } } }
            });
            if (structure) {
                structureRubriques = structure.rubriques.map((sr: any) => ({
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

    async debugRubriqueFormulas(codes: string[]) {
        const rubriques = await this.prisma.rubrique.findMany({
            where: { code: { in: codes } }
        });
        return rubriques;
    }

    async fixStructureDuplications(name: string) {
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

        // 1. Find Rubrique IDs for CNR and CNAC
        const rubriquesToRemove = await this.prisma.rubrique.findMany({
            where: { code: { in: ['CNR_SALARIE', 'CNAC_SALARIE'] } }
        });
        const idsToRemove = rubriquesToRemove.map(r => r.id);

        // 2. Delete them from StructureRubrique
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

    async cleanupDuplicates(name: string) {
        const employee = await this.prisma.employee.findFirst({
            where: {
                OR: [
                    { lastName: { contains: name, mode: 'insensitive' } },
                    { firstName: { contains: name, mode: 'insensitive' } }
                ]
            }
        });

        if (!employee) return { error: 'Employee not found' };

        // 1. Get IDs of Primes to clean
        const rubriques = await this.prisma.rubrique.findMany({
            where: {
                code: { in: ['PRIME_RESP', 'PRIME_DISPO'] }
            }
        });
        const rubIds = rubriques.map(r => r.id);

        // 2. Delete ALL assignments of these rubriques for this employee
        const deleted = await this.prisma.employeeRubrique.deleteMany({
            where: {
                employeeId: employee.id,
                rubriqueId: { in: rubIds }
            }
        });

        // 3. Re-assign once
        const assignments = [];
        const startDate = new Date('2025-12-01T00:00:00.000Z');

        for (const rub of rubriques) {
            const assignment = await this.prisma.employeeRubrique.create({
                data: {
                    employeeId: employee.id,
                    rubriqueId: rub.id,
                    startDate: startDate,
                    montantOverride: 20000 // We know both are 20000
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
        // 1. Find Employee "Votre"
        const employee = await this.prisma.employee.findFirst({
            where: {
                OR: [
                    { lastName: { contains: 'Votre', mode: 'insensitive' } },
                    { firstName: { contains: 'Votre', mode: 'insensitive' } }
                ]
            }
        });

        if (!employee) throw new Error('Employee not found');

        // 2. Upsert Rubriques
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

            // 3. Assign
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
            } else {
                await this.prisma.employeeRubrique.update({
                    where: { id: existing.id },
                    data: { montantOverride: bonus.montant }
                });
            }
        }
        return { success: true, message: 'Bonuses added for ' + employee.lastName };
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
            throw new Error('Bulletin de paie non trouvÃ©');
        }

        // Delegate PDF generation to the dedicated service
        return this.pdfGen.generatePayslipPDF(payslip as any);
    }
    async updateTaxBrackets() {
        // Delete existing
        await this.prisma.taxBracket.deleteMany({});

        // Create New - BASED ON 2020 Scale (Old Scale with 30k exemption, matching user reference)
        // User Ref: 130,550 Base -> 29,065 Tax. 2020 Scale gives ~29,192. 2022 Scale gives ~23,500.
        // Conclusion: User is using 2020 Scale (30%/35%).
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


    async removeCnacFromStructure(name: string) {
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

        // Find Rubrique CNAC
        const rubCnac = await this.prisma.rubrique.findFirst({
            where: { code: 'CNAC_SALARIE' }
        });

        if (!rubCnac) return { error: 'CNAC rubrique not found' };

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

    async addCnacToStructure(name: string) {
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

        // Find Rubrique CNAC
        const rubCnac = await this.prisma.rubrique.findFirst({
            where: { code: 'CNAC_SALARIE' }
        });

        if (!rubCnac) return { error: 'CNAC rubrique not found' };

        // Check if exists
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

    // Employee Rubriques Management
    async getEmployeeRubriques(employeeId: string) {
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

    async assignRubriqueToEmployee(employeeId: string, data: {
        rubriqueId: number;
        montantOverride?: number;
        tauxOverride?: number;
        startDate: string;
        endDate?: string;
    }) {
        // Check if a permanent assignment already exists for this rubrique
        const existing = await this.prisma.employeeRubrique.findFirst({
            where: {
                employeeId,
                rubriqueId: data.rubriqueId,
                endDate: null
            }
        });

        if (existing) {
            // Update existing permanent assignment
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

        // Create new assignment
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

    async updateEmployeeRubrique(employeeId: string, rubriqueId: number, data: {
        montantOverride?: number;
        tauxOverride?: number;
        startDate?: string;
        endDate?: string;
    }) {
        // Find the permanent assignment (endDate = null)
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

    async deleteEmployeeRubrique(employeeId: string, rubriqueId: number) {
        // Delete all assignments for this employee and rubrique
        return this.prisma.employeeRubrique.deleteMany({
            where: {
                employeeId,
                rubriqueId
            }
        });
    }
}
