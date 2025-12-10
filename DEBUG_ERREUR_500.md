# 🔧 Guide de Débogage - Erreur 500 sur Génération de Bulletins

## 📊 Diagnostic Effectué

✅ **Données de Base Vérifiées:**
- 14 rubriques présentes
- 4 structures salariales
- 5 paramètres de paie
- 4 tranches IRG
- 12 employés avec contrats actifs

❌ **Problème Identifié:**
Le backend retourne une erreur 500 (Internal Server Error) lors de l'appel à `/hr/payslips/generate`

## 🔍 Causes Probables

### 1. Problème avec le Moteur de Formules
Les rubriques utilisent des formules pour calculer les montants. Si une formule est invalide ou référence une variable inexistante, cela peut causer une erreur.

### 2. Problème de Type Decimal
Prisma utilise le type `Decimal` pour les montants, mais le code pourrait essayer de faire des opérations mathématiques directement dessus.

### 3. Rubrique sans Valeur ou Formule
Une rubrique pourrait être mal configurée (pas de `valeur` ni de `formule` pour un type `FIXE` ou `FORMULE`).

## 🛠️ Solutions

### Solution 1: Voir les Logs du Backend en Temps Réel

1. **Arrêter le backend actuel:**
   ```bash
   # Trouver le processus
   netstat -ano | findstr :3000

   # Tuer le processus (remplacer PID par le numéro trouvé)
   taskkill /PID <PID> /F
   ```

2. **Redémarrer avec logs détaillés:**
   ```bash
   cd backend
   npm run start:dev
   ```

3. **Tenter la génération depuis le frontend**

4. **Observer les logs dans le terminal** - L'erreur complète s'affichera

### Solution 2: Ajouter des Logs de Débogage

Modifiez temporairement `backend/src/hr/hr.controller.ts`:

```typescript
@Post('payslips/generate')
async generatePayslips(@Body() body: { employeeIds: string[], month: number, year: number }) {
    try {
        console.log('🔍 Génération demandée pour:', body);
        const result = await this.hrService.generatePayslips(body.employeeIds, body.month, body.year);
        console.log('✅ Génération réussie');
        return result;
    } catch (error) {
        console.error('❌ ERREUR COMPLÈTE:', error);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    }
}
```

### Solution 3: Vérifier les Rubriques

Exécutez ce script pour vérifier les rubriques:

```bash
node check-rubriques.js
```

(Créez le fichier ci-dessous)

### Solution 4: Utiliser l'Ancien Système de Calcul (Workaround)

Le système possède **deux moteurs de calcul**:

1. **Nouveau:** Basé sur les rubriques (actuel, avec erreur)
2. **Ancien:** Calcul direct des cotisations (fonctionne)

Pour utiliser temporairement l'ancien système, vous pouvez:

A. Générer via le script CLI qui contourne le moteur de rubriques:
```bash
cd backend
npx ts-node prisma/generate-monthly-payslips.ts --month 12 --year 2024
```

B. Ou modifier temporairement `hr.service.ts` pour utiliser l'ancien calcul.

## 📝 Script de Vérification des Rubriques

Créez `check-rubriques.js`:

