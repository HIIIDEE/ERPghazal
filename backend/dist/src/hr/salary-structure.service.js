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
exports.SalaryStructureService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SalaryStructureService = class SalaryStructureService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.salaryStructure.create({
            data,
        });
    }
    async findAll() {
        return this.prisma.salaryStructure.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: { rubriques: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(id) {
        const structure = await this.prisma.salaryStructure.findUnique({
            where: { id },
            include: {
                rubriques: {
                    include: {
                        rubrique: true,
                    },
                    orderBy: {
                        ordre: 'asc',
                    },
                },
            },
        });
        if (!structure) {
            throw new common_1.NotFoundException(`Structure with ID ${id} not found`);
        }
        return structure;
    }
    async update(id, data) {
        return this.prisma.salaryStructure.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return this.prisma.salaryStructure.delete({
            where: { id },
        });
    }
    async addRubriqueToStructure(structureId, rubriqueId, ordre) {
        const exists = await this.prisma.structureRubrique.findUnique({
            where: {
                salaryStructureId_rubriqueId: {
                    salaryStructureId: structureId,
                    rubriqueId,
                },
            },
        });
        if (exists) {
            return this.prisma.structureRubrique.update({
                where: {
                    salaryStructureId_rubriqueId: {
                        salaryStructureId: structureId,
                        rubriqueId,
                    },
                },
                data: { ordre },
            });
        }
        return this.prisma.structureRubrique.create({
            data: {
                salaryStructureId: structureId,
                rubriqueId,
                ordre,
            },
        });
    }
    async removeRubriqueFromStructure(structureId, rubriqueId) {
        return this.prisma.structureRubrique.delete({
            where: {
                salaryStructureId_rubriqueId: {
                    salaryStructureId: structureId,
                    rubriqueId,
                },
            },
        });
    }
};
exports.SalaryStructureService = SalaryStructureService;
exports.SalaryStructureService = SalaryStructureService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalaryStructureService);
//# sourceMappingURL=salary-structure.service.js.map