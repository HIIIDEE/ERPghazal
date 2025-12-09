/*
  Warnings:

  - You are about to drop the column `isCotisable` on the `PayrollBonus` table. All the data in the column will be lost.
  - Added the required column `calculationMode` to the `PayrollBonus` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('VIREMENT', 'ESPECE', 'CHEQUE');

-- CreateEnum
CREATE TYPE "CnasScheme" AS ENUM ('GENERAL', 'CADRE', 'NON_ASSUJETTI');

-- CreateEnum
CREATE TYPE "FiscalScheme" AS ENUM ('IMPOSABLE', 'EXONERE', 'ABATTEMENT_40');

-- CreateEnum
CREATE TYPE "ExecutiveStatus" AS ENUM ('CADRE', 'NON_CADRE', 'MAITRISE');

-- CreateEnum
CREATE TYPE "BonusCalculationMode" AS ENUM ('FIXE', 'POURCENTAGE');

-- CreateEnum
CREATE TYPE "BonusFrequency" AS ENUM ('MONTHLY', 'PONCTUELLE');

-- CreateEnum
CREATE TYPE "RubriqueType" AS ENUM ('GAIN', 'RETENUE', 'COTISATION', 'BASE');

-- CreateEnum
CREATE TYPE "RubriqueMontantType" AS ENUM ('FIXE', 'POURCENTAGE', 'FORMULE', 'SAISIE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ContractType" ADD VALUE 'CDD_RENOUVELABLE';
ALTER TYPE "ContractType" ADD VALUE 'JOURNALIER';
ALTER TYPE "ContractType" ADD VALUE 'STAGIAIRE';
ALTER TYPE "ContractType" ADD VALUE 'APPRENTI';
ALTER TYPE "ContractType" ADD VALUE 'INTERIMAIRE';

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "benefits" JSONB,
ADD COLUMN     "classification" TEXT,
ADD COLUMN     "cnasScheme" "CnasScheme" DEFAULT 'GENERAL',
ADD COLUMN     "coefficient" TEXT,
ADD COLUMN     "executiveStatus" "ExecutiveStatus" DEFAULT 'NON_CADRE',
ADD COLUMN     "fiscalScheme" "FiscalScheme" DEFAULT 'IMPOSABLE',
ADD COLUMN     "hourlyWage" DOUBLE PRECISION,
ADD COLUMN     "salaryStructureId" TEXT,
ADD COLUMN     "trialPeriodDuration" INTEGER,
ADD COLUMN     "weeklyHours" INTEGER;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "cnasAgency" TEXT,
ADD COLUMN     "cnasContribution" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cnasMutual" TEXT,
ADD COLUMN     "cnasRateCacobath" TEXT,
ADD COLUMN     "cnasRateHousing" TEXT,
ADD COLUMN     "cnasRatePatron" TEXT,
ADD COLUMN     "cnasRateSalary" TEXT,
ADD COLUMN     "cnasRateService" TEXT,
ADD COLUMN     "cnasRateSocial" TEXT,
ADD COLUMN     "cnasStartDate" TIMESTAMP(3),
ADD COLUMN     "isHandicapped" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "socialSecurityNumber" TEXT;

-- AlterTable
ALTER TABLE "PayrollBonus" DROP COLUMN "isCotisable",
ADD COLUMN     "amount" DOUBLE PRECISION,
ADD COLUMN     "calculationMode" "BonusCalculationMode" NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "percentage" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "SalaryStructure" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StructureRubrique" (
    "id" TEXT NOT NULL,
    "salaryStructureId" TEXT NOT NULL,
    "rubriqueId" INTEGER NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StructureRubrique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeBonus" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "bonusId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "amount" DOUBLE PRECISION,
    "frequency" "BonusFrequency" NOT NULL DEFAULT 'MONTHLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeBonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialContribution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payslip" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "bonuses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "employeeContributions" JSONB,
    "totalEmployeeContributions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxableSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "incomeTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "employerContributions" JSONB,
    "totalEmployerContributions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rubrique" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "RubriqueType" NOT NULL,
    "montantType" "RubriqueMontantType" NOT NULL,
    "valeur" DECIMAL(10,2),
    "formule" TEXT,
    "soumisCnas" BOOLEAN NOT NULL DEFAULT false,
    "soumisIrg" BOOLEAN NOT NULL DEFAULT false,
    "soumisChargeEmployeur" BOOLEAN NOT NULL DEFAULT false,
    "ordreAffichage" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rubrique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeRubrique" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "rubriqueId" INTEGER NOT NULL,
    "montantOverride" DECIMAL(10,2),
    "tauxOverride" DECIMAL(5,2),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeRubrique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollParameter" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "valeur" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxBracket" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "minAmount" DECIMAL(12,2) NOT NULL,
    "maxAmount" DECIMAL(12,2),
    "rate" DECIMAL(5,2) NOT NULL,
    "fixedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "ordre" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxBracket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalaryStructure_name_key" ON "SalaryStructure"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StructureRubrique_salaryStructureId_rubriqueId_key" ON "StructureRubrique"("salaryStructureId", "rubriqueId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialContribution_name_key" ON "SocialContribution"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SocialContribution_code_key" ON "SocialContribution"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_employeeId_month_year_key" ON "Payslip"("employeeId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Rubrique_code_key" ON "Rubrique"("code");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeRubrique_employeeId_rubriqueId_startDate_key" ON "EmployeeRubrique"("employeeId", "rubriqueId", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollParameter_code_key" ON "PayrollParameter"("code");

-- CreateIndex
CREATE INDEX "PayrollParameter_code_startDate_idx" ON "PayrollParameter"("code", "startDate");

-- CreateIndex
CREATE INDEX "TaxBracket_startDate_ordre_idx" ON "TaxBracket"("startDate", "ordre");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_salaryStructureId_fkey" FOREIGN KEY ("salaryStructureId") REFERENCES "SalaryStructure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureRubrique" ADD CONSTRAINT "StructureRubrique_salaryStructureId_fkey" FOREIGN KEY ("salaryStructureId") REFERENCES "SalaryStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureRubrique" ADD CONSTRAINT "StructureRubrique_rubriqueId_fkey" FOREIGN KEY ("rubriqueId") REFERENCES "Rubrique"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeBonus" ADD CONSTRAINT "EmployeeBonus_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeBonus" ADD CONSTRAINT "EmployeeBonus_bonusId_fkey" FOREIGN KEY ("bonusId") REFERENCES "PayrollBonus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeRubrique" ADD CONSTRAINT "EmployeeRubrique_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeRubrique" ADD CONSTRAINT "EmployeeRubrique_rubriqueId_fkey" FOREIGN KEY ("rubriqueId") REFERENCES "Rubrique"("id") ON DELETE CASCADE ON UPDATE CASCADE;
