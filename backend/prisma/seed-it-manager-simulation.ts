import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Simulation pour Responsable IT\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Récupérer les données nécessaires
  const deptIT = await prisma.department.findFirst({
    where: { name: 'Technologies de l\'Information' }
  });

  if (!deptIT) {
    console.error('❌ Département Technologies de l\'Information non trouvé. Veuillez exécuter le seed principal d\'abord.');
    return;
  }

  const posIT = await prisma.position.findFirst({
    where: { title: 'Responsable IT' }
  });

  const structureCadre = await prisma.salaryStructure.findFirst({
    where: { name: 'Structure Cadre' }
  });

  if (!structureCadre) {
    console.error('❌ Structure Cadre non trouvée. Veuillez exécuter le seed principal d\'abord.');
    return;
  }

  const passwordHash = await bcrypt.hash('password123', 10);

  // Vérifier si l'utilisateur existe déjà
  let userIT = await prisma.user.findUnique({
    where: { email: 'responsable.it@ghazal.dz' },
    include: { employee: true }
  });

  // Vérifier aussi par workEmail
  let employeeIT = await prisma.employee.findUnique({
    where: { workEmail: 'responsable.it@ghazal.dz' }
  });

  if (userIT || employeeIT) {
    console.log('ℹ️  Données existantes trouvées, suppression pour recréer...\n');

    // Supprimer l'employé et ses relations
    const empId = userIT?.employee?.id || employeeIT?.id;
    if (empId) {
      await prisma.contract.deleteMany({ where: { employeeId: empId } });
      await prisma.employeeBonus.deleteMany({ where: { employeeId: empId } });
      await prisma.employeeRubrique.deleteMany({ where: { employeeId: empId } });
      await prisma.payslip.deleteMany({ where: { employeeId: empId } });
      await prisma.employee.delete({ where: { id: empId } });
    }

    // Supprimer l'utilisateur
    if (userIT) {
      await prisma.user.delete({ where: { id: userIT.id } });
    }
  }

  // Créer le Responsable IT
  console.log('👤 Création du profil Responsable IT...');
  userIT = await prisma.user.create({
    data: {
      email: 'responsable.it@ghazal.dz',
      password: passwordHash,
      roles: [Role.USER, Role.MANAGER],
      employee: {
        create: {
          firstName: 'Votre',
          lastName: 'Nom',
          workEmail: 'responsable.it@ghazal.dz',
          workPhone: '+213 23 XX XX XX',
          workMobile: '+213 5XX XX XX XX',
          jobTitle: 'Responsable IT',
          workLocation: 'Siège Social',
          workingHours: 'Standard 40h/semaine',
          timezone: 'Africa/Algiers',
          hireDate: new Date('2024-01-01'),
          employeeType: 'EMPLOYEE',
          departmentId: deptIT.id,
          positionId: posIT?.id,
          birthday: new Date('1990-01-01'),
          gender: 'MALE',
          nationality: 'Algérienne',
          maritalStatus: 'SINGLE',
          children: 0,
          placeOfBirth: 'Alger',
          countryOfBirth: 'Algérie',
          address: 'Alger',
          socialSecurityNumber: '1990010112345678',
          cnasAgency: 'CNAS Alger Centre',
          cnasStartDate: new Date('2024-01-01'),
          isHandicapped: false,
          cnasContribution: true,
          paymentMethod: 'VIREMENT',
          bankAccount: 'DZ58 XXXX XXXX XXXX XXXX XXXX XX',
          status: 'ACTIVE',
        },
      },
    },
    include: {
      employee: true,
    },
  });

  console.log('✓ Profil créé\n');

  // Créer le contrat
  console.log('📄 Création du contrat...');
  const contract = await prisma.contract.create({
    data: {
      reference: 'CDI-IT-2024-001',
      employeeId: userIT.employee!.id,
      type: 'CDI',
      status: 'RUNNING',
      cnasScheme: 'CADRE',
      fiscalScheme: 'IMPOSABLE',
      executiveStatus: 'CADRE',
      wage: 100000,
      hourlyWage: 100000 / 173.33,
      weeklyHours: 40,
      classification: 'Cadre',
      coefficient: '700',
      workSchedule: 'FIVE_DAYS',
      startDate: new Date('2024-01-01'),
      salaryStructureId: structureCadre.id,
    },
  });
  console.log('✓ Contrat créé\n');

  // Créer ou récupérer les primes
  console.log('🎁 Configuration des primes...');

  let primeResponsabilite = await prisma.payrollBonus.findFirst({
    where: { name: 'Prime de Responsabilité' }
  });

  if (!primeResponsabilite) {
    primeResponsabilite = await prisma.payrollBonus.create({
      data: {
        name: 'Prime de Responsabilité',
        calculationMode: 'FIXE',
        amount: 20000,
        description: 'Prime mensuelle de responsabilité',
      },
    });
  }

  let primeDisponibilite = await prisma.payrollBonus.findFirst({
    where: { name: 'Prime de Disponibilité' }
  });

  if (!primeDisponibilite) {
    primeDisponibilite = await prisma.payrollBonus.create({
      data: {
        name: 'Prime de Disponibilité',
        calculationMode: 'FIXE',
        amount: 20000,
        description: 'Prime mensuelle de disponibilité',
      },
    });
  }

  // Assigner les primes
  await prisma.employeeBonus.create({
    data: {
      employeeId: userIT.employee!.id,
      bonusId: primeResponsabilite.id,
      startDate: new Date('2024-01-01'),
      amount: 20000,
      frequency: 'MONTHLY',
    },
  });

  await prisma.employeeBonus.create({
    data: {
      employeeId: userIT.employee!.id,
      bonusId: primeDisponibilite.id,
      startDate: new Date('2024-01-01'),
      amount: 20000,
      frequency: 'MONTHLY',
    },
  });

  console.log('✓ Primes assignées\n');

  // Calculer le bulletin de paie
  console.log('💰 Calcul du bulletin de paie...\n');

  const baseSalary = 100000;
  const bonusTotal = 20000 + 20000; // Prime responsabilité + Prime disponibilité
  const grossSalary = baseSalary + bonusTotal;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 BULLETIN DE PAIE - RESPONSABLE IT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('💼 GAINS:');
  console.log('   Salaire de base:              100 000,00 DA');
  console.log('   Prime de Responsabilité:       20 000,00 DA');
  console.log('   Prime de Disponibilité:        20 000,00 DA');
  console.log('   ─────────────────────────────────────────────');
  console.log(`   SALAIRE BRUT:                 ${grossSalary.toLocaleString('fr-DZ')} DA\n`);

  // Récupérer les taux de cotisation
  const tauxSSSalarie = await prisma.payrollParameter.findFirst({
    where: { code: 'TAUX_SECURITE_SOCIALE_SALARIE' }
  });

  const tauxRetraiteSalarie = await prisma.payrollParameter.findFirst({
    where: { code: 'TAUX_RETRAITE_SALARIE' }
  });

  const tauxChomage = await prisma.payrollParameter.findFirst({
    where: { code: 'TAUX_ASSURANCE_CHOMAGE_SALARIE' }
  });

  const plafondCNAS = await prisma.payrollParameter.findFirst({
    where: { code: 'PLAFOND_CNAS' }
  });

  // Calculs des cotisations
  const plafond = Number(plafondCNAS?.valeur || 108000);
  const assietteCotisations = Math.min(grossSalary, plafond);

  const cotisationSS = assietteCotisations * (Number(tauxSSSalarie?.valeur || 9) / 100);
  const cotisationRetraite = assietteCotisations * (Number(tauxRetraiteSalarie?.valeur || 9) / 100);
  const cotisationChomage = assietteCotisations * (Number(tauxChomage?.valeur || 1.5) / 100);

  const totalCotisationsSalarie = cotisationSS + cotisationRetraite + cotisationChomage;

  console.log('📉 RETENUES (Cotisations Salariales):');
  console.log(`   Assiette de cotisation:       ${assietteCotisations.toLocaleString('fr-DZ')} DA (plafond: ${plafond.toLocaleString('fr-DZ')} DA)`);
  console.log(`   Sécurité Sociale (9%):         ${cotisationSS.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`);
  console.log(`   Retraite (9%):                 ${cotisationRetraite.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`);
  console.log(`   Assurance Chômage (1.5%):      ${cotisationChomage.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`);
  console.log('   ─────────────────────────────────────────────');
  console.log(`   Total cotisations:            ${totalCotisationsSalarie.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA\n`);

  const salaryAfterCotisations = grossSalary - totalCotisationsSalarie;

  console.log(`   SALAIRE APRÈS COTISATIONS:    ${salaryAfterCotisations.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA\n`);

  // Calcul de l'IRG
  console.log('💸 IMPÔT SUR LE REVENU (IRG):');

  const taxBrackets = await prisma.taxBracket.findMany({
    orderBy: { ordre: 'asc' }
  });

  let irg = 0;
  let remainingSalary = salaryAfterCotisations;

  for (const bracket of taxBrackets) {
    const minAmount = Number(bracket.minAmount);
    const maxAmount = bracket.maxAmount ? Number(bracket.maxAmount) : Infinity;
    const rate = Number(bracket.rate);
    const fixedAmount = Number(bracket.fixedAmount);

    if (remainingSalary > minAmount) {
      if (remainingSalary <= maxAmount) {
        // Dernière tranche applicable
        const taxableInBracket = remainingSalary - minAmount;
        irg = fixedAmount + (taxableInBracket * rate / 100);
        console.log(`   ${bracket.nom}: ${minAmount.toLocaleString('fr-DZ')} - ${maxAmount === Infinity ? 'infini' : maxAmount.toLocaleString('fr-DZ')} DA (${rate}%)`);
        console.log(`      Base: ${taxableInBracket.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`);
        console.log(`      IRG: ${fixedAmount.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} + ${(taxableInBracket * rate / 100).toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = ${irg.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`);
        break;
      }
    }
  }

  // Abattement (optionnel selon les règles algériennes)
  const hasChildren = false; // Vous pouvez ajuster selon votre situation
  let abattement = 0;

  if (hasChildren) {
    // Exemple d'abattement (à ajuster selon la législation)
    abattement = 1000; // par enfant par exemple
    console.log(`   Abattement:                   -${abattement.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`);
  }

  const irgFinal = Math.max(0, irg - abattement);

  console.log('   ─────────────────────────────────────────────');
  console.log(`   IRG à payer:                  ${irgFinal.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA\n`);

  const netSalary = salaryAfterCotisations - irgFinal;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`💵 SALAIRE NET À PAYER:           ${netSalary.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Cotisations patronales (à titre informatif)
  console.log('ℹ️  COTISATIONS PATRONALES (à la charge de l\'employeur):');

  const tauxSSPatronale = await prisma.payrollParameter.findFirst({
    where: { code: 'TAUX_SECURITE_SOCIALE_PATRONALE' }
  });

  const tauxRetraitePatronale = await prisma.payrollParameter.findFirst({
    where: { code: 'TAUX_RETRAITE_PATRONALE' }
  });

  const cotisationSSPatronale = assietteCotisations * (Number(tauxSSPatronale?.valeur || 26) / 100);
  const cotisationRetraitePatronale = assietteCotisations * (Number(tauxRetraitePatronale?.valeur || 10) / 100);

  const totalCotisationsPatronales = cotisationSSPatronale + cotisationRetraitePatronale;

  console.log(`   Sécurité Sociale (26%):       ${cotisationSSPatronale.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`);
  console.log(`   Retraite (10%):               ${cotisationRetraitePatronale.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`);
  console.log('   ─────────────────────────────────────────────');
  console.log(`   Total cotisations patronales: ${totalCotisationsPatronales.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA\n`);

  const totalCost = grossSalary + totalCotisationsPatronales;
  console.log(`💼 COÛT TOTAL POUR L'EMPLOYEUR:   ${totalCost.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA\n`);

  // Créer le bulletin de paie dans la base de données
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  await prisma.payslip.upsert({
    where: {
      employeeId_month_year: {
        employeeId: userIT.employee!.id,
        month,
        year,
      }
    },
    update: {
      baseSalary,
      bonuses: bonusTotal,
      grossSalary,
      employeeContributions: {
        SS_EMPLOYEE: cotisationSS,
        RETIREMENT_EMPLOYEE: cotisationRetraite,
        UNEMPLOYMENT_EMPLOYEE: cotisationChomage,
      },
      totalEmployeeContributions: totalCotisationsSalarie,
      taxableSalary: salaryAfterCotisations,
      incomeTax: irgFinal,
      netSalary,
      employerContributions: {
        SS_EMPLOYER: cotisationSSPatronale,
        RETIREMENT_EMPLOYER: cotisationRetraitePatronale,
      },
      totalEmployerContributions: totalCotisationsPatronales,
      status: 'DRAFT',
    },
    create: {
      employeeId: userIT.employee!.id,
      month,
      year,
      baseSalary,
      bonuses: bonusTotal,
      grossSalary,
      employeeContributions: {
        SS_EMPLOYEE: cotisationSS,
        RETIREMENT_EMPLOYEE: cotisationRetraite,
        UNEMPLOYMENT_EMPLOYEE: cotisationChomage,
      },
      totalEmployeeContributions: totalCotisationsSalarie,
      taxableSalary: salaryAfterCotisations,
      incomeTax: irgFinal,
      netSalary,
      employerContributions: {
        SS_EMPLOYER: cotisationSSPatronale,
        RETIREMENT_EMPLOYER: cotisationRetraitePatronale,
      },
      totalEmployerContributions: totalCotisationsPatronales,
      status: 'DRAFT',
    },
  });

  console.log('✅ Bulletin de paie enregistré dans la base de données\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 IDENTIFIANTS DE CONNEXION:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Email: responsable.it@ghazal.dz');
  console.log('🔑 Mot de passe: password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
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
