"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
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
    const rubriques = await prisma.rubrique.findMany({
        where: {
            OR: [
                { nom: { contains: 'Responsabilité', mode: 'insensitive' } },
                { nom: { contains: 'Disponibilité', mode: 'insensitive' } }
            ]
        }
    });
    console.log('Found Rubriques:', rubriques.map((r) => ({ id: r.id, nom: r.nom, code: r.code })));
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=find_data.js.map