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
async function testPayslipGeneration() {
    try {
        console.log('🔍 Test direct de génération de bulletin...\n');
        console.log('1️⃣ Récupération d\'un employé...');
        const employee = await prisma.employee.findFirst({
            where: { status: 'ACTIVE' },
            include: {
                contracts: {
                    where: { status: 'RUNNING' }
                },
                bonuses: {
                    include: { bonus: true }
                }
            }
        });
        if (!employee) {
            console.error('❌ Aucun employé actif trouvé');
            return;
        }
        console.log(`✅ Employé: ${employee.firstName} ${employee.lastName}`);
        if (employee.contracts.length === 0) {
            console.error('❌ Aucun contrat actif');
            return;
        }
        const contract = employee.contracts[0];
        console.log(`✅ Contrat actif trouvé: ${contract.wage} DA`);
        console.log('\n2️⃣ Vérification de la structure salariale...');
        if (!contract.salaryStructureId) {
            console.log('⚠️  Pas de structure salariale assignée au contrat');
        }
        else {
            const structure = await prisma.salaryStructure.findUnique({
                where: { id: contract.salaryStructureId },
                include: {
                    rubriques: {
                        include: { rubrique: true }
                    }
                }
            });
            if (structure) {
                console.log(`✅ Structure: ${structure.name}`);
                console.log(`   ${structure.rubriques.length} rubriques dans la structure`);
            }
        }
        console.log('\n3️⃣ Vérification des paramètres de paie...');
        const params = await prisma.payrollParameter.findMany({
            where: {
                startDate: { lte: new Date() },
                OR: [
                    { endDate: null },
                    { endDate: { gte: new Date() } }
                ]
            }
        });
        console.log(`✅ ${params.length} paramètres trouvés`);
        params.forEach(p => console.log(`   - ${p.code}: ${p.valeur}`));
        console.log('\n4️⃣ Vérification des tranches IRG...');
        const taxBrackets = await prisma.taxBracket.findMany({
            where: {
                startDate: { lte: new Date() },
                OR: [
                    { endDate: null },
                    { endDate: { gte: new Date() } }
                ]
            },
            orderBy: { ordre: 'asc' }
        });
        console.log(`✅ ${taxBrackets.length} tranches trouvées`);
        console.log('\n5️⃣ Tentative de génération du bulletin...\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const month = 11;
        const year = 2024;
        const baseSalary = Number(contract.wage);
        console.log(`   Employé: ${employee.id}`);
        console.log(`   Mois: ${month + 1}/${year}`);
        console.log(`   Salaire de base: ${baseSalary} DA`);
        console.log('\n✅ Toutes les données nécessaires semblent présentes');
        console.log('\n⚠️  Le problème pourrait être:');
        console.log('   1. Une erreur dans le calcul des formules (FormulaEngineService)');
        console.log('   2. Un problème avec un type de données (Decimal, etc.)');
        console.log('   3. Une rubrique avec une formule invalide');
        console.log('\n💡 Solution: Vérifier les logs du backend lors de la génération');
    }
    catch (error) {
        console.error('\n❌ Erreur:', error);
        console.error('   Message:', error.message);
        console.error('   Stack:', error.stack);
    }
    finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
testPayslipGeneration();
//# sourceMappingURL=test-payslip-direct.js.map