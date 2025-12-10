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
        },
        include: {
            contracts: true
        }
    });
    if (!employee) {
        console.error('Employee not found');
        return;
    }
    console.log(`Employee: ${employee.firstName} ${employee.lastName}`);
    console.log(`Base Salary (Contract): ${employee.contracts[0]?.wage}`);
    const assignments = await prisma.employeeRubrique.findMany({
        where: { employeeId: employee.id },
        include: { rubrique: true }
    });
    console.log('\n--- Assigned Rubriques ---');
    assignments.forEach((a) => {
        console.log(`[${a.rubrique.type}] ${a.rubrique.code} - ${a.rubrique.nom}: ${a.montantOverride || a.rubrique.valeur || 'Formula'}`);
    });
    if (employee.contracts[0]?.salaryStructureId) {
        const structure = await prisma.salaryStructure.findUnique({
            where: { id: employee.contracts[0].salaryStructureId },
            include: { rubriques: { include: { rubrique: true } } }
        });
        console.log('\n--- Structure Rubriques ---');
        structure?.rubriques.forEach((sr) => {
            console.log(`[${sr.rubrique.type}] ${sr.rubrique.code} - ${sr.rubrique.nom}`);
        });
    }
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=debug-employee-rubriques.js.map