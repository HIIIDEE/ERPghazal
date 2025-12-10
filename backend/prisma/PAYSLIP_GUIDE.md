# Guide de Génération des Bulletins de Paie

Ce document explique comment utiliser le système de génération automatique des bulletins de paie mensuels.

## 📋 Scripts Disponibles

### 1. Seed Principal
**Fichier:** `seed-complete-algerian.ts`

Initialise la base de données avec toutes les données nécessaires:
- Paramètres de paie algériens (SNMG, plafond CNAS, taux de cotisation)
- Tranches IRG
- Cotisations sociales
- Départements et positions
- Rubriques de paie
- Structures salariales
- Primes
- Employés avec leurs contrats

**Commande:**
```bash
cd backend
npx ts-node prisma/seed-complete-algerian.ts
```

### 2. Simulation Responsable IT
**Fichier:** `seed-it-manager-simulation.ts`

Crée un profil de Responsable IT avec:
- Salaire de base: 100 000 DA
- Prime de Responsabilité: 20 000 DA
- Prime de Disponibilité: 20 000 DA
- **Salaire brut: 140 000 DA**
- **Salaire net: ~109 196 DA**

**Commande:**
```bash
cd backend
npx ts-node prisma/seed-it-manager-simulation.ts
```

### 3. Générateur de Bulletins de Paie Mensuels
**Fichier:** `generate-monthly-payslips.ts`

Génère automatiquement les bulletins de paie pour un ou plusieurs employés.

## 🚀 Utilisation du Générateur de Bulletins

### Générer pour TOUS les employés actifs

Pour le mois actuel:
```bash
cd backend
npx ts-node prisma/generate-monthly-payslips.ts
```

Pour un mois spécifique (ex: Décembre 2024):
```bash
cd backend
npx ts-node prisma/generate-monthly-payslips.ts --month 12 --year 2024
```

### Générer pour UN employé spécifique

Par email (ex: Responsable IT):
```bash
cd backend
npx ts-node prisma/generate-monthly-payslips.ts --email responsable.it@ghazal.dz --month 12 --year 2024
```

Pour le mois actuel:
```bash
cd backend
npx ts-node prisma/generate-monthly-payslips.ts --email responsable.it@ghazal.dz
```

## 📊 Exemple de Bulletin Généré

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 BULLETIN DE PAIE - Décembre 2024
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Employé: Votre Nom
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💼 GAINS:
   Salaire de base:              100 000,00 DA
   Primes:                        40 000,00 DA
   ─────────────────────────────────────────────
   SALAIRE BRUT:                 140 000,00 DA

📉 RETENUES (Cotisations Salariales):
   SS EMPLOYEE                     9 720,00 DA
   RETIREMENT EMPLOYEE                 0,00 DA
   UNEMPLOYMENT EMPLOYEE               0,00 DA
   ─────────────────────────────────────────────
   Total cotisations:              9 720,00 DA

   SALAIRE IMPOSABLE:            130 280,00 DA

💸 IMPÔT SUR LE REVENU (IRG):
   IRG:                           21 083,70 DA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💵 SALAIRE NET À PAYER:           109 196,30 DA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️  COTISATIONS PATRONALES:
   SS EMPLOYER                    28 080,00 DA
   RETIREMENT EMPLOYER                 0,00 DA
   ─────────────────────────────────────────────
   Total patronal:                28 080,00 DA

