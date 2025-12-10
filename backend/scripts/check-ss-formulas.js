
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const codes = ['CNAS_SALARIE', 'CNR_SALARIE', 'CNAC_SALARIE'];
    const rubriques = await prisma.rubrique.findMany({
        where: { code: { in: codes } }
    });

    console.log('--- Social Security Rubriques ---');
    rubriques.forEach(r => {
        console.log(`Code: ${r.code}`);
        console.log(`Name: ${r.nom}`);
        console.log(`Type: ${r.type}`);
        console.log(`MontantType: ${r.montantType}`);
        console.log(`Valeur: ${r.valeur}`);
        console.log(`Formula: ${r.formula}`);
        console.log('-------------------');
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
