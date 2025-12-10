import { PrismaClient, CnasScheme } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface PayslipCalculation {
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  baseSalary: number;
  bonuses: number;
  grossSalary: number;
  employeeContributions: {
    [key: string]: number;
  };
  totalEmployeeContributions: number;
  taxableSalary: number;
  incomeTax: number;
  netSalary: number;
  employerContributions: {
    [key: string]: number;
  };
  totalEmployerContributions: number;
  totalCost: number;
}

async function calculatePayslip(
  employeeId: string,
  month: number,
  year: number
): Promise<PayslipCalculation | null> {
  // Récupérer l'employé avec ses relations
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      contracts: {
        where: {
          status: 'RUNNING',
        },
        orderBy: {
          startDate: 'desc',
        },
        take: 1,
      },
      bonuses: {
        where: {
          frequency: 'MONTHLY',
          startDate: {
            lte: new Date(year, month, 1),
          },
          OR: [
            { endDate: null },
            { endDate: { gte: new Date(year, month, 1) } },
          ],
        },
        include: {
          bonus: true,
        },
      },
    },
  });

  if (!employee || employee.contracts.length === 0) {
    console.log(`⚠️  Employé ${employeeId} n'a pas de contrat actif`);
    return null;
  }

  const contract = employee.contracts[0];
  const baseSalary = contract.wage;

  // Calculer les primes
  let bonusTotal = 0;
  for (const empBonus of employee.bonuses) {
    if (empBonus.amount) {
      bonusTotal += empBonus.amount;
    } else if (empBonus.bonus.amount) {
      bonusTotal += empBonus.bonus.amount;
    } else if (empBonus.bonus.percentage) {
      bonusTotal += (baseSalary * empBonus.bonus.percentage) / 100;
    }
  }

  const grossSalary = baseSalary + bonusTotal;

  // Récupérer les paramètres de paie
  const params = await prisma.payrollParameter.findMany({
    where: {
      startDate: { lte: new Date(year, month, 1) },
      OR: [
        { endDate: null },
        { endDate: { gte: new Date(year, month, 1) } },
      ],
    },
  });

  const getParamValue = (code: string): number => {
    const param = params.find((p) => p.code === code);
    return param ? Number(param.valeur) : 0;
  };

  const plafondCNAS = getParamValue('PLAFOND_CNAS');

  // Déterminer l'assiette des cotisations selon le schéma CNAS
  let assietteCotisations = grossSalary;

  if (contract.cnasScheme === 'CADRE' || contract.cnasScheme === 'GENERAL') {
    // Plafonnement pour cadres et général
    assietteCotisations = Math.min(grossSalary, plafondCNAS);
  }
  // Pour NON_ASSUJETTI, pas de cotisations

  const employeeContributions: { [key: string]: number } = {};
  let totalEmployeeContributions = 0;

  const employerContributions: { [key: string]: number } = {};
  let totalEmployerContributions = 0;

  if (contract.cnasScheme !== 'NON_ASSUJETTI' && employee.cnasContribution) {
    // Cotisations salariales
    const tauxSSSalarie = getParamValue('TAUX_SECURITE_SOCIALE_SALARIE');
    const tauxRetraiteSalarie = getParamValue('TAUX_RETRAITE_SALARIE');
    const tauxChomage = getParamValue('TAUX_ASSURANCE_CHOMAGE_SALARIE');

    employeeContributions['SS_EMPLOYEE'] = (assietteCotisations * tauxSSSalarie) / 100;
    employeeContributions['RETIREMENT_EMPLOYEE'] = (assietteCotisations * tauxRetraiteSalarie) / 100;
    employeeContributions['UNEMPLOYMENT_EMPLOYEE'] = (assietteCotisations * tauxChomage) / 100;

    totalEmployeeContributions =
      employeeContributions['SS_EMPLOYEE'] +
      employeeContributions['RETIREMENT_EMPLOYEE'] +
      employeeContributions['UNEMPLOYMENT_EMPLOYEE'];

    // Cotisations patronales
    const tauxSSPatronale = getParamValue('TAUX_SECURITE_SOCIALE_PATRONALE');
    const tauxRetraitePatronale = getParamValue('TAUX_RETRAITE_PATRONALE');

    employerContributions['SS_EMPLOYER'] = (assietteCotisations * tauxSSPatronale) / 100;
    employerContributions['RETIREMENT_EMPLOYER'] = (assietteCotisations * tauxRetraitePatronale) / 100;

    totalEmployerContributions =
      employerContributions['SS_EMPLOYER'] +
      employerContributions['RETIREMENT_EMPLOYER'];
  }

  const salaryAfterCotisations = grossSalary - totalEmployeeContributions;

  // Calcul de l'IRG
  let incomeTax = 0;

  if (contract.fiscalScheme === 'IMPOSABLE' || contract.fiscalScheme === 'ABATTEMENT_40') {
    const taxBrackets = await prisma.taxBracket.findMany({
      where: {
        startDate: { lte: new Date(year, month, 1) },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date(year, month, 1) } },
        ],
      },
      orderBy: { ordre: 'asc' },
    });

    for (const bracket of taxBrackets) {
      const minAmount = Number(bracket.minAmount);
      const maxAmount = bracket.maxAmount ? Number(bracket.maxAmount) : Infinity;
      const rate = Number(bracket.rate);
      const fixedAmount = Number(bracket.fixedAmount);

      if (salaryAfterCotisations > minAmount) {
        if (salaryAfterCotisations <= maxAmount) {
          const taxableInBracket = salaryAfterCotisations - minAmount;
          incomeTax = fixedAmount + (taxableInBracket * rate) / 100;
          break;
        }
      }
    }

    // Appliquer l'abattement si applicable
    if (contract.fiscalScheme === 'ABATTEMENT_40') {
      incomeTax = incomeTax * 0.6; // 40% d'abattement
    }
  } else if (contract.fiscalScheme === 'EXONERE') {
    incomeTax = 0;
  }

  const netSalary = salaryAfterCotisations - incomeTax;
  const totalCost = grossSalary + totalEmployerContributions;

  return {
    employeeId,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    month,
    year,
    baseSalary,
    bonuses: bonusTotal,
    grossSalary,
    employeeContributions,
    totalEmployeeContributions,
    taxableSalary: salaryAfterCotisations,
    incomeTax,
    netSalary,
    employerContributions,
    totalEmployerContributions,
    totalCost,
  };
}

