# 📋 Comment Générer les Bulletins de Paie - Guide Rapide

Votre système ERP Ghazal possède 3 méthodes pour générer les bulletins de paie mensuels:

## 🎯 Méthode 1: Via l'API (Recommandé pour l'intégration)

### Démarrer le Backend
```bash
cd backend
npm run start
# Le serveur démarre sur http://localhost:3000
```

### Utiliser le Script Node.js
```bash
# Générer pour TOUS les employés
node generate-payslips-api.js --email responsable.it@ghazal.dz --password password123 --month 12 --year 2024

# Générer pour UN SEUL employé
node generate-payslips-api.js --email responsable.it@ghazal.dz --password password123 --month 12 --year 2024 --single responsable.it@ghazal.dz
```

**Avantages:**
- ✅ Intégrable dans votre frontend
- ✅ Possibilité de télécharger les PDF
- ✅ Consultation des bulletins générés
- ✅ Workflow complet (DRAFT → VALIDATED → PAID)

**Documentation complète:** Voir `API_PAYSLIP_GUIDE.md`

## 🛠️ Méthode 2: Scripts Prisma (Pour développement/tests)

### Générer via le Script TypeScript
```bash
cd backend

# Tous les employés
npx ts-node prisma/generate-monthly-payslips.ts --month 12 --year 2024

# Un seul employé
npx ts-node prisma/generate-monthly-payslips.ts --email responsable.it@ghazal.dz --month 12 --year 2024
```

**Avantages:**
- ✅ Accès direct à la base de données
- ✅ Affichage détaillé dans le terminal
- ✅ Utile pour tests et débogage

**Documentation complète:** Voir `backend/prisma/PAYSLIP_GUIDE.md`

## 💻 Méthode 3: Via le Frontend (À implémenter)

### Créer une Interface Utilisateur

Utilisez les exemples React/TypeScript dans `API_PAYSLIP_GUIDE.md` pour créer:

1. **Page de Génération de Bulletins**
   - Sélection du mois/année
   - Sélection des employés (checkboxes)
   - Bouton "Générer"

2. **Page de Consultation**
   - Liste des bulletins générés
   - Filtres par mois/année
   - Bouton de téléchargement PDF

3. **Workflow de Validation**
   - Status: DRAFT → VALIDATED → PAID
   - Actions: Valider, Rejeter, Marquer comme payé

## 📊 Résultat de la Génération

Voici ce que vous obtiendrez pour chaque employé:

```
📊 Votre Nom
   Position: Responsable IT
   Département: Technologies de l'Information
   ─────────────────────────────────────────────
   💼 Salaire de base:     100 000,00 DA
   🎁 Primes:               40 000,00 DA
   💰 Salaire brut:        140 000,00 DA
   📉 Cotisations:           9 720,00 DA
   💸 IRG:                  21 083,70 DA
   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   ┃ 💵 SALAIRE NET:      109 196,30 DA ┃
   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

## 🔐 Identifiants de Connexion

### Utilisateurs Principaux
- **Email:** directeur@ghazal.dz
  **Mot de passe:** password123
  **Rôles:** ADMIN, MANAGER

- **Email:** drh@ghazal.dz
  **Mot de passe:** password123
  **Rôles:** HR, MANAGER

### Votre Compte (Responsable IT)
- **Email:** responsable.it@ghazal.dz
  **Mot de passe:** password123
  **Rôles:** USER, MANAGER

## 📁 Structure des Fichiers

```
ERPghazal/
├── API_PAYSLIP_GUIDE.md                    # Documentation complète de l'API
├── COMMENT_UTILISER_BULLETINS_PAIE.md      # Ce fichier (guide rapide)
├── generate-payslips-api.js                # Script Node.js pour l'API
│
└── backend/
    ├── prisma/
    │   ├── seed-complete-algerian.ts       # Seed principal (données de base)
    │   ├── seed-it-manager-simulation.ts   # Simulation Responsable IT
    │   ├── generate-monthly-payslips.ts    # Générateur CLI
    │   └── PAYSLIP_GUIDE.md                # Guide des scripts Prisma
    │
    └── src/
        └── hr/
            ├── hr.controller.ts             # Routes API
            ├── hr.service.ts                # Logique métier
            └── services/
                ├── payroll-calculation.service.ts  # Calculs
                └── pdf-generation.service.ts       # Génération PDF
```

## 🚀 Démarrage Rapide (3 étapes)

### 1. Initialiser les Données
```bash
cd backend
npx ts-node prisma/seed-complete-algerian.ts
```

### 2. Démarrer le Backend
```bash
cd backend
npm run start
```

### 3. Générer les Bulletins
```bash
node generate-payslips-api.js --email responsable.it@ghazal.dz --password password123 --month 12 --year 2024
```

## 📞 Endpoints API Essentiels

```bash
# Backend URL
http://localhost:3000

# Authentification
POST /auth/login

# Employés
GET  /hr/employees

# Bulletins de Paie
POST /hr/payslips/generate
GET  /hr/payslips
GET  /hr/payslips/:id/pdf
DELETE /hr/payslips/:id
```

## 💡 Conseils

1. **Pour le développement:** Utilisez les scripts Prisma (méthode 2)
2. **Pour la production:** Utilisez l'API (méthode 1) avec le frontend
3. **Pour tester:** Utilisez le script Node.js `generate-payslips-api.js`

## ⚠️ Important

- **Format du Mois:** L'API utilise 0-11 (0=Janvier, 11=Décembre)
- **Scripts CLI:** Utilisent 1-12 (1=Janvier, 12=Décembre)
- **Unicité:** Un seul bulletin par employé par mois/année
- **Status:** Les bulletins sont créés en DRAFT par défaut

## 📖 Pour Aller Plus Loin

- **API complète:** Consultez `API_PAYSLIP_GUIDE.md`
- **Scripts Prisma:** Consultez `backend/prisma/PAYSLIP_GUIDE.md`
- **Calculs détaillés:** Voir les deux guides ci-dessus

## 🎯 Workflow Complet

```
1. Seed Initial
   └─> npx ts-node prisma/seed-complete-algerian.ts

2. Créer Employé (via API/Frontend)
   └─> POST /hr/employees

3. Créer Contrat
   └─> POST /hr/contracts

4. Assigner Primes (optionnel)
   └─> POST /hr/employees/:id/bonuses

5. Générer Bulletins
   └─> POST /hr/payslips/generate

6. Consulter/Valider
   └─> GET /hr/payslips
   └─> PUT /hr/payslips/:id (changer status)

7. Télécharger PDF
   └─> GET /hr/payslips/:id/pdf
```

---

**Bonne génération de bulletins! 🎉**
