const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
    try {
        const emp = await prisma.employee.findFirst({
            where: {
                lastName: { contains: 'DJAFFER', mode: 'insensitive' }
            },
            include: {
                contracts: {
                    include: {
                        salaryStructure: {
                            include: {
                                rubriques: {
                                    include: {
                                        rubrique: true
                                    }
                                }
                            }
                        }
                    }
                },
                rubriques: {
                    include: {
                        rubrique: true
                    }
                }
            }
        });

        if (!emp) {
            console.log('Employee not found');
            await prisma.$disconnect();
            return;
        }

        console.log('=== EMPLOYEE DATA ===');
        console.log('Name:', emp.firstName, emp.lastName);
        console.log('Contracts count:', emp.contracts?.length || 0);
        console.log('Employee Rubriques count:', emp.rubriques?.length || 0);

        if (emp.contracts && emp.contracts.length > 0) {
            emp.contracts.forEach((contract, idx) => {
                console.log(`\n--- Contract ${idx + 1} ---`);
                console.log('Contract ID:', contract.id);
                console.log('Salary Structure ID:', contract.salaryStructureId);
                console.log('Has Structure:', !!contract.salaryStructure);

                if (contract.salaryStructure) {
                    console.log('Structure Name:', contract.salaryStructure.name);
                    console.log('Structure Rubriques count:', contract.salaryStructure.rubriques?.length || 0);

                    if (contract.salaryStructure.rubriques && contract.salaryStructure.rubriques.length > 0) {
                        console.log('\nStructure Rubriques:');
                        contract.salaryStructure.rubriques.forEach((sr) => {
                            console.log(`  - ${sr.rubrique.code}: ${sr.rubrique.nom} (${sr.rubrique.type})`);
                        });
                    }
                }
            });
        }

        if (emp.rubriques && emp.rubriques.length > 0) {
            console.log('\n=== EMPLOYEE RUBRIQUES (Personalized) ===');
            emp.rubriques.forEach((er) => {
                console.log(`- ${er.rubrique.code}: ${er.rubrique.nom}`);
                console.log(`  Override: ${er.montantOverride || 'none'}`);
                console.log(`  Start: ${er.startDate}, End: ${er.endDate || 'permanent'}`);
            });
        }

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error);
        await prisma.$disconnect();
    }
})();
