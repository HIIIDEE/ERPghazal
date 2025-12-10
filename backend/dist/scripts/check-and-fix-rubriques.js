"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
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
        return;
    }
    console.log(`Trouvé ${baseRubriques.length} rubrique(s):\n`);
    for (const r of baseRubriques) {
        console.log(`Rubrique ID: ${r.id}`);
        console.log(`  Code: ${r.code}`);
        console.log(`  Nom: ${r.nom}`);
        console.log(`  Type: ${r.type}`);
        console.log(`  MontantType: ${r.montantType}`);
        console.log(`  Valeur: ${r.valeur}`);
        console.log(`  Formule: ${r.formule || 'NULL'}`);
        console.log(`  isActive: ${r.isActive}`);
        console.log('---\n');
        const needsFix = r.montantType !== 'FORMULE' || r.formule !== 'SALAIRE_BASE';
        if (needsFix) {
            console.log(`⚠️  Cette rubrique nécessite une correction!`);
            console.log(`   Correction: montantType='FORMULE', formule='SALAIRE_BASE'\n`);
            const updated = await prisma.rubrique.update({
                where: { id: r.id },
                data: {
                    montantType: 'FORMULE',
                    formule: 'SALAIRE_BASE',
                    valeur: null
                }
            });
            console.log(`✅ Rubrique ${r.code} corrigée!\n`);
        }
        else {
            console.log(`✅ Cette rubrique est correctement configurée.\n`);
        }
    }
    console.log('=== Vérification terminée ===');
}
main()
    .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=check-and-fix-rubriques.js.map