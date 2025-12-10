# Guide des Exemples de Données - ERP Ghazal

Ce document décrit les données d'exemple créées pour le système ERP Ghazal et comment les utiliser.

## 📋 Table des Matières

1. [Utilisation du Seed](#utilisation-du-seed)
2. [Structure des Données](#structure-des-données)
3. [Comptes Utilisateurs](#comptes-utilisateurs)
4. [Employés et Contrats](#employés-et-contrats)
5. [Configuration de la Paie](#configuration-de-la-paie)
6. [Exemples de Requêtes API](#exemples-de-requêtes-api)
7. [Scénarios de Test](#scénarios-de-test)

---

## 🚀 Utilisation du Seed

### Exécuter le seed complet

```bash
cd backend
npx ts-node prisma/seed-complete-algerian.ts
```

### Réinitialiser la base de données et re-seeder

```bash
cd backend
npx prisma migrate reset
npx ts-node prisma/seed-complete-algerian.ts
```

---

## 📊 Structure des Données

### Paramètres de Paie Algériens

| Code | Nom | Valeur | Description |
|------|-----|--------|-------------|
| `SNMG` | Salaire National Minimum Garanti | 20 000 DA | SNMG en vigueur depuis 2024 |
| `PLAFOND_CNAS` | Plafond mensuel CNAS | 108 000 DA | Plafond de calcul des cotisations |
| `TAUX_SECURITE_SOCIALE_SALARIE` | Taux SS salarié | 9% | Cotisation sécurité sociale |
| `TAUX_SECURITE_SOCIALE_PATRONALE` | Taux SS patronal | 26% | Cotisation employeur |
| `ABATTEMENT_IRG` | Abattement forfaitaire IRG | 0 DA | Abattement avant calcul IRG |

### Tranches IRG (Impôt sur le Revenu Global)

| Tranche | Salaire Imposable | Taux | Montant Fixe |
|---------|-------------------|------|--------------|
| 1 | 0 - 30 000 DA | 0% | 0 DA |
| 2 | 30 001 - 120 000 DA | 20% | 0 DA |
| 3 | 120 001 - 360 000 DA | 30% | 18 000 DA |
| 4 | > 360 000 DA | 35% | 90 000 DA |

### Cotisations Sociales Algériennes

#### Cotisations Salarié (déduites du brut)

| Nom | Code | Taux |
|-----|------|------|
| Sécurité Sociale (CNAS) | `CNAS_SS_EMPLOYEE` | 9.0% |
| Retraite (CNR) | `CNR_RETIREMENT_EMPLOYEE` | 9.0% |
| Assurance Chômage (CNAC) | `CNAC_UNEMPLOYMENT_EMPLOYEE` | 1.0% |
| **TOTAL SALARIÉ** | | **19.0%** |

#### Cotisations Employeur (informatives)

| Nom | Code | Taux |
|-----|------|------|
| Sécurité Sociale (CNAS) | `CNAS_SS_EMPLOYER` | 12.5% |
| Retraite (CNR) | `CNR_RETIREMENT_EMPLOYER` | 10.0% |
| Assurance Chômage (CNAC) | `CNAC_UNEMPLOYMENT_EMPLOYER` | 1.0% |
| Accidents du Travail | `WORK_ACCIDENT` | 1.25% |
| Œuvres Sociales | `SOCIAL_WORKS` | 1.0% |
| Taxe Formation | `PROFESSIONAL_TRAINING_TAX` | 1.0% |
| **TOTAL EMPLOYEUR** | | **26.75%** |

---

## 👤 Comptes Utilisateurs

### Compte Administrateur

```
Email: directeur@ghazal.dz
Mot de passe: password123
Rôles: ADMIN, MANAGER
Employé: Karim BENALI (Directeur Général)
Salaire: 150 000 DA
```

### Compte RH

```
Email: drh@ghazal.dz
Mot de passe: password123
Rôles: HR, MANAGER
Employé: Fatima MEZIANE (Directrice RH)
Salaire: 100 000 DA
```

---

## 👥 Employés et Contrats

### Liste des 12 Employés Créés

| # | Nom Complet | Poste | Département | Salaire | Type Contrat | Structure |
|---|-------------|-------|-------------|---------|--------------|-----------|
| 1 | **Karim BENALI** | Directeur Général | RH | 150 000 DA | CDI | Cadre |
| 2 | **Fatima MEZIANE** | Directrice RH | RH | 100 000 DA | CDI | Cadre |
| 3 | **Ahmed CHERIF** | Chef Comptable | Comptabilité | 85 000 DA | CDI | Cadre |
| 4 | **Yasmine KHELIFI** | Responsable IT | IT | 90 000 DA | CDI | Cadre |
| 5 | **Mehdi BOUZID** | Développeur Senior | IT | 70 000 DA | CDI | Agent Maîtrise |
| 6 | **Amina SLIMANI** | Développeur Junior | IT | 45 000 DA | CDI | Agent Maîtrise |
| 7 | **Sofiane LAHLOU** | Gestionnaire RH | RH | 55 000 DA | CDI | Agent Maîtrise |
| 8 | **Naima HADJ** | Comptable | Comptabilité | 50 000 DA | CDI | Agent Maîtrise |
| 9 | **Rachid BOUMEDIENE** | Commercial Senior | Commercial | 60 000 DA | CDI | Agent Maîtrise |
| 10 | **Salim ZEROUKI** | Chef de Production | Production | 95 000 DA | CDI | Cadre |
| 11 | **Mourad TALEB** | Ouvrier Qualifié | Production | 30 000 DA | CDI | Ouvrier |
| 12 | **Samira BENSAID** | Assistante Admin | RH | 35 000 DA | CDD | Agent Maîtrise |

### Départements

1. **Technologies de l'Information** (4 employés)
2. **Ressources Humaines** (4 employés)
3. **Comptabilité et Finance** (2 employés)
4. **Commercial et Marketing** (1 employé)
5. **Production** (2 employés)
6. **Logistique et Achats** (0 employé)

---

## 💰 Configuration de la Paie

### Rubriques de Paie Créées

#### GAINS (Soumis aux cotisations et IRG)

| Code | Nom | Type Montant | Valeur par Défaut |
|------|-----|--------------|-------------------|
| `SALAIRE_BASE` | Salaire de Base | FIXE | Variable selon contrat |
| `PRIME_ANCIENNETE` | Prime d'Ancienneté | POURCENTAGE | Variable |
| `PRIME_RENDEMENT` | Prime de Rendement | FIXE | À définir |
| `PRIME_RESPONSABILITE` | Prime de Responsabilité | FIXE | Selon poste |
| `HEURES_SUP` | Heures Supplémentaires | SAISIE | Variable |

#### GAINS (Exonérés de cotisations et IRG)

| Code | Nom | Type Montant | Valeur par Défaut |
|------|-----|--------------|-------------------|
| `PRIME_PANIER` | Prime de Panier | FIXE | 2 000 DA |
| `PRIME_TRANSPORT` | Prime de Transport | FIXE | 3 000 DA |

#### RETENUES

| Code | Nom | Type Montant | Valeur par Défaut |
|------|-----|--------------|-------------------|
| `CNAS_SALARIE` | Cotisation CNAS Salarié | POURCENTAGE | 9% |
| `CNR_SALARIE` | Cotisation CNR Salarié | POURCENTAGE | 9% |
| `CNAC_SALARIE` | Cotisation CNAC Salarié | POURCENTAGE | 1% |
| `IRG` | IRG (Impôt) | FORMULE | Progressif |
| `RETENUE_ABSENCE` | Retenue sur Absence | SAISIE | Variable |
| `AVANCE_SALAIRE` | Avance sur Salaire | SAISIE | Variable |

### Structures Salariales

#### 1. Structure Cadre
- Salaire de Base
- Prime d'Ancienneté
- Prime de Responsabilité
- Prime de Panier
- Prime de Transport
- Toutes les cotisations et IRG

#### 2. Structure Agent Maîtrise
- Salaire de Base
- Prime d'Ancienneté
- Prime de Panier
- Prime de Transport
- Toutes les cotisations et IRG

#### 3. Structure Ouvrier
- Salaire de Base
- Prime de Panier
- Prime de Transport
- Toutes les cotisations et IRG

### Primes Disponibles

| Nom | Mode de Calcul | Valeur | Fréquence |
|-----|----------------|--------|-----------|
| Prime de Performance Annuelle | POURCENTAGE | 10% | Mensuelle |
| Prime de Présence | FIXE | 5 000 DA | Mensuelle |
| Prime d'Objectif | FIXE | 10 000 DA | Mensuelle |
| Prime de 13ème Mois | POURCENTAGE | 100% | Annuelle |

---

## 🔌 Exemples de Requêtes API

### Authentification

#### Login

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "directeur@ghazal.dz",
  "password": "password123"
}
```

**Réponse:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "directeur@ghazal.dz",
    "roles": ["ADMIN", "MANAGER"]
  }
}
```

### Employés

#### Récupérer tous les employés

```bash
GET http://localhost:3000/hr/employees
Authorization: Bearer {access_token}
```

#### Récupérer un employé spécifique

```bash
GET http://localhost:3000/hr/employees/{employeeId}
Authorization: Bearer {access_token}
```

#### Créer un nouvel employé

```bash
POST http://localhost:3000/hr/employees
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "firstName": "Mohamed",
  "lastName": "SAIDI",
  "workEmail": "mohamed.saidi@ghazal.dz",
  "jobTitle": "Développeur Backend",
  "workPhone": "+213 23 45 68 01",
  "workMobile": "+213 555 12 34 56",
  "hireDate": "2024-01-15",
  "departmentId": "uuid-department-it",
  "positionId": "uuid-position-dev",
  "birthday": "1993-07-20",
  "gender": "MALE",
  "nationality": "Algérienne",
  "maritalStatus": "SINGLE",
  "address": "123 Rue Example, Alger",
  "socialSecurityNumber": "1993072012345678",
  "cnasAgency": "CNAS Alger Centre",
  "paymentMethod": "VIREMENT",
  "status": "ACTIVE"
}
```

### Contrats

#### Créer un contrat

```bash
POST http://localhost:3000/hr/contracts
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "employeeId": "uuid-employee",
  "reference": "CDI-2024-013",
  "type": "CDI",
  "status": "RUNNING",
  "cnasScheme": "GENERAL",
  "fiscalScheme": "IMPOSABLE",
  "executiveStatus": "NON_CADRE",
  "wage": 50000,
  "weeklyHours": 40,
  "classification": "Agent d'Exécution",
  "coefficient": 450,
  "workSchedule": "FIVE_DAYS",
  "startDate": "2024-01-15",
  "salaryStructureId": "uuid-structure-agent"
}
```

### Bulletins de Paie

#### Générer les bulletins de paie pour un mois

```bash
POST http://localhost:3000/hr/payslips/generate
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "month": 11,
  "year": 2024,
  "employeeIds": []  // Vide = tous les employés
}
```

**Réponse:**
```json
{
  "generated": 12,
  "payslips": [
    {
      "id": "uuid",
      "employeeId": "uuid",
      "month": 11,
      "year": 2024,
      "baseSalary": 150000,
      "grossSalary": 185000,
      "totalEmployeeContributions": 28500,
      "taxableSalary": 156500,
      "incomeTax": 34450,
      "netSalary": 122050,
      "totalEmployerContributions": 49475,
      "status": "DRAFT"
    }
  ]
}
```

#### Télécharger le PDF d'un bulletin

```bash
GET http://localhost:3000/hr/payslips/{payslipId}/pdf
Authorization: Bearer {access_token}
```

### Rubriques de Paie

#### Créer une nouvelle rubrique

```bash
POST http://localhost:3000/hr/rubriques
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "code": "PRIME_NUIT",
  "nom": "Prime de Nuit",
  "type": "GAIN",
  "montantType": "POURCENTAGE",
  "valeur": 25,
  "soumisCnas": true,
  "soumisIrg": true,
  "soumisChargeEmployeur": true,
  "ordreAffichage": 8,
  "isActive": true
}
```

#### Assigner une rubrique à un employé

```bash
POST http://localhost:3000/hr/employees/{employeeId}/rubriques
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "rubriqueId": "uuid-rubrique",
  "montantOverride": 5000,
  "startDate": "2024-01-01"
}
```

### Primes

#### Assigner une prime à un employé

```bash
POST http://localhost:3000/hr/employees/{employeeId}/bonuses
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "bonusId": "uuid-bonus",
  "frequency": "MONTHLY",
  "amount": 10000,
  "startDate": "2024-01-01"
}
```

### Structures Salariales

#### Ajouter une rubrique à une structure

```bash
POST http://localhost:3000/hr/salary-structures/{structureId}/rubriques
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "rubriqueId": "uuid-rubrique",
  "ordre": 10
}
```

---

## 🧪 Scénarios de Test

### Scénario 1: Calcul de Paie pour un Cadre Supérieur

**Employé:** Karim BENALI (Directeur Général)

**Configuration:**
- Salaire de base: 150 000 DA
- Prime de responsabilité: 30 000 DA
- Prime de panier: 2 000 DA (exonérée)
- Prime de transport: 3 000 DA (exonérée)
- Prime d'ancienneté: 10% du salaire de base = 15 000 DA

**Calcul:**
```
Salaire Brut = 150 000 + 30 000 + 15 000 = 195 000 DA
Primes Exonérées = 2 000 + 3 000 = 5 000 DA

Cotisations Salariales:
- CNAS (9%): 195 000 × 0.09 = 17 550 DA
- CNR (9%): 195 000 × 0.09 = 17 550 DA
- CNAC (1%): 195 000 × 0.01 = 1 950 DA
Total Cotisations: 37 050 DA

Salaire Imposable = 195 000 - 37 050 = 157 950 DA

IRG (Tranche 3):
Base = 157 950 - 120 000 = 37 950 DA
IRG = 18 000 + (37 950 × 0.30) = 18 000 + 11 385 = 29 385 DA

Salaire Net = 157 950 - 29 385 + 5 000 = 133 565 DA
```

### Scénario 2: Calcul de Paie pour un Ouvrier

**Employé:** Mourad TALEB (Ouvrier Qualifié)

**Configuration:**
- Salaire de base: 30 000 DA
- Prime de panier: 2 000 DA (exonérée)
- Prime de transport: 3 000 DA (exonérée)

**Calcul:**
```
Salaire Brut = 30 000 DA
Primes Exonérées = 2 000 + 3 000 = 5 000 DA

Cotisations Salariales:
- CNAS (9%): 30 000 × 0.09 = 2 700 DA
- CNR (9%): 30 000 × 0.09 = 2 700 DA
- CNAC (1%): 30 000 × 0.01 = 300 DA
Total Cotisations: 5 700 DA

Salaire Imposable = 30 000 - 5 700 = 24 300 DA

IRG = 0 DA (sous le seuil de 30 000 DA)

Salaire Net = 24 300 + 5 000 = 29 300 DA
```

### Scénario 3: Gestion des Absences

#### Créer une demande de congé

```bash
POST http://localhost:3000/hr/leave-requests
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "employeeId": "uuid-employee",
  "type": "ANNUAL_LEAVE",
  "startDate": "2024-12-20",
  "endDate": "2024-12-31",
  "reason": "Congé de fin d'année"
}
```

#### Enregistrer une absence

```bash
POST http://localhost:3000/hr/absences
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "employeeId": "uuid-employee",
  "date": "2024-12-15",
  "isFullDay": true,
  "reason": "Congé maladie",
  "reasonRelId": "uuid-absence-reason"
}
```

### Scénario 4: Workflow Complet d'Onboarding

1. **Créer l'employé**
2. **Créer le contrat**
3. **Assigner la structure salariale**
4. **Assigner les rubriques personnalisées**
5. **Assigner les primes**
6. **Générer le premier bulletin de paie**
7. **Télécharger le PDF du bulletin**

### Scénario 5: Gestion d'une Augmentation

```bash
# 1. Créer une nouvelle version du contrat avec le nouveau salaire
PUT http://localhost:3000/hr/contracts/{contractId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "wage": 95000,  // Ancien: 90000
  "classification": "Cadre Confirmé",
  "coefficient": 720
}

# 2. Ajouter une prime de responsabilité si passage à cadre
POST http://localhost:3000/hr/employees/{employeeId}/rubriques
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "rubriqueId": "uuid-prime-responsabilite",
  "montantOverride": 12000,
  "startDate": "2024-01-01"
}
```

---

## 📝 Notes Importantes

### Règles Métier Algériennes

1. **SNMG**: Le salaire de base ne peut pas être inférieur à 20 000 DA
2. **Plafond CNAS**: Les cotisations sont plafonnées à 108 000 DA
3. **IRG**: Calcul progressif par tranches avec abattement possible
4. **Primes exonérées**: Les primes de panier et transport ne sont pas soumises aux cotisations ni à l'IRG (dans la limite des barèmes légaux)

### Bonnes Pratiques

1. **Toujours générer les bulletins en mode DRAFT** avant validation
2. **Vérifier les calculs** avant de marquer les bulletins comme VALIDATED
3. **Archiver les bulletins** en PDF dès validation
4. **Maintenir l'historique** des paramètres de paie et des tranches IRG
5. **Documenter les formules personnalisées** dans les rubriques

### Maintenance des Données

#### Mise à jour annuelle du SNMG

```bash
POST http://localhost:3000/hr/payroll-parameters
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "code": "SNMG",
  "nom": "Salaire National Minimum Garanti",
  "valeur": 22000,
  "description": "SNMG en vigueur depuis 2025",
  "startDate": "2025-01-01"
}
```

#### Mise à jour des tranches IRG

```bash
POST http://localhost:3000/hr/tax-brackets
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "nom": "Tranche 1 - Exonéré",
  "minAmount": 0,
  "maxAmount": 35000,
  "rate": 0,
  "fixedAmount": 0,
  "ordre": 1,
  "startDate": "2025-01-01"
}
```

---

## 🆘 Dépannage

### Problème: Les bulletins ne se génèrent pas

**Solution:** Vérifier que:
1. L'employé a un contrat actif (status: RUNNING)
2. L'employé a une structure salariale assignée
3. Les rubriques de base sont présentes (SALAIRE_BASE, cotisations, IRG)

### Problème: Calcul IRG incorrect

**Solution:** Vérifier:
1. Les tranches IRG sont correctement configurées
2. Les dates de validité des tranches incluent le mois de paie
3. Le salaire imposable est correct (brut - cotisations)

### Problème: PDF ne se génère pas

**Solution:** Vérifier:
1. Le bulletin existe et a un ID valide
2. Les données du bulletin sont complètes
3. Le service PDF est démarré et accessible

---

## 📞 Support

Pour toute question ou problème, contactez l'équipe de développement:
- Email: support@ghazal.dz
- Documentation technique: `/OPTIMIZATIONS.md`
- Schéma de données: `/backend/prisma/schema.prisma`

---

**Version:** 1.0
**Dernière mise à jour:** Décembre 2024
**Auteur:** ERP Ghazal Development Team
