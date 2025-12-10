
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Updating Tax Brackets to 2022 Law...');

    // Delete existing
    await prisma.taxBracket.deleteMany({});

    // Create New
    await prisma.taxBracket.createMany({
        data: [
            {
                nom: 'Tranche 1 - Exonéré',
                minAmount: 0,
                maxAmount: 30000,
                rate: 0,
                ordre: 1,
                isActive: true
            },
            {
                nom: 'Tranche 2 - 23%',
                minAmount: 30001,
                maxAmount: 120000,
                rate: 23,
                ordre: 2,
                isActive: true
            },
            {
                nom: 'Tranche 3 - 27%',
                minAmount: 120001,
                maxAmount: 320000,
                rate: 27,
                ordre: 3,
                isActive: true
            },
            {
                nom: 'Tranche 4 - 35%',
                minAmount: 320001,
                maxAmount: 999999999,
                rate: 35,
                ordre: 4,
                isActive: true
            }
        ]
    });

    console.log('Tax Brackets Updated.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
