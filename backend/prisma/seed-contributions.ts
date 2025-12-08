import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedContributions() {
    // Cotisations Employé (déduites du salaire brut)
    const employeeContributions = [
        { name: 'Sécurité Sociale (Employé)', code: 'SS_EMPLOYEE', type: 'EMPLOYEE', rate: 9.0, description: 'Cotisation sécurité sociale part salarié' },
        { name: 'Retraite (Employé)', code: 'RETIREMENT_EMPLOYEE', type: 'EMPLOYEE', rate: 6.75, description: 'Cotisation retraite part salarié' },
        { name: 'Assurance Chômage (Employé)', code: 'UNEMPLOYMENT_EMPLOYEE', type: 'EMPLOYEE', rate: 0.5, description: 'Cotisation assurance chômage part salarié' },
    ];

    // Cotisations Employeur (déclaratives)
    const employerContributions = [
        { name: 'Sécurité Sociale (Employeur)', code: 'SS_EMPLOYER', type: 'EMPLOYER', rate: 26.0, description: 'Cotisation sécurité sociale part patronale' },
        { name: 'Retraite (Employeur)', code: 'RETIREMENT_EMPLOYER', type: 'EMPLOYER', rate: 10.0, description: 'Cotisation retraite part patronale' },
        { name: 'Assurance Chômage (Employeur)', code: 'UNEMPLOYMENT_EMPLOYER', type: 'EMPLOYER', rate: 1.0, description: 'Cotisation assurance chômage part patronale' },
        { name: 'Accidents du Travail', code: 'WORK_ACCIDENT', type: 'EMPLOYER', rate: 1.25, description: 'Cotisation accidents du travail' },
    ];

    const allContributions = [...employeeContributions, ...employerContributions];

    for (const contrib of allContributions) {
        await prisma.socialContribution.upsert({
            where: { code: contrib.code },
            update: contrib,
            create: contrib,
        });
    }

    console.log('✅ Cotisations sociales créées avec succès!');
}

seedContributions()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
