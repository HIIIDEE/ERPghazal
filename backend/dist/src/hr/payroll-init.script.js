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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function initializePayrollDefaults() {
    console.log('🚀 Initialisation des paramètres de paie algérienne...\n');
    console.log('📊 Création des paramètres de paie...');
    const startDate = new Date('2024-01-01');
    const parameters = [
        {
            code: 'SNMG',
            nom: 'Salaire National Minimum Garanti',
            valeur: 20000,
            description: 'SNMG officiel Algérie 2024'
        },
        {
            code: 'PLAFOND_CNAS',
            nom: 'Plafond CNAS',
            valeur: 108000,
            description: 'Plafond mensuel pour cotisations CNAS'
        },
        {
            code: 'POINT_INDICE',
            nom: 'Point Indice',
            valeur: 75,
            description: 'Valeur du point indice fonction publique'
        }
    ];
    for (const param of parameters) {
        await prisma.payrollParameter.upsert({
            where: { code: param.code },
            update: {},
            create: {
                ...param,
                startDate,
                endDate: null
            }
        });
        console.log(`  ✓ ${param.nom}: ${param.valeur} DA`);
    }
    console.log('\n💰 Création du barème IRG 2024...');
    const brackets = [
        {
            nom: 'Tranche 0 (Exonéré)',
            minAmount: 0,
            maxAmount: 30000,
            rate: 0,
            fixedAmount: 0,
            ordre: 1
        },
        {
            nom: 'Tranche 1 (20%)',
            minAmount: 30000,
            maxAmount: 120000,
            rate: 20,
            fixedAmount: 0,
            ordre: 2
        },
        {
            nom: 'Tranche 2 (30%)',
            minAmount: 120000,
            maxAmount: 360000,
            rate: 30,
            fixedAmount: 18000,
            ordre: 3
        },
        {
            nom: 'Tranche 3 (35%)',
            minAmount: 360000,
            maxAmount: null,
            rate: 35,
            fixedAmount: 90000,
            ordre: 4
        }
    ];
    await prisma.taxBracket.deleteMany({});
    for (const bracket of brackets) {
        await prisma.taxBracket.create({
            data: {
                nom: bracket.nom,
                minAmount: bracket.minAmount,
                maxAmount: bracket.maxAmount,
                rate: bracket.rate,
                fixedAmount: bracket.fixedAmount,
                ordre: bracket.ordre,
                startDate,
                endDate: null
            }
        });
        console.log(`  ✓ ${bracket.nom}: ${bracket.minAmount.toLocaleString()} - ${bracket.maxAmount ? bracket.maxAmount.toLocaleString() : '∞'} DA @ ${bracket.rate}%`);
    }
    console.log('\n📋 Création des rubriques standards...');
    const rubriques = [
        {
            code: 'SALAIRE_BASE',
            nom: 'Salaire de Base',
            type: 'BASE',
            montantType: 'SAISIE',
            valeur: null,
            formule: null,
            soumisCnas: true,
            soumisIrg: true,
            soumisChargeEmployeur: true,
            ordreAffichage: 1
        },
        {
            code: 'PRIME_PANIER',
            nom: 'Prime de Panier',
            type: 'GAIN',
            montantType: 'FIXE',
            valeur: 2000,
            formule: null,
            soumisCnas: false,
            soumisIrg: false,
            soumisChargeEmployeur: false,
            ordreAffichage: 10
        },
        {
            code: 'PRIME_TRANSPORT',
            nom: 'Prime de Transport',
            type: 'GAIN',
            montantType: 'FIXE',
            valeur: 3000,
            formule: null,
            soumisCnas: false,
            soumisIrg: false,
            soumisChargeEmployeur: false,
            ordreAffichage: 11
        },
        {
            code: 'PRIME_ANCIENNETE',
            nom: "Prime d'Ancienneté",
            type: 'GAIN',
            montantType: 'POURCENTAGE',
            valeur: 5,
            formule: null,
            soumisCnas: true,
            soumisIrg: true,
            soumisChargeEmployeur: true,
            ordreAffichage: 12
        },
        {
            code: 'PRIME_RENDEMENT',
            nom: 'Prime de Rendement',
            type: 'GAIN',
            montantType: 'SAISIE',
            valeur: null,
            formule: null,
            soumisCnas: true,
            soumisIrg: true,
            soumisChargeEmployeur: true,
            ordreAffichage: 13
        },
        {
            code: 'CNAS_SALARIE',
            nom: 'CNAS Salarié (9%)',
            type: 'RETENUE',
            montantType: 'FORMULE',
            valeur: null,
            formule: 'SALAIRE_BRUT * 0.09',
            soumisCnas: false,
            soumisIrg: false,
            soumisChargeEmployeur: false,
            ordreAffichage: 20
        },
        {
            code: 'RETRAITE_SALARIE',
            nom: 'Retraite Salarié (9.5%)',
            type: 'RETENUE',
            montantType: 'FORMULE',
            valeur: null,
            formule: 'SALAIRE_BRUT * 0.095',
            soumisCnas: false,
            soumisIrg: false,
            soumisChargeEmployeur: false,
            ordreAffichage: 21
        },
        {
            code: 'CHOMAGE_SALARIE',
            nom: 'Assurance Chômage Salarié (1.5%)',
            type: 'RETENUE',
            montantType: 'FORMULE',
            valeur: null,
            formule: 'SALAIRE_BRUT * 0.015',
            soumisCnas: false,
            soumisIrg: false,
            soumisChargeEmployeur: false,
            ordreAffichage: 22
        },
        {
            code: 'CNAS_PATRONAL',
            nom: 'CNAS Patronale (26%)',
            type: 'COTISATION',
            montantType: 'FORMULE',
            valeur: null,
            formule: 'SALAIRE_BRUT * 0.26',
            soumisCnas: false,
            soumisIrg: false,
            soumisChargeEmployeur: false,
            ordreAffichage: 30
        },
        {
            code: 'RETRAITE_PATRONAL',
            nom: 'Retraite Patronale (10%)',
            type: 'COTISATION',
            montantType: 'FORMULE',
            valeur: null,
            formule: 'SALAIRE_BRUT * 0.10',
            soumisCnas: false,
            soumisIrg: false,
            soumisChargeEmployeur: false,
            ordreAffichage: 31
        },
        {
            code: 'CHOMAGE_PATRONAL',
            nom: 'Assurance Chômage Patronale (1%)',
            type: 'COTISATION',
            montantType: 'FORMULE',
            valeur: null,
            formule: 'SALAIRE_BRUT * 0.01',
            soumisCnas: false,
            soumisIrg: false,
            soumisChargeEmployeur: false,
            ordreAffichage: 32
        }
    ];
    for (const rubrique of rubriques) {
        await prisma.rubrique.upsert({
            where: { code: rubrique.code },
            update: {},
            create: rubrique
        });
        console.log(`  ✓ ${rubrique.nom} (${rubrique.type})`);
    }
    console.log('\n✅ Initialisation terminée avec succès!\n');
}
initializePayrollDefaults()
    .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=payroll-init.script.js.map