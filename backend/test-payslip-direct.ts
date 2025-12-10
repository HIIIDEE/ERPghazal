import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testPayslipGeneration() {
    try {
        console.log('🔍 Test direct de génération de bulletin...\n');

        // 1. Récupérer un employé
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

        // 2. Vérifier la structure salariale
        console.log('\n2️⃣ Vérification de la structure salariale...');
        if (!contract.salaryStructureId) {
            console.log('⚠️  Pas de structure salariale assignée au contrat');
        } else {
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

        // 3. Vérifier les paramètres de paie
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

        // 4. Vérifier les tranches IRG
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

        // 5. Test de génération
        console.log('\n5️⃣ Tentative de génération du bulletin...\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const month = 11; // Décembre
        const year = 2024;
        const baseSalary = Number(contract.wage);

        console.log(`   Employé: ${employee.id}`);
        console.log(`   Mois: ${month + 1}/${year}`);
        console.log(`   Salaire de base: ${baseSalary} DA`);

        // Simuler l'appel du service
        // Note: Nous ne pouvons pas appeler le service directement ici car il nécessite l'injection NestJS
        // Mais nous pouvons vérifier si les données nécessaires sont présentes

        console.log('\n✅ Toutes les données nécessaires semblent présentes');
        console.log('\n⚠️  Le problème pourrait être:');
        console.log('   1. Une erreur dans le calcul des formules (FormulaEngineService)');
        console.log('   2. Un problème avec un type de données (Decimal, etc.)');
        console.log('   3. Une rubrique avec une formule invalide');
        console.log('\n💡 Solution: Vérifier les logs du backend lors de la génération');

    } catch (error) {
        console.error('\n❌ Erreur:', error);
        console.error('   Message:', error.message);
        console.error('   Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

testPayslipGeneration();
