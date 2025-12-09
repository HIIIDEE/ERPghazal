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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryStructureController = void 0;
const common_1 = require("@nestjs/common");
const salary_structure_service_1 = require("./salary-structure.service");
let SalaryStructureController = class SalaryStructureController {
    salaryStructureService;
    constructor(salaryStructureService) {
        this.salaryStructureService = salaryStructureService;
    }
    create(createDto) {
        return this.salaryStructureService.create(createDto);
    }
    findAll() {
        return this.salaryStructureService.findAll();
    }
    findOne(id) {
        return this.salaryStructureService.findOne(id);
    }
    update(id, updateDto) {
        return this.salaryStructureService.update(id, updateDto);
    }
    remove(id) {
        return this.salaryStructureService.remove(id);
    }
    addRubrique(id, body) {
        return this.salaryStructureService.addRubriqueToStructure(id, body.rubriqueId, body.ordre);
    }
    removeRubrique(id, rubriqueId) {
        return this.salaryStructureService.removeRubriqueFromStructure(id, rubriqueId);
    }
};
exports.SalaryStructureController = SalaryStructureController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalaryStructureController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SalaryStructureController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalaryStructureController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalaryStructureController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalaryStructureController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/rubriques'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalaryStructureController.prototype, "addRubrique", null);
__decorate([
    (0, common_1.Delete)(':id/rubriques/:rubriqueId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('rubriqueId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], SalaryStructureController.prototype, "removeRubrique", null);
exports.SalaryStructureController = SalaryStructureController = __decorate([
    (0, common_1.Controller)('hr/salary-structures'),
    __metadata("design:paramtypes", [salary_structure_service_1.SalaryStructureService])
], SalaryStructureController);
//# sourceMappingURL=salary-structure.controller.js.map