```javascript
const http = require('http');

async function login() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            email: 'responsable.it@ghazal.dz',
            password: 'password123'
        });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const result = JSON.parse(body);
                resolve(result.access_token);
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function checkRubriques() {
    const token = await login();

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/hr/rubriques',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const rubriques = JSON.parse(body);

                console.log(`📋 ${rubriques.length} Rubriques Trouvées\n`);

                const problemes = [];

                rubriques.forEach(r => {
                    console.log(`\n━━ ${r.nom} (${r.code}) ━━`);
                    console.log(`   Type: ${r.type}`);
                    console.log(`   Montant Type: ${r.montantType}`);
                    console.log(`   Valeur: ${r.valeur || 'N/A'}`);
                    console.log(`   Formule: ${r.formule || 'N/A'}`);
                    console.log(`   Active: ${r.isActive}`);

                    // Vérifications
                    if (r.montantType === 'FIXE' && !r.valeur) {
                        problemes.push(`⚠️  ${r.code}: Type FIXE mais pas de valeur`);
                    }
                    if (r.montantType === 'FORMULE' && !r.formule) {
                        problemes.push(`⚠️  ${r.code}: Type FORMULE mais pas de formule`);
                    }
                    if (r.montantType === 'POURCENTAGE' && !r.valeur) {
                        problemes.push(`⚠️  ${r.code}: Type POURCENTAGE mais pas de taux`);
                    }
                });

                if (problemes.length > 0) {
                    console.log('\n\n❌ PROBLÈMES DÉTECTÉS:\n');
                    problemes.forEach(p => console.log(p));
                } else {
                    console.log('\n\n✅ Toutes les rubriques semblent correctement configurées');
                }

                resolve();
            });
        });
        req.on('error', reject);
        req.end();
    });
}

checkRubriques().catch(console.error);
```

## 🚨 Solution Rapide (Recommandée)

Si vous avez besoin de générer les bulletins **maintenant**, utilisez le script CLI qui fonctionne:

```bash
cd backend

# Pour tous les employés
npx ts-node prisma/generate-monthly-payslips.ts --month 12 --year 2024

# Pour un seul employé
npx ts-node prisma/generate-monthly-payslips.ts --email responsable.it@ghazal.dz --month 12 --year 2024
```

Ce script:
- ✅ Fonctionne sans le moteur de rubriques
- ✅ Génère les bulletins dans la BDD
- ✅ Affiche les détails dans le terminal
- ✅ Calcule tout correctement (cotisations + IRG)

## 📊 Prochaines Étapes

1. **Immédiat:** Utilisez le script CLI pour générer vos bulletins
2. **Court terme:** Activez les logs détaillés pour identifier l'erreur exacte
3. **Moyen terme:** Corrigez les rubriques problématiques ou le moteur de formules

## 💡 Informations Additionnelles

### Structure du Système de Paie

Le système utilise deux approches:

**Approche 1: Moteur de Rubriques (Nouveau)**
```
Employé → Contrat → Structure Salariale → Rubriques → Formules → Calcul
```
- Plus flexible
- Configurable via UI
- **Actuellement avec erreur 500**

**Approche 2: Calcul Direct (Ancien)**
```
Employé → Contrat → Primes → Calcul Direct (cotisations + IRG)
```
- Plus simple
- Codé en dur
- **Fonctionne parfaitement**

### Fichiers Importants

```
backend/src/hr/
├── hr.service.ts                              # Service principal
├── hr.controller.ts                           # Contrôleur (ajoutez logs ici)
└── services/
    ├── rubrique-calculation.service.ts        # Moteur de rubriques (erreur ici?)
    ├── formula-engine.service.ts              # Évaluation formules
    └── payroll-calculation.service.ts         # Ancien système (fonctionne)

backend/prisma/
└── generate-monthly-payslips.ts              # Script CLI (fonctionne)
```

## 📞 Besoin d'Aide?

Si l'erreur persiste:

1. Envoyez les logs du backend au moment de l'erreur
2. Vérifiez la configuration des rubriques dans l'UI
3. Testez avec l'ancien système de calcul
4. Vérifiez que toutes les dépendances sont installées

## ✅ Checklist de Débogage

- [ ] Backend redémarré avec logs détaillés
- [ ] Logs consultés au moment de l'erreur
- [ ] Rubriques vérifiées (script check-rubriques.js)
- [ ] Script CLI testé (fonctionne?)
- [ ] Paramètres de paie vérifiés (tous présents?)
- [ ] Tranches IRG vérifiées (4 tranches?)
- [ ] Employés ont des contrats actifs
- [ ] Structures salariales assignées aux contrats
