
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🔄 Updating ABATTEMENT_IRG...');

        // Upsert the parameter
        const param = await prisma.payrollParameter.upsert({
            where: { code: 'ABATTEMENT_IRG' },
            update: { valeur: 40 },
            create: {
                code: 'ABATTEMENT_IRG',
                nom: 'Abattement Forfaitaire IRG',
                valeur: 40,
                description: 'Switch to Revenue Abatement Mode (40)',
                startDate: new Date()
            }
        });

        console.log('✅ Updated ABATTEMENT_IRG to:', param.valeur);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
