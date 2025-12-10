
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

    // 2. Get Assignments
    const assignments = await prisma.employeeRubrique.findMany({
        where: { employeeId: employee.id },
        include: { rubrique: true }
    });

    console.log('\n--- Assigned Rubriques ---');
    assignments.forEach((a: any) => {
        console.log(`[${a.rubrique.type}] ${a.rubrique.code} - ${a.rubrique.nom}: ${a.montantOverride || a.rubrique.valeur || 'Formula'}`);
    });

    // 3. Check for Global Active Rubriques (that apply to everyone)
    // In this system, it seems rubriques must be assigned in EmployeeRubrique OR be part of the structure.
    // Let's check the structure.
    // But wait, the schema says Employee has NO direct salaryStructureId (removed in previous edit).
    // It's on the Contract.

    if (employee.contracts[0]?.salaryStructureId) {
        const structure = await prisma.salaryStructure.findUnique({
            where: { id: employee.contracts[0].salaryStructureId },
            include: { rubriques: { include: { rubrique: true } } }
        });

        console.log('\n--- Structure Rubriques ---');
        structure?.rubriques.forEach((sr: any) => {
            console.log(`[${sr.rubrique.type}] ${sr.rubrique.code} - ${sr.rubrique.nom}`);
        });
    }

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
