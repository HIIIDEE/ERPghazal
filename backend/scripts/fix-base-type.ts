
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing SALAIRE_BASE type...');

    const result = await prisma.rubrique.updateMany({
        where: { code: 'SALAIRE_BASE', type: 'GAIN' },
        data: { type: 'BASE' }
    });

    console.log(`Updated ${result.count} entries. SALAIRE_BASE is now type BASE.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
