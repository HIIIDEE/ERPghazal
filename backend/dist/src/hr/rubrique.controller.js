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
exports.RubriqueController = void 0;
const common_1 = require("@nestjs/common");
const rubrique_service_1 = require("./rubrique.service");
const client_1 = require("@prisma/client");
let RubriqueController = class RubriqueController {
    rubriqueService;
    constructor(rubriqueService) {
        this.rubriqueService = rubriqueService;
    }
    create(data) {
        return this.rubriqueService.create(data);
    }
    findAll() {
        return this.rubriqueService.findAll();
    }
    findOne(id) {
        return this.rubriqueService.findOne(id);
    }
    update(id, data) {
        return this.rubriqueService.update(id, data);
    }
    remove(id) {
        return this.rubriqueService.remove(id);
    }
};
exports.RubriqueController = RubriqueController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RubriqueController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RubriqueController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RubriqueController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RubriqueController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RubriqueController.prototype, "remove", null);
exports.RubriqueController = RubriqueController = __decorate([
    (0, common_1.Controller)('hr/rubriques'),
    __metadata("design:paramtypes", [rubrique_service_1.RubriqueService])
], RubriqueController);
//# sourceMappingURL=rubrique.controller.js.map