💼 COÛT TOTAL EMPLOYEUR:          168 080,00 DA
```

## 💰 Calculs Effectués

### 1. Salaire Brut
```
Salaire Brut = Salaire de Base + Primes Mensuelles
```

### 2. Cotisations Sociales Salariales
Calculées sur l'assiette plafonnée (max 108 000 DA pour les cadres):

- **Sécurité Sociale (9%):** Assiette × 9%
- **Retraite (9%):** Assiette × 9%
- **Assurance Chômage (1,5%):** Assiette × 1,5%

**Total Cotisations Salariales = SS + Retraite + Chômage**

### 3. Salaire Imposable
```
Salaire Imposable = Salaire Brut - Cotisations Salariales
```

### 4. IRG (Impôt sur le Revenu Global)
Calculé selon les tranches progressives algériennes:

| Tranche | Revenu Annuel | Taux | Montant Fixe |
|---------|--------------|------|--------------|
| 1 | 0 - 30 000 DA | 0% | 0 DA |
| 2 | 30 001 - 120 000 DA | 20% | 0 DA |
| 3 | 120 001 - 360 000 DA | 30% | 18 000 DA |
| 4 | > 360 000 DA | 35% | 90 000 DA |

**Formule:**
```
IRG = Montant Fixe + (Salaire Imposable - Min Tranche) × Taux
```

### 5. Salaire Net
```
Salaire Net = Salaire Imposable - IRG
```

### 6. Cotisations Patronales (informatif)
- **Sécurité Sociale (26%):** Assiette × 26%
- **Retraite (10%):** Assiette × 10%

### 7. Coût Total Employeur
```
Coût Total = Salaire Brut + Cotisations Patronales
```

## 🔍 Détails Techniques

### Schémas CNAS
Le système supporte 3 schémas CNAS:

1. **GENERAL**: Cotisations normales avec plafonnement
2. **CADRE**: Cotisations cadres avec plafonnement
3. **NON_ASSUJETTI**: Pas de cotisations sociales

### Régimes Fiscaux
1. **IMPOSABLE**: Soumis à l'IRG normal
2. **ABATTEMENT_40**: IRG réduit de 40%
3. **EXONERE**: Pas d'IRG

### Statut Cadre
- **CADRE**: Cadre
- **NON_CADRE**: Non-cadre
- **MAITRISE**: Agent de maîtrise

## 📁 Structure des Données

Les bulletins de paie sont enregistrés dans la table `Payslip` avec:

```typescript
{
  employeeId: string
  month: number (0-11)
  year: number
  baseSalary: number
  bonuses: number
  grossSalary: number
  employeeContributions: JSON
  totalEmployeeContributions: number
  taxableSalary: number
  incomeTax: number
  netSalary: number
  employerContributions: JSON
  totalEmployerContributions: number
  status: 'DRAFT' | 'VALIDATED' | 'PAID'
}
```

## 🎯 Cas d'Usage

### Scénario 1: Génération mensuelle automatique
```bash
# À exécuter le 1er de chaque mois
npx ts-node prisma/generate-monthly-payslips.ts
```

### Scénario 2: Régénération avec modifications
Si vous modifiez un contrat ou des primes, régénérez le bulletin:
```bash
npx ts-node prisma/generate-monthly-payslips.ts --email employe@ghazal.dz --month 12 --year 2024
```

### Scénario 3: Génération pour plusieurs mois
Pour générer les bulletins de janvier à décembre 2024:
```bash
for month in {1..12}; do
  npx ts-node prisma/generate-monthly-payslips.ts --month $month --year 2024
done
```

## ⚠️ Notes Importantes

1. **Unicité**: Un seul bulletin par employé par mois/année (upsert automatique)
2. **Contrat Actif**: Seuls les employés avec un contrat RUNNING sont traités
3. **Primes Mensuelles**: Seules les primes avec `frequency: 'MONTHLY'` sont incluses
4. **Status**: Les bulletins sont créés en status 'DRAFT' par défaut

## 🔐 Identifiants de Test

### Administrateur
- Email: directeur@ghazal.dz
- Mot de passe: password123
- Rôles: ADMIN, MANAGER

### Responsable RH
- Email: drh@ghazal.dz
- Mot de passe: password123
- Rôles: HR, MANAGER

### Responsable IT (simulation)
- Email: responsable.it@ghazal.dz
- Mot de passe: password123
- Rôles: USER, MANAGER

## 📞 Support

Pour toute question sur les calculs ou les scripts, référez-vous à:
- La législation algérienne en matière de paie
- Le code source des scripts de génération
- Les paramètres de paie dans la base de données
