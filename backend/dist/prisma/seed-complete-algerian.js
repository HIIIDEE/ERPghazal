"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🚀 Démarrage du seed complet avec données algériennes...\n');
    console.log('📊 Création des paramètres de paie...');
    const startDate = new Date('2024-01-01');
    await prisma.payrollParameter.createMany({
        data: [
            {
                code: 'SNMG',
                nom: 'Salaire National Minimum Garanti',
                valeur: 20000,
                description: 'SNMG en vigueur depuis 2024',
                startDate,
            },
            {
                code: 'PLAFOND_CNAS',
                nom: 'Plafond mensuel CNAS',
                valeur: 108000,
                description: 'Plafond de calcul des cotisations CNAS',
                startDate,
            },
            {
                code: 'TAUX_SECURITE_SOCIALE_SALARIE',
                nom: 'Taux SS salarié',
                valeur: 9,
                description: 'Taux de cotisation sécurité sociale part salarié (%)',
                startDate,
            },
            {
                code: 'TAUX_SECURITE_SOCIALE_PATRONALE',
                nom: 'Taux SS patronal',
                valeur: 26,
                description: 'Taux de cotisation sécurité sociale part patronale (%)',
                startDate,
            },
            {
                code: 'ABATTEMENT_IRG',
                nom: 'Abattement forfaitaire IRG',
                valeur: 0,
                description: 'Abattement appliqué avant calcul IRG',
                startDate,
            },
        ],
    });
    console.log('💰 Création des tranches IRG...');
    await prisma.taxBracket.createMany({
        data: [
            {
                nom: 'Tranche 1 - Exonéré',
                minAmount: 0,
                maxAmount: 30000,
                rate: 0,
                fixedAmount: 0,
                ordre: 1,
                startDate,
            },
            {
                nom: 'Tranche 2 - 20%',
                minAmount: 30001,
                maxAmount: 120000,
                rate: 20,
                fixedAmount: 0,
                ordre: 2,
                startDate,
            },
            {
                nom: 'Tranche 3 - 30%',
                minAmount: 120001,
                maxAmount: 360000,
                rate: 30,
                fixedAmount: 18000,
                ordre: 3,
                startDate,
            },
            {
                nom: 'Tranche 4 - 35%',
                minAmount: 360001,
                maxAmount: 999999999,
                rate: 35,
                fixedAmount: 90000,
                ordre: 4,
                startDate,
            },
        ],
    });
    console.log('🏥 Création des cotisations sociales CNAS...');
    await prisma.socialContribution.createMany({
        data: [
            {
                name: 'Sécurité Sociale (CNAS - Salarié)',
                code: 'CNAS_SS_EMPLOYEE',
                type: 'EMPLOYEE',
                rate: 9.0,
                description: 'Cotisation CNAS sécurité sociale part salarié',
                isActive: true,
            },
            {
                name: 'Retraite (CNR - Salarié)',
                code: 'CNR_RETIREMENT_EMPLOYEE',
                type: 'EMPLOYEE',
                rate: 9.0,
                description: 'Cotisation CNR retraite part salarié',
                isActive: true,
            },
            {
                name: 'Assurance Chômage (CNAC - Salarié)',
                code: 'CNAC_UNEMPLOYMENT_EMPLOYEE',
                type: 'EMPLOYEE',
                rate: 1.0,
                description: 'Cotisation CNAC assurance chômage part salarié',
                isActive: true,
            },
            {
                name: 'Sécurité Sociale (CNAS - Employeur)',
                code: 'CNAS_SS_EMPLOYER',
                type: 'EMPLOYER',
                rate: 12.5,
                description: 'Cotisation CNAS sécurité sociale part patronale',
                isActive: true,
            },
            {
                name: 'Retraite (CNR - Employeur)',
                code: 'CNR_RETIREMENT_EMPLOYER',
                type: 'EMPLOYER',
                rate: 10.0,
                description: 'Cotisation CNR retraite part patronale',
                isActive: true,
            },
            {
                name: 'Assurance Chômage (CNAC - Employeur)',
                code: 'CNAC_UNEMPLOYMENT_EMPLOYER',
                type: 'EMPLOYER',
                rate: 1.0,
                description: 'Cotisation CNAC assurance chômage part patronale',
                isActive: true,
            },
            {
                name: 'Accidents du Travail',
                code: 'WORK_ACCIDENT',
                type: 'EMPLOYER',
                rate: 1.25,
                description: 'Cotisation accidents du travail et maladies professionnelles',
                isActive: true,
            },
            {
                name: 'Œuvres Sociales',
                code: 'SOCIAL_WORKS',
                type: 'EMPLOYER',
                rate: 1.0,
                description: 'Contribution aux œuvres sociales',
                isActive: true,
            },
            {
                name: 'Taxe Formation Professionnelle',
                code: 'PROFESSIONAL_TRAINING_TAX',
                type: 'EMPLOYER',
                rate: 1.0,
                description: 'Taxe de formation et apprentissage',
                isActive: true,
            },
        ],
    });
    console.log('🏢 Création des départements...');
    const deptIT = await prisma.department.create({
        data: { name: 'Technologies de l\'Information' },
    });
    const deptRH = await prisma.department.create({
        data: { name: 'Ressources Humaines' },
    });
    const deptCompta = await prisma.department.create({
        data: { name: 'Comptabilité et Finance' },
    });
    const deptCommercial = await prisma.department.create({
        data: { name: 'Commercial et Marketing' },
    });
    const deptProduction = await prisma.department.create({
        data: { name: 'Production' },
    });
    const deptLogistique = await prisma.department.create({
        data: { name: 'Logistique et Achats' },
    });
    console.log('👔 Création des positions...');
    const posDirecteur = await prisma.position.create({ data: { title: 'Directeur Général' } });
    const posDRH = await prisma.position.create({ data: { title: 'Directeur RH' } });
    const posChefCompta = await prisma.position.create({ data: { title: 'Chef Comptable' } });
    const posResponsableIT = await prisma.position.create({ data: { title: 'Responsable IT' } });
    const posDevSenior = await prisma.position.create({ data: { title: 'Développeur Senior' } });
    const posDevJunior = await prisma.position.create({ data: { title: 'Développeur Junior' } });
    const posRHManager = await prisma.position.create({ data: { title: 'Gestionnaire RH' } });
    const posComptable = await prisma.position.create({ data: { title: 'Comptable' } });
    const posCommercial = await prisma.position.create({ data: { title: 'Commercial' } });
    const posChefProduction = await prisma.position.create({ data: { title: 'Chef de Production' } });
    const posOuvrier = await prisma.position.create({ data: { title: 'Ouvrier Qualifié' } });
    const posAssistant = await prisma.position.create({ data: { title: 'Assistant Administratif' } });
    console.log('🏖️ Création des motifs d\'absence...');
    await prisma.absenceReason.createMany({
        data: [
            { name: 'Congé annuel', isAuthorized: true },
            { name: 'Congé maladie', isAuthorized: true },
            { name: 'Congé maternité', isAuthorized: true },
            { name: 'Congé paternité', isAuthorized: true },
            { name: 'Congé sans solde', isAuthorized: false },
            { name: 'Formation professionnelle', isAuthorized: true },
            { name: 'Absence injustifiée', isAuthorized: false },
            { name: 'Mission professionnelle', isAuthorized: true },
        ],
    });
    console.log('📋 Création des rubriques de paie...');
    const rubriques = await Promise.all([
        prisma.rubrique.create({
            data: {
                code: 'SALAIRE_BASE',
                nom: 'Salaire de Base',
                type: 'GAIN',
                montantType: 'FIXE',
                valeur: 0,
                soumisCnas: true,
                soumisIrg: true,
                soumisChargeEmployeur: true,
                ordreAffichage: 1,
                isActive: true,
            },
        }),
        prisma.rubrique.create({
            data: {
                code: 'PRIME_ANCIENNETE',
                nom: 'Prime d\'Ancienneté',
                type: 'GAIN',
                montantType: 'POURCENTAGE',
                valeur: 0,
                soumisCnas: true,
                soumisIrg: true,
                soumisChargeEmployeur: true,
                ordreAffichage: 2,
                isActive: true,
            },
        }),
        prisma.rubrique.create({
            data: {
                code: 'PRIME_RENDEMENT',
                nom: 'Prime de Rendement',
                type: 'GAIN',
                montantType: 'FIXE',
                valeur: 0,
                soumisCnas: true,
                soumisIrg: true,
                soumisChargeEmployeur: true,
                ordreAffichage: 3,
                isActive: true,
            },
        }),
        prisma.rubrique.create({
            data: {
                code: 'PRIME_PANIER',
                nom: 'Prime de Panier',
                type: 'GAIN',
                montantType: 'FIXE',
                valeur: 2000,
                soumisCnas: false,
                soumisIrg: false,
                soumisChargeEmployeur: false,
                ordreAffichage: 4,
                isActive: true,
            },
        }),
        prisma.rubrique.create({
            data: {
                code: 'PRIME_TRANSPORT',
                nom: 'Prime de Transport',
                type: 'GAIN',
                montantType: 'FIXE',
                valeur: 3000,
                soumisCnas: false,
                soumisIrg: false,
                soumisChargeEmployeur: false,
                ordreAffichage: 5,
                isActive: true,
            },
        }),
        prisma.rubrique.create({
            data: {
                code: 'PRIME_RESPONSABILITE',
                nom: 'Prime de Responsabilité',
                type: 'GAIN',
                montantType: 'FIXE',
                valeur: 0,
                soumisCnas: true,
                soumisIrg: true,
                soumisChargeEmployeur: true,
                ordreAffichage: 6,
                isActive: true,
            },
        }),
        prisma.rubrique.create({
            data: {
                code: 'HEURES_SUP',
                nom: 'Heures Supplémentaires',
                type: 'GAIN',
                montantType: 'SAISIE',
                valeur: 0,
                soumisCnas: true,
                soumisIrg: true,
                soumisChargeEmployeur: true,
                ordreAffichage: 7,
                isActive: true,
            },
        }),
        prisma.rubrique.create({
            data: {
                code: 'CNAS_SALARIE',
                nom: 'Cotisation CNAS Salarié',
                type: 'RETENUE',
                montantType: 'POURCENTAGE',
                valeur: 9,
                soumisCnas: false,
                soumisIrg: false,
                soumisChargeEmployeur: false,
                ordreAffichage: 20,
                isActive: true,
            },
        }),
        prisma.rubrique.create({
            data: {
                code: 'CNR_SALARIE',
                nom: 'Cotisation CNR Salarié',
                type: 'RETENUE',
                montantType: 'POURCENTAGE',
                valeur: 9,
                soumisCnas: false,
                soumisIrg: false,
                soumisChargeEmployeur: false,
                ordreAffichage: 21,
                isActive: true,
            },
        }),
        prisma.rubrique.create({
            data: {
                code: 'CNAC_SALARIE',
                nom: 'Cotisation CNAC Salarié',
                type: 'RETENUE',
                montantType: 'POURCENTAGE',
                valeur: 1,
                soumisCnas: false,
                soumisIrg: false,
                soumisChargeEmployeur: false,
                ordreAffichage: 22,
                isActive: true,
            },
        }),
        prisma.rubrique.create({
            data: {
                code: 'IRG',
                nom: 'IRG (Impôt sur le Revenu Global)',
                type: 'RETENUE',
                montantType: 'FORMULE',
                valeur: 0,
                formule: 'IRG_PROGRESSIF',
                soumisCnas: false,
                soumisIrg: false,
                soumisChargeEmployeur: false,
                ordreAffichage: 23,
                isActive: true,
            },
        }),
        prisma.rubrique.create({
            data: {
                code: 'RETENUE_ABSENCE',
                nom: 'Retenue sur Absence',
                type: 'RETENUE',
                montantType: 'SAISIE',
                valeur: 0,
                soumisCnas: false,
                soumisIrg: false,
                soumisChargeEmployeur: false,
                ordreAffichage: 24,
                isActive: true,
            },
        }),
        prisma.rubrique.create({
            data: {
                code: 'AVANCE_SALAIRE',
                nom: 'Avance sur Salaire',
                type: 'RETENUE',
                montantType: 'SAISIE',
                valeur: 0,
                soumisCnas: false,
                soumisIrg: false,
                soumisChargeEmployeur: false,
                ordreAffichage: 25,
                isActive: true,
            },
        }),
    ]);
    console.log('🏗️ Création des structures salariales...');
    const structureCadre = await prisma.salaryStructure.create({
        data: {
            name: 'Structure Cadre',
            description: 'Structure salariale pour les cadres avec primes de responsabilité',
            isActive: true,
        },
    });
    const structureAgent = await prisma.salaryStructure.create({
        data: {
            name: 'Structure Agent Maîtrise',
            description: 'Structure salariale pour les agents de maîtrise',
            isActive: true,
        },
    });
    const structureOuvrier = await prisma.salaryStructure.create({
        data: {
            name: 'Structure Ouvrier',
            description: 'Structure salariale pour les ouvriers',
            isActive: true,
        },
    });
    const rubSalaireBase = rubriques.find(r => r.code === 'SALAIRE_BASE');
    const rubPrimeAnciennete = rubriques.find(r => r.code === 'PRIME_ANCIENNETE');
    const rubPrimePanier = rubriques.find(r => r.code === 'PRIME_PANIER');
    const rubPrimeTransport = rubriques.find(r => r.code === 'PRIME_TRANSPORT');
    const rubPrimeResponsabilite = rubriques.find(r => r.code === 'PRIME_RESPONSABILITE');
    const rubCnasSalarie = rubriques.find(r => r.code === 'CNAS_SALARIE');
    const rubCnrSalarie = rubriques.find(r => r.code === 'CNR_SALARIE');
    const rubCnacSalarie = rubriques.find(r => r.code === 'CNAC_SALARIE');
    const rubIrg = rubriques.find(r => r.code === 'IRG');
    await prisma.structureRubrique.createMany({
        data: [
            { salaryStructureId: structureCadre.id, rubriqueId: rubSalaireBase.id, ordre: 1 },
            { salaryStructureId: structureCadre.id, rubriqueId: rubPrimeAnciennete.id, ordre: 2 },
            { salaryStructureId: structureCadre.id, rubriqueId: rubPrimeResponsabilite.id, ordre: 3 },
            { salaryStructureId: structureCadre.id, rubriqueId: rubPrimePanier.id, ordre: 4 },
            { salaryStructureId: structureCadre.id, rubriqueId: rubPrimeTransport.id, ordre: 5 },
            { salaryStructureId: structureCadre.id, rubriqueId: rubCnasSalarie.id, ordre: 20 },
            { salaryStructureId: structureCadre.id, rubriqueId: rubIrg.id, ordre: 23 },
        ],
    });
    await prisma.structureRubrique.createMany({
        data: [
            { salaryStructureId: structureAgent.id, rubriqueId: rubSalaireBase.id, ordre: 1 },
            { salaryStructureId: structureAgent.id, rubriqueId: rubPrimeAnciennete.id, ordre: 2 },
            { salaryStructureId: structureAgent.id, rubriqueId: rubPrimePanier.id, ordre: 4 },
            { salaryStructureId: structureAgent.id, rubriqueId: rubPrimeTransport.id, ordre: 5 },
            { salaryStructureId: structureAgent.id, rubriqueId: rubCnasSalarie.id, ordre: 20 },
            { salaryStructureId: structureAgent.id, rubriqueId: rubIrg.id, ordre: 23 },
        ],
    });
    await prisma.structureRubrique.createMany({
        data: [
            { salaryStructureId: structureOuvrier.id, rubriqueId: rubSalaireBase.id, ordre: 1 },
            { salaryStructureId: structureOuvrier.id, rubriqueId: rubPrimePanier.id, ordre: 4 },
            { salaryStructureId: structureOuvrier.id, rubriqueId: rubPrimeTransport.id, ordre: 5 },
            { salaryStructureId: structureOuvrier.id, rubriqueId: rubCnasSalarie.id, ordre: 20 },
            { salaryStructureId: structureOuvrier.id, rubriqueId: rubIrg.id, ordre: 23 },
        ],
    });
    console.log('🎁 Création des primes...');
    await prisma.payrollBonus.createMany({
        data: [
            {
                name: 'Prime de Performance Annuelle',
                calculationMode: 'POURCENTAGE',
                percentage: 10,
                description: 'Prime annuelle de performance basée sur l\'évaluation',
            },
            {
                name: 'Prime de Présence',
                calculationMode: 'FIXE',
                amount: 5000,
                description: 'Prime mensuelle de présence (zéro absence)',
            },
            {
                name: 'Prime d\'Objectif',
                calculationMode: 'FIXE',
                amount: 10000,
                description: 'Prime mensuelle d\'atteinte des objectifs',
            },
            {
                name: 'Prime de 13ème Mois',
                calculationMode: 'POURCENTAGE',
                percentage: 100,
                description: 'Prime de fin d\'année équivalente à un mois de salaire',
            },
        ],
    });
    console.log('👥 Création des utilisateurs et employés...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const user1 = await prisma.user.create({
        data: {
            email: 'directeur@ghazal.dz',
            password: passwordHash,
            roles: [client_1.Role.ADMIN, client_1.Role.MANAGER],
            employee: {
                create: {
                    firstName: 'Karim',
                    lastName: 'BENALI',
                    workEmail: 'directeur@ghazal.dz',
                    workPhone: '+213 23 45 67 89',
                    workMobile: '+213 555 12 34 56',
                    jobTitle: 'Directeur Général',
                    workLocation: 'Siège Social - Alger',
                    workingHours: 'Standard 40h/semaine',
                    timezone: 'Africa/Algiers',
                    hireDate: new Date('2015-01-15'),
                    employeeType: 'EMPLOYEE',
                    departmentId: deptRH.id,
                    positionId: posDirecteur.id,
                    birthday: new Date('1975-03-20'),
                    gender: 'MALE',
                    nationality: 'Algérienne',
                    maritalStatus: 'MARRIED',
                    children: 3,
                    placeOfBirth: 'Alger',
                    countryOfBirth: 'Algérie',
                    address: '15 Rue Didouche Mourad, Alger',
                    phone: '+213 21 65 43 21',
                    privateEmail: 'karim.benali@gmail.com',
                    identificationId: '1975032012345',
                    socialSecurityNumber: '1975032012345678',
                    cnasAgency: 'CNAS Alger Centre',
                    cnasStartDate: new Date('2015-01-15'),
                    isHandicapped: false,
                    cnasContribution: true,
                    paymentMethod: 'VIREMENT',
                    bankAccount: 'DZ58 0001 2345 6789 0123 4567 89',
                    status: 'ACTIVE',
                },
            },
        },
        include: {
            employee: true,
        },
    });
    await prisma.contract.create({
        data: {
            reference: 'CDI-2015-001',
            employeeId: user1.employee.id,
            type: 'CDI',
            status: 'RUNNING',
            cnasScheme: 'CADRE',
            fiscalScheme: 'IMPOSABLE',
            executiveStatus: 'CADRE',
            wage: 150000,
            hourlyWage: 150000 / 173.33,
            weeklyHours: 40,
            classification: 'Cadre Supérieur',
            coefficient: '1000',
            workSchedule: 'FIVE_DAYS',
            startDate: new Date('2015-01-15'),
            salaryStructureId: structureCadre.id,
        },
    });
    const user2 = await prisma.user.create({
        data: {
            email: 'drh@ghazal.dz',
            password: passwordHash,
            roles: [client_1.Role.HR, client_1.Role.MANAGER],
            employee: {
                create: {
                    firstName: 'Fatima',
                    lastName: 'MEZIANE',
                    workEmail: 'drh@ghazal.dz',
                    workPhone: '+213 23 45 67 90',
                    workMobile: '+213 555 98 76 54',
                    jobTitle: 'Directrice des Ressources Humaines',
                    workLocation: 'Siège Social - Alger',
                    workingHours: 'Standard 40h/semaine',
                    timezone: 'Africa/Algiers',
                    hireDate: new Date('2016-03-01'),
                    employeeType: 'EMPLOYEE',
                    departmentId: deptRH.id,
                    positionId: posDRH.id,
                    managerId: user1.employee.id,
                    birthday: new Date('1980-06-15'),
                    gender: 'FEMALE',
                    nationality: 'Algérienne',
                    maritalStatus: 'MARRIED',
                    children: 2,
                    placeOfBirth: 'Oran',
                    countryOfBirth: 'Algérie',
                    address: '32 Avenue de l\'Indépendance, Oran',
                    phone: '+213 41 23 45 67',
                    privateEmail: 'fatima.meziane@gmail.com',
                    identificationId: '1980061523456',
                    socialSecurityNumber: '1980061523456789',
                    cnasAgency: 'CNAS Oran',
                    cnasStartDate: new Date('2016-03-01'),
                    isHandicapped: false,
                    cnasContribution: true,
                    paymentMethod: 'VIREMENT',
                    bankAccount: 'DZ58 0002 3456 7890 1234 5678 90',
                    status: 'ACTIVE',
                },
            },
        },
        include: {
            employee: true,
        },
    });
    await prisma.contract.create({
        data: {
            reference: 'CDI-2016-002',
            employeeId: user2.employee.id,
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
            startDate: new Date('2016-03-01'),
            salaryStructureId: structureCadre.id,
        },
    });
    const emp3 = await prisma.employee.create({
        data: {
            firstName: 'Ahmed',
            lastName: 'CHERIF',
            workEmail: 'comptable@ghazal.dz',
            workPhone: '+213 23 45 67 91',
            workMobile: '+213 555 11 22 33',
            jobTitle: 'Chef Comptable',
            workLocation: 'Siège Social - Alger',
            workingHours: 'Standard 40h/semaine',
            timezone: 'Africa/Algiers',
            hireDate: new Date('2017-09-01'),
            employeeType: 'EMPLOYEE',
            departmentId: deptCompta.id,
            positionId: posChefCompta.id,
            managerId: user1.employee.id,
            birthday: new Date('1982-11-10'),
            gender: 'MALE',
            nationality: 'Algérienne',
            maritalStatus: 'SINGLE',
            children: 0,
            placeOfBirth: 'Constantine',
            countryOfBirth: 'Algérie',
            address: '78 Rue Larbi Ben M\'Hidi, Constantine',
            phone: '+213 31 98 76 54',
            privateEmail: 'ahmed.cherif@yahoo.com',
            identificationId: '1982111034567',
            socialSecurityNumber: '1982111034567890',
            cnasAgency: 'CNAS Constantine',
            cnasStartDate: new Date('2017-09-01'),
            isHandicapped: false,
            cnasContribution: true,
            paymentMethod: 'VIREMENT',
            bankAccount: 'DZ58 0003 4567 8901 2345 6789 01',
            status: 'ACTIVE',
        },
    });
    await prisma.contract.create({
        data: {
            reference: 'CDI-2017-003',
            employeeId: emp3.id,
            type: 'CDI',
            status: 'RUNNING',
            cnasScheme: 'CADRE',
            fiscalScheme: 'IMPOSABLE',
            executiveStatus: 'CADRE',
            wage: 85000,
            hourlyWage: 85000 / 173.33,
            weeklyHours: 40,
            classification: 'Cadre',
            coefficient: '650',
            workSchedule: 'FIVE_DAYS',
            startDate: new Date('2017-09-01'),
            salaryStructureId: structureCadre.id,
        },
    });
    const emp4 = await prisma.employee.create({
        data: {
            firstName: 'Yasmine',
            lastName: 'KHELIFI',
            workEmail: 'responsable.it@ghazal.dz',
            workPhone: '+213 23 45 67 92',
            workMobile: '+213 555 44 55 66',
            jobTitle: 'Responsable IT',
            workLocation: 'Siège Social - Alger',
            workingHours: 'Standard 40h/semaine',
            timezone: 'Africa/Algiers',
            hireDate: new Date('2018-01-15'),
            employeeType: 'EMPLOYEE',
            departmentId: deptIT.id,
            positionId: posResponsableIT.id,
            managerId: user1.employee.id,
            birthday: new Date('1985-04-25'),
            gender: 'FEMALE',
            nationality: 'Algérienne',
            maritalStatus: 'SINGLE',
            children: 0,
            placeOfBirth: 'Alger',
            countryOfBirth: 'Algérie',
            address: '12 Cité des 120 Logements, Bab Ezzouar',
            phone: '+213 21 55 66 77',
            privateEmail: 'yasmine.khelifi@hotmail.com',
            identificationId: '1985042545678',
            socialSecurityNumber: '1985042545678901',
            cnasAgency: 'CNAS Alger Est',
            cnasStartDate: new Date('2018-01-15'),
            isHandicapped: false,
            cnasContribution: true,
            paymentMethod: 'VIREMENT',
            bankAccount: 'DZ58 0004 5678 9012 3456 7890 12',
            status: 'ACTIVE',
        },
    });
    await prisma.contract.create({
        data: {
            reference: 'CDI-2018-004',
            employeeId: emp4.id,
            type: 'CDI',
            status: 'RUNNING',
            cnasScheme: 'CADRE',
            fiscalScheme: 'IMPOSABLE',
            executiveStatus: 'CADRE',
            wage: 90000,
            hourlyWage: 90000 / 173.33,
            weeklyHours: 40,
            classification: 'Cadre',
            coefficient: '680',
            workSchedule: 'FIVE_DAYS',
            startDate: new Date('2018-01-15'),
            salaryStructureId: structureCadre.id,
        },
    });
    const emp5 = await prisma.employee.create({
        data: {
            firstName: 'Mehdi',
            lastName: 'BOUZID',
            workEmail: 'mehdi.bouzid@ghazal.dz',
            workPhone: '+213 23 45 67 93',
            workMobile: '+213 555 77 88 99',
            jobTitle: 'Développeur Senior Full Stack',
            workLocation: 'Siège Social - Alger',
            workingHours: 'Standard 40h/semaine',
            timezone: 'Africa/Algiers',
            hireDate: new Date('2019-06-01'),
            employeeType: 'EMPLOYEE',
            departmentId: deptIT.id,
            positionId: posDevSenior.id,
            managerId: emp4.id,
            birthday: new Date('1988-08-12'),
            gender: 'MALE',
            nationality: 'Algérienne',
            maritalStatus: 'MARRIED',
            children: 1,
            placeOfBirth: 'Annaba',
            countryOfBirth: 'Algérie',
            address: '45 Rue de la Liberté, Annaba',
            phone: '+213 38 87 65 43',
            privateEmail: 'mehdi.bouzid@gmail.com',
            identificationId: '1988081256789',
            socialSecurityNumber: '1988081256789012',
            cnasAgency: 'CNAS Annaba',
            cnasStartDate: new Date('2019-06-01'),
            isHandicapped: false,
            cnasContribution: true,
            paymentMethod: 'VIREMENT',
            bankAccount: 'DZ58 0005 6789 0123 4567 8901 23',
            status: 'ACTIVE',
        },
    });
    await prisma.contract.create({
        data: {
            reference: 'CDI-2019-005',
            employeeId: emp5.id,
            type: 'CDI',
            status: 'RUNNING',
            cnasScheme: 'CADRE',
            fiscalScheme: 'IMPOSABLE',
            executiveStatus: 'MAITRISE',
            wage: 70000,
            hourlyWage: 70000 / 173.33,
            weeklyHours: 40,
            classification: 'Agent de Maîtrise',
            coefficient: '550',
            workSchedule: 'FIVE_DAYS',
            startDate: new Date('2019-06-01'),
            salaryStructureId: structureAgent.id,
        },
    });
    const emp6 = await prisma.employee.create({
        data: {
            firstName: 'Amina',
            lastName: 'SLIMANI',
            workEmail: 'amina.slimani@ghazal.dz',
            workPhone: '+213 23 45 67 94',
            workMobile: '+213 555 00 11 22',
            jobTitle: 'Développeur Junior',
            workLocation: 'Siège Social - Alger',
            workingHours: 'Standard 40h/semaine',
            timezone: 'Africa/Algiers',
            hireDate: new Date('2022-09-01'),
            employeeType: 'EMPLOYEE',
            departmentId: deptIT.id,
            positionId: posDevJunior.id,
            managerId: emp4.id,
            coachId: emp5.id,
            birthday: new Date('1997-02-28'),
            gender: 'FEMALE',
            nationality: 'Algérienne',
            maritalStatus: 'SINGLE',
            children: 0,
            placeOfBirth: 'Tizi Ouzou',
            countryOfBirth: 'Algérie',
            address: '23 Cité Nouvelle Ville, Tizi Ouzou',
            phone: '+213 26 21 43 65',
            privateEmail: 'amina.slimani@outlook.com',
            identificationId: '1997022867890',
            socialSecurityNumber: '1997022867890123',
            cnasAgency: 'CNAS Tizi Ouzou',
            cnasStartDate: new Date('2022-09-01'),
            isHandicapped: false,
            cnasContribution: true,
            paymentMethod: 'VIREMENT',
            bankAccount: 'DZ58 0006 7890 1234 5678 9012 34',
            status: 'ACTIVE',
        },
    });
    await prisma.contract.create({
        data: {
            reference: 'CDI-2022-006',
            employeeId: emp6.id,
            type: 'CDI',
            status: 'RUNNING',
            cnasScheme: 'GENERAL',
            fiscalScheme: 'IMPOSABLE',
            executiveStatus: 'NON_CADRE',
            wage: 45000,
            hourlyWage: 45000 / 173.33,
            weeklyHours: 40,
            classification: 'Agent d\'Exécution',
            coefficient: '400',
            workSchedule: 'FIVE_DAYS',
            trialPeriodDuration: 180,
            trialPeriodEndDate: new Date('2023-03-01'),
            startDate: new Date('2022-09-01'),
            salaryStructureId: structureAgent.id,
        },
    });
    const emp7 = await prisma.employee.create({
        data: {
            firstName: 'Sofiane',
            lastName: 'LAHLOU',
            workEmail: 'sofiane.lahlou@ghazal.dz',
            workPhone: '+213 23 45 67 95',
            workMobile: '+213 555 33 44 55',
            jobTitle: 'Gestionnaire RH',
            workLocation: 'Siège Social - Alger',
            workingHours: 'Standard 40h/semaine',
            timezone: 'Africa/Algiers',
            hireDate: new Date('2020-04-01'),
            employeeType: 'EMPLOYEE',
            departmentId: deptRH.id,
            positionId: posRHManager.id,
            managerId: user2.employee.id,
            birthday: new Date('1990-09-05'),
            gender: 'MALE',
            nationality: 'Algérienne',
            maritalStatus: 'MARRIED',
            children: 2,
            placeOfBirth: 'Blida',
            countryOfBirth: 'Algérie',
            address: '56 Rue des Roses, Blida',
            phone: '+213 25 43 21 87',
            privateEmail: 'sofiane.lahlou@gmail.com',
            identificationId: '1990090578901',
            socialSecurityNumber: '1990090578901234',
            cnasAgency: 'CNAS Blida',
            cnasStartDate: new Date('2020-04-01'),
            isHandicapped: false,
            cnasContribution: true,
            paymentMethod: 'VIREMENT',
            bankAccount: 'DZ58 0007 8901 2345 6789 0123 45',
            status: 'ACTIVE',
        },
    });
    await prisma.contract.create({
        data: {
            reference: 'CDI-2020-007',
            employeeId: emp7.id,
            type: 'CDI',
            status: 'RUNNING',
            cnasScheme: 'GENERAL',
            fiscalScheme: 'IMPOSABLE',
            executiveStatus: 'MAITRISE',
            wage: 55000,
            hourlyWage: 55000 / 173.33,
            weeklyHours: 40,
            classification: 'Agent de Maîtrise',
            coefficient: '480',
            workSchedule: 'FIVE_DAYS',
            startDate: new Date('2020-04-01'),
            salaryStructureId: structureAgent.id,
        },
    });
    const emp8 = await prisma.employee.create({
        data: {
            firstName: 'Naima',
            lastName: 'HADJ',
            workEmail: 'naima.hadj@ghazal.dz',
            workPhone: '+213 23 45 67 96',
            workMobile: '+213 555 66 77 88',
            jobTitle: 'Comptable',
            workLocation: 'Siège Social - Alger',
            workingHours: 'Standard 40h/semaine',
            timezone: 'Africa/Algiers',
            hireDate: new Date('2021-02-01'),
            employeeType: 'EMPLOYEE',
            departmentId: deptCompta.id,
            positionId: posComptable.id,
            managerId: emp3.id,
            birthday: new Date('1992-07-18'),
            gender: 'FEMALE',
            nationality: 'Algérienne',
            maritalStatus: 'SINGLE',
            children: 0,
            placeOfBirth: 'Sétif',
            countryOfBirth: 'Algérie',
            address: '89 Avenue du 1er Novembre, Sétif',
            phone: '+213 36 87 65 43',
            privateEmail: 'naima.hadj@yahoo.com',
            identificationId: '1992071889012',
            socialSecurityNumber: '1992071889012345',
            cnasAgency: 'CNAS Sétif',
            cnasStartDate: new Date('2021-02-01'),
            isHandicapped: false,
            cnasContribution: true,
            paymentMethod: 'VIREMENT',
            bankAccount: 'DZ58 0008 9012 3456 7890 1234 56',
            status: 'ACTIVE',
        },
    });
    await prisma.contract.create({
        data: {
            reference: 'CDI-2021-008',
            employeeId: emp8.id,
            type: 'CDI',
            status: 'RUNNING',
            cnasScheme: 'GENERAL',
            fiscalScheme: 'IMPOSABLE',
            executiveStatus: 'NON_CADRE',
            wage: 50000,
            hourlyWage: 50000 / 173.33,
            weeklyHours: 40,
            classification: 'Agent d\'Exécution',
            coefficient: '450',
            workSchedule: 'FIVE_DAYS',
            startDate: new Date('2021-02-01'),
            salaryStructureId: structureAgent.id,
        },
    });
    const emp9 = await prisma.employee.create({
        data: {
            firstName: 'Rachid',
            lastName: 'BOUMEDIENE',
            workEmail: 'rachid.boumediene@ghazal.dz',
            workPhone: '+213 23 45 67 97',
            workMobile: '+213 555 99 00 11',
            jobTitle: 'Commercial Senior',
            workLocation: 'Agence Oran',
            workingHours: 'Standard 40h/semaine',
            timezone: 'Africa/Algiers',
            hireDate: new Date('2019-11-15'),
            employeeType: 'EMPLOYEE',
            departmentId: deptCommercial.id,
            positionId: posCommercial.id,
            birthday: new Date('1986-12-30'),
            gender: 'MALE',
            nationality: 'Algérienne',
            maritalStatus: 'MARRIED',
            children: 3,
            placeOfBirth: 'Oran',
            countryOfBirth: 'Algérie',
            address: '101 Boulevard Zabana, Oran',
            phone: '+213 41 98 76 54',
            privateEmail: 'rachid.boumediene@gmail.com',
            identificationId: '1986123090123',
            socialSecurityNumber: '1986123090123456',
            cnasAgency: 'CNAS Oran',
            cnasStartDate: new Date('2019-11-15'),
            isHandicapped: false,
            cnasContribution: true,
            paymentMethod: 'VIREMENT',
            bankAccount: 'DZ58 0009 0123 4567 8901 2345 67',
            status: 'ACTIVE',
        },
    });
    await prisma.contract.create({
        data: {
            reference: 'CDI-2019-009',
            employeeId: emp9.id,
            type: 'CDI',
            status: 'RUNNING',
            cnasScheme: 'GENERAL',
            fiscalScheme: 'IMPOSABLE',
            executiveStatus: 'MAITRISE',
            wage: 60000,
            hourlyWage: 60000 / 173.33,
            weeklyHours: 40,
            classification: 'Agent de Maîtrise',
            coefficient: '520',
            workSchedule: 'FIVE_DAYS',
            startDate: new Date('2019-11-15'),
            salaryStructureId: structureAgent.id,
        },
    });
    const emp10 = await prisma.employee.create({
        data: {
            firstName: 'Salim',
            lastName: 'ZEROUKI',
            workEmail: 'salim.zerouki@ghazal.dz',
            workPhone: '+213 23 45 67 98',
            workMobile: '+213 555 22 33 44',
            jobTitle: 'Chef de Production',
            workLocation: 'Usine Rouiba',
            workingHours: 'Standard 40h/semaine',
            timezone: 'Africa/Algiers',
            hireDate: new Date('2016-08-01'),
            employeeType: 'EMPLOYEE',
            departmentId: deptProduction.id,
            positionId: posChefProduction.id,
            birthday: new Date('1978-05-22'),
            gender: 'MALE',
            nationality: 'Algérienne',
            maritalStatus: 'MARRIED',
            children: 4,
            placeOfBirth: 'Rouiba',
            countryOfBirth: 'Algérie',
            address: '234 Cité des Martyrs, Rouiba',
            phone: '+213 21 85 96 74',
            privateEmail: 'salim.zerouki@hotmail.com',
            identificationId: '1978052201234',
            socialSecurityNumber: '1978052201234567',
            cnasAgency: 'CNAS Alger Est',
            cnasStartDate: new Date('2016-08-01'),
            isHandicapped: false,
            cnasContribution: true,
            paymentMethod: 'VIREMENT',
            bankAccount: 'DZ58 0010 1234 5678 9012 3456 78',
            status: 'ACTIVE',
        },
    });
    await prisma.contract.create({
        data: {
            reference: 'CDI-2016-010',
            employeeId: emp10.id,
            type: 'CDI',
            status: 'RUNNING',
            cnasScheme: 'CADRE',
            fiscalScheme: 'IMPOSABLE',
            executiveStatus: 'CADRE',
            wage: 95000,
            hourlyWage: 95000 / 173.33,
            weeklyHours: 40,
            classification: 'Cadre',
            coefficient: '690',
            workSchedule: 'SIX_DAYS',
            startDate: new Date('2016-08-01'),
            salaryStructureId: structureCadre.id,
        },
    });
    const emp11 = await prisma.employee.create({
        data: {
            firstName: 'Mourad',
            lastName: 'TALEB',
            workEmail: 'mourad.taleb@ghazal.dz',
            workPhone: '+213 23 45 67 99',
            workMobile: '+213 555 11 00 99',
            jobTitle: 'Ouvrier Qualifié',
            workLocation: 'Usine Rouiba',
            workingHours: '6 jours/semaine - 48h',
            timezone: 'Africa/Algiers',
            hireDate: new Date('2020-10-01'),
            employeeType: 'EMPLOYEE',
            departmentId: deptProduction.id,
            positionId: posOuvrier.id,
            managerId: emp10.id,
            birthday: new Date('1989-03-15'),
            gender: 'MALE',
            nationality: 'Algérienne',
            maritalStatus: 'MARRIED',
            children: 1,
            placeOfBirth: 'Boumerdès',
            countryOfBirth: 'Algérie',
            address: '67 Rue de la Paix, Boumerdès',
            phone: '+213 24 91 82 73',
            privateEmail: 'mourad.taleb@gmail.com',
            identificationId: '1989031512345',
            socialSecurityNumber: '1989031512345678',
            cnasAgency: 'CNAS Boumerdès',
            cnasStartDate: new Date('2020-10-01'),
            isHandicapped: false,
            cnasContribution: true,
            paymentMethod: 'ESPECE',
            status: 'ACTIVE',
        },
    });
    await prisma.contract.create({
        data: {
            reference: 'CDI-2020-011',
            employeeId: emp11.id,
            type: 'CDI',
            status: 'RUNNING',
            cnasScheme: 'GENERAL',
            fiscalScheme: 'IMPOSABLE',
            executiveStatus: 'NON_CADRE',
            wage: 30000,
            hourlyWage: 30000 / 208,
            weeklyHours: 48,
            classification: 'Ouvrier Professionnel',
            coefficient: '300',
            workSchedule: 'SIX_DAYS',
            startDate: new Date('2020-10-01'),
            salaryStructureId: structureOuvrier.id,
        },
    });
    const emp12 = await prisma.employee.create({
        data: {
            firstName: 'Samira',
            lastName: 'BENSAID',
            workEmail: 'samira.bensaid@ghazal.dz',
            workPhone: '+213 23 45 68 00',
            workMobile: '+213 555 88 99 00',
            jobTitle: 'Assistante Administrative',
            workLocation: 'Siège Social - Alger',
            workingHours: 'Standard 40h/semaine',
            timezone: 'Africa/Algiers',
            hireDate: new Date('2023-02-15'),
            employeeType: 'EMPLOYEE',
            departmentId: deptRH.id,
            positionId: posAssistant.id,
            managerId: user2.employee.id,
            birthday: new Date('1995-10-08'),
            gender: 'FEMALE',
            nationality: 'Algérienne',
            maritalStatus: 'SINGLE',
            children: 0,
            placeOfBirth: 'Alger',
            countryOfBirth: 'Algérie',
            address: '18 Rue Mohamed V, Kouba',
            phone: '+213 21 28 37 46',
            privateEmail: 'samira.bensaid@outlook.com',
            identificationId: '1995100823456',
            socialSecurityNumber: '1995100823456789',
            cnasAgency: 'CNAS Alger Centre',
            cnasStartDate: new Date('2023-02-15'),
            isHandicapped: false,
            cnasContribution: true,
            paymentMethod: 'VIREMENT',
            bankAccount: 'DZ58 0011 2345 6789 0123 4567 89',
            status: 'ACTIVE',
        },
    });
    await prisma.contract.create({
        data: {
            reference: 'CDD-2023-012',
            employeeId: emp12.id,
            type: 'CDD',
            status: 'RUNNING',
            cnasScheme: 'GENERAL',
            fiscalScheme: 'IMPOSABLE',
            executiveStatus: 'NON_CADRE',
            wage: 35000,
            hourlyWage: 35000 / 173.33,
            weeklyHours: 40,
            classification: 'Agent d\'Exécution',
            coefficient: '320',
            workSchedule: 'FIVE_DAYS',
            trialPeriodDuration: 30,
            trialPeriodEndDate: new Date('2023-03-15'),
            startDate: new Date('2023-02-15'),
            endDate: new Date('2024-02-14'),
            salaryStructureId: structureAgent.id,
        },
    });
    console.log('📌 Assignation des rubriques spécifiques aux employés...');
    const rubPrimeResponsabilite2 = await prisma.rubrique.findUnique({
        where: { code: 'PRIME_RESPONSABILITE' },
    });
    await prisma.employeeRubrique.create({
        data: {
            employeeId: user1.employee.id,
            rubriqueId: rubPrimeResponsabilite2.id,
            montantOverride: 30000,
            startDate: new Date('2015-01-15'),
        },
    });
    await prisma.employeeRubrique.create({
        data: {
            employeeId: user2.employee.id,
            rubriqueId: rubPrimeResponsabilite2.id,
            montantOverride: 20000,
            startDate: new Date('2016-03-01'),
        },
    });
    await prisma.employeeRubrique.create({
        data: {
            employeeId: emp3.id,
            rubriqueId: rubPrimeResponsabilite2.id,
            montantOverride: 15000,
            startDate: new Date('2017-09-01'),
        },
    });
    await prisma.employeeRubrique.create({
        data: {
            employeeId: emp4.id,
            rubriqueId: rubPrimeResponsabilite2.id,
            montantOverride: 18000,
            startDate: new Date('2018-01-15'),
        },
    });
    await prisma.employeeRubrique.create({
        data: {
            employeeId: emp10.id,
            rubriqueId: rubPrimeResponsabilite2.id,
            montantOverride: 16000,
            startDate: new Date('2016-08-01'),
        },
    });
    console.log('🎯 Assignation de primes aux employés...');
    const primePerformance = await prisma.payrollBonus.findFirst({
        where: { name: 'Prime de Performance Annuelle' },
    });
    const primePresence = await prisma.payrollBonus.findFirst({
        where: { name: 'Prime de Présence' },
    });
    const cadreEmployeeIds = [user1.employee.id, user2.employee.id, emp3.id, emp4.id, emp10.id];
    for (const empId of cadreEmployeeIds) {
        await prisma.employeeBonus.create({
            data: {
                employeeId: empId,
                bonusId: primePerformance.id,
                frequency: 'MONTHLY',
                startDate: new Date('2024-01-01'),
            },
        });
    }
    const presenceEmployeeIds = [emp5.id, emp7.id, emp8.id, emp11.id];
    for (const empId of presenceEmployeeIds) {
        await prisma.employeeBonus.create({
            data: {
                employeeId: empId,
                bonusId: primePresence.id,
                frequency: 'MONTHLY',
                startDate: new Date('2024-01-01'),
            },
        });
    }
    console.log('\n✅ Seed complet terminé avec succès!');
    console.log('\n📊 RÉSUMÉ:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✓ Paramètres de paie algériens créés');
    console.log('✓ Tranches IRG algériennes configurées');
    console.log('✓ Cotisations CNAS/CNR/CNAC créées');
    console.log('✓ 6 Départements créés');
    console.log('✓ 12 Positions créées');
    console.log('✓ 8 Motifs d\'absence créés');
    console.log('✓ 13 Rubriques de paie créées');
    console.log('✓ 3 Structures salariales configurées');
    console.log('✓ 4 Primes définies');
    console.log('✓ 12 Employés créés avec leurs contrats');
    console.log('✓ Rubriques et primes assignées aux employés');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n👤 UTILISATEURS DE TEST:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: directeur@ghazal.dz');
    console.log('🔑 Mot de passe: password123');
    console.log('👔 Rôle: ADMIN, MANAGER');
    console.log('');
    console.log('📧 Email: drh@ghazal.dz');
    console.log('🔑 Mot de passe: password123');
    console.log('👔 Rôle: HR, MANAGER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
main()
    .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-complete-algerian.js.map