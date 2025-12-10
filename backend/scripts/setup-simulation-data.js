
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Starting setup...');

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
            console.error('❌ Employee "Votre" not found.');
            return;
        }
        console.log(`✅ Found Employee: ${employee.firstName} ${employee.lastName} (${employee.id})`);

        // 2. Upsert Rubriques
        const bonuses = [
            { nom: 'Prime de Responsabilité', code: 'PRIME_RESP', montant: 20000 },
            { nom: 'Prime de Disponibilité', code: 'PRIME_DISPO', montant: 20000 }
        ];

        for (const bonus of bonuses) {
            // Upsert Rubrique
            let rubrique = await prisma.rubrique.findFirst({ where: { code: bonus.code } });

            if (!rubrique) {
                console.log(`Creating Rubrique: ${bonus.nom}`);
                rubrique = await prisma.rubrique.create({
                    data: {
                        code: bonus.code,
                        nom: bonus.nom,
                        type: 'GAIN',
                        montantType: 'FIXE',
                        valeur: bonus.montant,
                        isActive: true,
                        ordreAffichage: 10,
                        soumisCnas: true,
                        soumisIrg: true
                    }
                });
            } else {
                console.log(`Rubrique ${bonus.nom} already exists.`);
            }

            // 3. Assign to Employee for Dec 2025 (Start Date)
            // We set startDate to Dec 1st 2025.
            const startDate = new Date('2025-12-01T00:00:00.000Z');

            // Check if already assigned
            const existingAssignment = await prisma.employeeRubrique.findFirst({
                where: {
                    employeeId: employee.id,
                    rubriqueId: rubrique.id,
                    startDate: startDate
                }
            });

            if (!existingAssignment) {
                console.log(`Assigning ${bonus.nom} to employee...`);
                await prisma.employeeRubrique.create({
                    data: {
                        employeeId: employee.id,
                        rubriqueId: rubrique.id,
                        startDate: startDate,
                        montantOverride: bonus.montant // Ensure the amount is set specifically
                    }
                });
                console.log(`✅ Assigned ${bonus.nom}`);
            } else {
                console.log(`ℹ️ ${bonus.nom} already assigned.`);
                // Update amount just in case
                await prisma.employeeRubrique.update({
                    where: { id: existingAssignment.id },
                    data: { montantOverride: bonus.montant }
                });
                console.log(`   Updated amount to ${bonus.montant}`);
            }
        }

        console.log('🎉 Setup Complete! You can now simulate.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
