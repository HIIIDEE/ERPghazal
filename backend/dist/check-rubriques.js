"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const prisma = new client_1.PrismaClient();
async function checkRubriques() {
    console.log('=== Vérification des rubriques SALAIRE_BASE ===\n');
    const baseRubriques = await prisma.rubrique.findMany({
        where: {
            OR: [
                { code: { contains: 'SALAIRE_BASE' } },
                { code: { contains: 'BASE' } },
                { nom: { contains: 'Salaire de Base' } },
                { nom: { contains: 'Salaire de base' } }
            ]
        }
    });
    if (baseRubriques.length === 0) {
        console.log('❌ Aucune rubrique de salaire de base trouvée!');
    }
    else {
        baseRubriques.forEach((r) => {
            console.log(`Rubrique ID: ${r.id}`);
            console.log(`  Code: ${r.code}`);
            console.log(`  Nom: ${r.nom}`);
            console.log(`  Type: ${r.type}`);
            console.log(`  MontantType: ${r.montantType}`);
            console.log(`  Valeur: ${r.valeur}`);
            console.log(`  Formule: ${r.formule || 'NULL'}`);
            console.log(`  isActive: ${r.isActive}`);
            console.log('---');
        });
    }
    await prisma.$disconnect();
}
checkRubriques().catch(console.error);
//# sourceMappingURL=check-rubriques.js.map