async function generatePayslip(
  employeeId: string,
  month: number,
  year: number,
  displayDetails: boolean = true
): Promise<boolean> {
  const calculation = await calculatePayslip(employeeId, month, year);

  if (!calculation) {
    return false;
  }

  // Enregistrer dans la base de données
  await prisma.payslip.upsert({
    where: {
      employeeId_month_year: {
        employeeId,
        month,
        year,
      },
    },
    update: {
      baseSalary: calculation.baseSalary,
      bonuses: calculation.bonuses,
      grossSalary: calculation.grossSalary,
      employeeContributions: calculation.employeeContributions,
      totalEmployeeContributions: calculation.totalEmployeeContributions,
      taxableSalary: calculation.taxableSalary,
      incomeTax: calculation.incomeTax,
      netSalary: calculation.netSalary,
      employerContributions: calculation.employerContributions,
      totalEmployerContributions: calculation.totalEmployerContributions,
      status: 'DRAFT',
    },
    create: {
      employeeId,
      month,
      year,
      baseSalary: calculation.baseSalary,
      bonuses: calculation.bonuses,
      grossSalary: calculation.grossSalary,
      employeeContributions: calculation.employeeContributions,
      totalEmployeeContributions: calculation.totalEmployeeContributions,
      taxableSalary: calculation.taxableSalary,
      incomeTax: calculation.incomeTax,
      netSalary: calculation.netSalary,
      employerContributions: calculation.employerContributions,
      totalEmployerContributions: calculation.totalEmployerContributions,
      status: 'DRAFT',
    },
  });

  if (displayDetails) {
    displayPayslip(calculation);
  }

  return true;
}

