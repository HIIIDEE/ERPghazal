"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrModule = void 0;
const common_1 = require("@nestjs/common");
const hr_service_1 = require("./hr.service");
const hr_controller_1 = require("./hr.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const payroll_calculation_service_1 = require("./services/payroll-calculation.service");
const pdf_generation_service_1 = require("./services/pdf-generation.service");
const formula_engine_service_1 = require("./services/formula-engine.service");
const payroll_config_service_1 = require("./services/payroll-config.service");
const rubrique_calculation_service_1 = require("./services/rubrique-calculation.service");
const salary_structure_service_1 = require("./salary-structure.service");
const rubrique_service_1 = require("./rubrique.service");
const rubrique_controller_1 = require("./rubrique.controller");
const payroll_config_controller_1 = require("./payroll-config.controller");
const salary_structure_controller_1 = require("./salary-structure.controller");
let HrModule = class HrModule {
};
exports.HrModule = HrModule;
exports.HrModule = HrModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [
            hr_service_1.HrService,
            payroll_calculation_service_1.PayrollCalculationService,
            pdf_generation_service_1.PdfGenerationService,
            formula_engine_service_1.FormulaEngineService,
            payroll_config_service_1.PayrollConfigService,
            rubrique_calculation_service_1.RubriqueCalculationService,
            rubrique_service_1.RubriqueService,
            salary_structure_service_1.SalaryStructureService
        ],
        controllers: [hr_controller_1.HrController, rubrique_controller_1.RubriqueController, payroll_config_controller_1.PayrollConfigController, salary_structure_controller_1.SalaryStructureController]
    })
], HrModule);
//# sourceMappingURL=hr.module.js.map