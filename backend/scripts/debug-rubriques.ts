
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Checking Rubriques with Formulas...");

    const rubriques = await prisma.rubrique.findMany({
        where: { montantType: 'FORMULE' }
    });

    const params = await prisma.payrollParameter.findMany({
        where: {
            OR: [
                { endDate: null },
                { endDate: { gte: new Date() } }
            ]
        }
    });

    const paramCodes = params.map(p => p.code);
    const standardVars = ['SALAIRE_BASE', 'SALAIRE_BRUT', 'SALAIRE_IMPOSABLE'];
    const allowedVars = [...standardVars, ...paramCodes];

    console.log("Allowed Variables:", allowedVars);

    let hasErrors = false;

    for (const r of rubriques) {
        console.log(`Checking Rubrique [${r.code}] ${r.nom}: "${r.formule}"`);

        if (!r.formule) {
            console.error(`❌ Error: Rubrique ${r.code} has type FORMULE but no formula string!`);
            hasErrors = true;
            continue;
        }

        // Extract variables from formula
        const variables = r.formule.match(/[A-Z_][A-Z_0-9]*/g) || [];

        const unknownVars = variables.filter(v => !allowedVars.includes(v));

        if (unknownVars.length > 0) {
            console.error(`❌ Error: Rubrique ${r.code} uses unknown variables: ${unknownVars.join(', ')}`);
            hasErrors = true;
        } else {
            console.log(`✅ OK`);
        }
    }

    if (!hasErrors) {
        console.log("✅ All formulas look valid regarding variable existence.");
    } else {
        console.log("❌ Found invalid formulas!");
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