function displayPayslip(calc: PayslipCalculation) {
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 BULLETIN DE PAIE - ${monthNames[calc.month]} ${calc.year}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👤 Employé: ${calc.employeeName}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('💼 GAINS:');
  console.log(`   Salaire de base:              ${calc.baseSalary.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA`);
  if (calc.bonuses > 0) {
    console.log(`   Primes:                       ${calc.bonuses.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA`);
  }
  console.log('   ─────────────────────────────────────────────');
  console.log(`   SALAIRE BRUT:                 ${calc.grossSalary.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA\n`);

  if (calc.totalEmployeeContributions > 0) {
    console.log('📉 RETENUES (Cotisations Salariales):');
    for (const [key, value] of Object.entries(calc.employeeContributions)) {
      const label = key.replace('_', ' ');
      console.log(`   ${label.padEnd(30)}${value.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA`);
    }
    console.log('   ─────────────────────────────────────────────');
    console.log(`   Total cotisations:            ${calc.totalEmployeeContributions.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA\n`);
  }

  console.log(`   SALAIRE IMPOSABLE:            ${calc.taxableSalary.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA\n`);

  if (calc.incomeTax > 0) {
    console.log('💸 IMPÔT SUR LE REVENU (IRG):');
    console.log(`   IRG:                          ${calc.incomeTax.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`💵 SALAIRE NET À PAYER:           ${calc.netSalary.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (calc.totalEmployerContributions > 0) {
    console.log('ℹ️  COTISATIONS PATRONALES:');
    for (const [key, value] of Object.entries(calc.employerContributions)) {
      const label = key.replace('_', ' ');
      console.log(`   ${label.padEnd(30)}${value.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA`);
    }
    console.log('   ─────────────────────────────────────────────');
    console.log(`   Total patronal:               ${calc.totalEmployerContributions.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA\n`);
  }

  console.log(`💼 COÛT TOTAL EMPLOYEUR:          ${calc.totalCost.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA\n`);
}

async function generatePayslipsForAllEmployees(month: number, year: number) {
  console.log(`\n🚀 Génération des bulletins de paie pour ${month + 1}/${year}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const employees = await prisma.employee.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      contracts: {
        where: {
          status: 'RUNNING',
        },
      },
    },
  });

  let successCount = 0;
  let failCount = 0;

  for (const employee of employees) {
    if (employee.contracts.length === 0) {
      console.log(`⚠️  ${employee.firstName} ${employee.lastName}: Pas de contrat actif`);
      failCount++;
      continue;
    }

    const success = await generatePayslip(employee.id, month, year, true);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RÉSUMÉ DE LA GÉNÉRATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Bulletins générés avec succès: ${successCount}`);
  if (failCount > 0) {
    console.log(`❌ Échecs: ${failCount}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function generatePayslipsByEmail(
  email: string,
  month: number,
  year: number
) {
  const employee = await prisma.employee.findUnique({
    where: { workEmail: email },
  });

  if (!employee) {
    console.log(`❌ Employé avec l'email ${email} non trouvé`);
    return;
  }

  await generatePayslip(employee.id, month, year, true);
}

async function main() {
  const args = process.argv.slice(2);

  // Déterminer le mois et l'année (par défaut: mois actuel)
  const currentDate = new Date();
  let month = currentDate.getMonth();
  let year = currentDate.getFullYear();

  // Options de la ligne de commande
  let mode: 'all' | 'single' = 'all';
  let email: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--month' && args[i + 1]) {
      month = parseInt(args[i + 1]) - 1; // Convertir 1-12 en 0-11
      i++;
    } else if (args[i] === '--year' && args[i + 1]) {
      year = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--email' && args[i + 1]) {
      mode = 'single';
      email = args[i + 1];
      i++;
    }
  }

  if (mode === 'all') {
    await generatePayslipsForAllEmployees(month, year);
  } else if (mode === 'single' && email) {
    await generatePayslipsByEmail(email, month, year);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
