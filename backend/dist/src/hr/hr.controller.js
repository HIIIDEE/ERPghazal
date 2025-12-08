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
const create_payroll_bonus_dto_1 = require("./dto/create-payroll-bonus.dto");
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
    findAllContracts() {
        return this.hrService.findAllContracts();
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
    findAllDepartments() {
        return this.hrService.findAllDepartments();
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
    assignBonus(id, body) {
        return this.hrService.assignBonusToEmployee(id, body.bonusId, body);
    }
    removeBonus(id, bonusId) {
        return this.hrService.removeBonusFromEmployee(id, bonusId);
    }
    getEmployeeBonuses(id) {
        return this.hrService.getEmployeeBonuses(id);
    }
    generatePayslips(body) {
        return this.hrService.generatePayslips(body.employeeIds, body.month, body.year);
    }
    getPayslips(month, year) {
        const monthNum = month ? parseInt(month) : undefined;
        const yearNum = year ? parseInt(year) : undefined;
        return this.hrService.getPayslips(monthNum, yearNum);
    }
    deletePayslip(id) {
        return this.hrService.deletePayslip(id);
    }
    async downloadPayslipPDF(id, res) {
        const pdfBuffer = await this.hrService.generatePayslipPDF(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=bulletin-paie-${id}.pdf`,
            'Content-Length': pdfBuffer.length,
        });
        res.end(pdfBuffer);
    }
    getContributions() {
        return this.hrService.getAllContributions();
    }
    createContribution(data) {
        return this.hrService.createContribution(data);
    }
    updateContribution(id, data) {
        return this.hrService.updateContribution(id, data);
    }
    deleteContribution(id) {
        return this.hrService.deleteContribution(id);
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
    (0, common_1.Get)('contracts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HrController.prototype, "findAllContracts", null);
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
    (0, common_1.Get)('departments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HrController.prototype, "findAllDepartments", null);
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
    __metadata("design:paramtypes", [create_payroll_bonus_dto_1.CreatePayrollBonusDto]),
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
__decorate([
    (0, common_1.Post)('employees/:id/bonuses'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "assignBonus", null);
__decorate([
    (0, common_1.Delete)('employees/:id/bonuses/:bonusId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('bonusId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "removeBonus", null);
__decorate([
    (0, common_1.Get)('employees/:id/bonuses'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "getEmployeeBonuses", null);
__decorate([
    (0, common_1.Post)('payslips/generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "generatePayslips", null);
__decorate([
    (0, common_1.Get)('payslips'),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "getPayslips", null);
__decorate([
    (0, common_1.Delete)('payslips/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "deletePayslip", null);
__decorate([
    (0, common_1.Get)('payslips/:id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "downloadPayslipPDF", null);
__decorate([
    (0, common_1.Get)('contributions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HrController.prototype, "getContributions", null);
__decorate([
    (0, common_1.Post)('contributions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "createContribution", null);
__decorate([
    (0, common_1.Put)('contributions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "updateContribution", null);
__decorate([
    (0, common_1.Delete)('contributions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "deleteContribution", null);
exports.HrController = HrController = __decorate([
    (0, common_1.Controller)('hr'),
    __metadata("design:paramtypes", [hr_service_1.HrService])
], HrController);
//# sourceMappingURL=hr.controller.js.map