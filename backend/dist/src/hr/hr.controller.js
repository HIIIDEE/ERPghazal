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
exports.HrController = void 0;
const common_1 = require("@nestjs/common");
const hr_service_1 = require("./hr.service");
const create_employee_dto_1 = require("./dto/create-employee.dto");
let HrController = class HrController {
    hrService;
    constructor(hrService) {
        this.hrService = hrService;
    }
    create(createEmployeeDto) {
        return this.hrService.createEmployee(createEmployeeDto);
    }
    findAll() {
        return this.hrService.findAllEmployees();
    }
    update(id, updateEmployeeDto) {
        return this.hrService.updateEmployee(id, updateEmployeeDto);
    }
    findOne(id) {
        return this.hrService.findOneEmployee(id);
    }
    createContract(data) {
        return this.hrService.createContract(data);
    }
    updateContract(id, data) {
        return this.hrService.updateContract(id, data);
    }
    findAllPositions() {
        return this.hrService.findAllPositions();
    }
    createPosition(title) {
        return this.hrService.createPosition(title);
    }
    assignPosition(id, data) {
        return this.hrService.assignPosition(id, data.positionId, data.startDate);
    }
    findAllBonuses() {
        return this.hrService.findAllPayrollBonuses();
    }
    createBonus(body) {
        return this.hrService.createPayrollBonus(body);
    }
    deleteBonus(id) {
        return this.hrService.deletePayrollBonus(id);
    }
    createAbsence(data) {
        return this.hrService.createAbsence(data);
    }
    getAbsences(id) {
        return this.hrService.getAbsences(id);
    }
    deleteAbsence(id) {
        return this.hrService.deleteAbsence(id);
    }
    createAbsenceReason(data) {
        return this.hrService.createAbsenceReason(data);
    }
    getAbsenceReasons() {
        return this.hrService.getAbsenceReasons();
    }
    deleteAbsenceReason(id) {
        return this.hrService.deleteAbsenceReason(id);
    }
};
exports.HrController = HrController;
__decorate([
    (0, common_1.Post)('employees'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_employee_dto_1.CreateEmployeeDto]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('employees'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HrController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)('employees/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('employees/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('contracts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "createContract", null);
__decorate([
    (0, common_1.Put)('contracts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "updateContract", null);
__decorate([
    (0, common_1.Get)('positions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HrController.prototype, "findAllPositions", null);
__decorate([
    (0, common_1.Post)('positions'),
    __param(0, (0, common_1.Body)('title')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "createPosition", null);
__decorate([
    (0, common_1.Post)('employees/:id/assign-position'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "assignPosition", null);
__decorate([
    (0, common_1.Get)('bonuses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HrController.prototype, "findAllBonuses", null);
__decorate([
    (0, common_1.Post)('bonuses'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "createBonus", null);
__decorate([
    (0, common_1.Delete)('bonuses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "deleteBonus", null);
__decorate([
    (0, common_1.Post)('absences'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "createAbsence", null);
__decorate([
    (0, common_1.Get)('employees/:id/absences'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "getAbsences", null);
__decorate([
    (0, common_1.Delete)('absences/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "deleteAbsence", null);
__decorate([
    (0, common_1.Post)('absence-reasons'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "createAbsenceReason", null);
__decorate([
    (0, common_1.Get)('absence-reasons'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HrController.prototype, "getAbsenceReasons", null);
__decorate([
    (0, common_1.Delete)('absence-reasons/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "deleteAbsenceReason", null);
exports.HrController = HrController = __decorate([
    (0, common_1.Controller)('hr'),
    __metadata("design:paramtypes", [hr_service_1.HrService])
], HrController);
//# sourceMappingURL=hr.controller.js.map