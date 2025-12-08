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
                    address: data.address,
                    phone: data.phone,
                    privateEmail: data.privateEmail
                }
            });
        }
        catch (error) {
            console.error('Error creating employee:', error);
            throw error;
        }
    }
    async updateEmployee(id, data) {
        const { id: _id, department, position, contracts, documents, leaves, positionHistory, manager, subordinates, coach, mentees, user, attendances, createdAt, updatedAt, ...updateData } = data;
        return this.prisma.employee.update({
            where: { id },
            data: {
                ...updateData,
                hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
                birthday: data.birthday ? new Date(data.birthday) : undefined,
            }
        });
    }
    async createContract(data) {
        return this.prisma.contract.create({
            data: {
                ...data,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
                trialPeriodEndDate: data.trialPeriodEndDate ? new Date(data.trialPeriodEndDate) : null,
            }
        });
    }
    async updateContract(id, data) {
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
                }
            }
        });
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
    async createPayrollBonus(data) {
        return this.prisma.payrollBonus.create({ data });
    }
    async findAllPayrollBonuses() {
        return this.prisma.payrollBonus.findMany();
    }
    async deletePayrollBonus(id) {
        return this.prisma.payrollBonus.delete({ where: { id } });
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
};
exports.HrService = HrService;
exports.HrService = HrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HrService);
//# sourceMappingURL=hr.service.js.map