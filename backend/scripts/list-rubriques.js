
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const rubriques = await prisma.rubrique.findMany({
        orderBy: { code: 'asc' }
    });

    console.log('List of Rubriques:');
    console.table(rubriques.map(r => ({
        id: r.id,
        code: r.code,
        nom: r.nom,
        type: r.type,
        montantType: r.montantType,
        formule: r.formule,
        valeur: r.valeur
    })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
