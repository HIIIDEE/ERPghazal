import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

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
                    // Private
                    address: data.address,
                    phone: data.phone,
                    privateEmail: data.privateEmail
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
            ...updateData
        } = data;

        return this.prisma.employee.update({
            where: { id },
            data: {
                ...updateData,
                hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
                birthday: data.birthday ? new Date(data.birthday) : undefined,
            }
        });
    }

    async createContract(data: any) {
        return this.prisma.contract.create({
            data: {
                ...data,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
                trialPeriodEndDate: data.trialPeriodEndDate ? new Date(data.trialPeriodEndDate) : null,
            }
        });
    }

    async updateContract(id: string, data: any) {
        return this.prisma.contract.update({
            where: { id },
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                trialPeriodEndDate: data.trialPeriodEndDate ? new Date(data.trialPeriodEndDate) : undefined,
            }
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
                }
            }
        });
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
                    },
                    orderBy: { startDate: 'desc' }
                },
                documents: true,
                leaves: true,
                absences: true,
                positionHistory: {
                    include: { position: true },
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
}
