import { Module } from '@nestjs/common';
import { HrService } from './hr.service';
import { HrController } from './hr.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PayrollCalculationService } from './services/payroll-calculation.service';
import { PdfGenerationService } from './services/pdf-generation.service';

@Module({
  imports: [PrismaModule],
  providers: [
    HrService,
    PayrollCalculationService,
    PdfGenerationService
  ],
  controllers: [HrController]
})
export class HrModule { }
