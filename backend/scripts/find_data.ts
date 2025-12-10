
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Find Employee
    const employee = await prisma.employee.findFirst({
        where: {
            OR: [
                { lastName: { contains: 'Votre', mode: 'insensitive' } },
                { firstName: { contains: 'Votre', mode: 'insensitive' } }
            ]
        }
    });

    if (!employee) {
        console.log('Employee "Votre" not found.');
        return;
    }
    console.log('Found Employee:', employee.firstName, employee.lastName, employee.id);

    // 2. Find Rubriques
    const rubriques = await prisma.rubrique.findMany({
        where: {
            OR: [
                { nom: { contains: 'Responsabilité', mode: 'insensitive' } },
                { nom: { contains: 'Disponibilité', mode: 'insensitive' } }
            ]
        }
    });

    console.log('Found Rubriques:', rubriques.map((r: any) => ({ id: r.id, nom: r.nom, code: r.code })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
