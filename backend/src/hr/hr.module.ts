import { Module } from '@nestjs/common';
import { HrService } from './hr.service';
import { HrController } from './hr.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PayrollCalculationService } from './services/payroll-calculation.service';
import { PdfGenerationService } from './services/pdf-generation.service';
import { FormulaEngineService } from './services/formula-engine.service';
import { PayrollConfigService } from './services/payroll-config.service';
import { RubriqueCalculationService } from './services/rubrique-calculation.service';
import { SalaryStructureService } from './salary-structure.service';

import { RubriqueService } from './rubrique.service';
import { RubriqueController } from './rubrique.controller';
import { PayrollConfigController } from './payroll-config.controller';
import { SalaryStructureController } from './salary-structure.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    HrService,
    PayrollCalculationService,
    PdfGenerationService,
    FormulaEngineService,
    PayrollConfigService,
    RubriqueCalculationService,
    RubriqueService,
    SalaryStructureService
  ],
  controllers: [HrController, RubriqueController, PayrollConfigController, SalaryStructureController]
})
export class HrModule { }
