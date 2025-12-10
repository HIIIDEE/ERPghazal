# 🎨 Guide d'Utilisation du Frontend - Bulletins de Paie

## ✅ Bonne Nouvelle: L'Interface Existe Déjà!

Votre frontend possède déjà une interface complète et fonctionnelle pour générer les bulletins de paie! Voici comment l'utiliser.

## 🚀 Accès à l'Interface

### 1. Démarrer le Frontend
```bash
cd frontend
npm run dev
# L'application démarre sur http://localhost:5173
```

### 2. Se Connecter
Utilisez l'un de ces comptes:
- **Email:** responsable.it@ghazal.dz
  **Mot de passe:** password123

- **Email:** drh@ghazal.dz
  **Mot de passe:** password123

- **Email:** directeur@ghazal.dz
  **Mot de passe:** password123

### 3. Naviguer vers la Paie
Dans le menu de gauche, cliquez sur **"Gestion de la Paie"** (icône 💰)

## 📊 Interface de Génération des Bulletins

### Vue d'Ensemble

L'interface possède **6 onglets** de gestion:

1. **Rubriques** - Configuration des lignes de paie
2. **Structures** - Structures salariales (Cadre, Agent, Ouvrier)
3. **Paramètres** - Paramètres de paie (SNMG, plafond CNAS, etc.)
4. **Barème IRG** - Tranches d'imposition
5. **Attribution** - Assigner des rubriques aux employés
6. **Bulletins de paie** ⭐ - **C'est ici que vous générez!**

### Onglet "Bulletins de paie" 🎯

Cliquez sur l'onglet **"Bulletins de paie"** pour accéder à l'interface de génération.

## 🎬 Comment Générer les Bulletins

### Interface de Génération

Vous verrez:

```
┌─────────────────────────────────────────────────────────────┐
│  📅 [Mois ▼]  [Année ▼]           [Générer (0) ⚡]         │
├─────────────────────────────────────────────────────────────┤
│  □  Employé            Poste              Salaire de base   │
│  □  Karim BENALI       Directeur Général  150 000 DA       │
│  □  Fatima MEZIANE     Directrice RH      100 000 DA       │
│  □  Votre Nom          Responsable IT     100 000 DA       │
│  □  Ahmed CHERIF       Développeur Senior  85 000 DA       │
│  ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

### Étapes pour Générer

#### 1. **Sélectionner le Mois et l'Année**
   - Utilisez les menus déroulants en haut
   - Exemple: **Décembre** et **2024**

#### 2. **Sélectionner les Employés**

   **Option A: Tous les employés**
   - Cochez la case dans l'en-tête du tableau (en haut à gauche)
   - ✅ Tous les employés seront sélectionnés

   **Option B: Employés spécifiques**
   - Cochez individuellement les cases des employés souhaités
   - Exemple: Cochez uniquement "Votre Nom" pour générer votre bulletin

#### 3. **Cliquer sur "Générer"**
   - Le bouton affiche le nombre d'employés sélectionnés
   - Exemple: **"Générer (12)"** si 12 employés sont sélectionnés
   - Le bouton est désactivé si aucun employé n'est sélectionné

#### 4. **Téléchargement Automatique**
   - Les bulletins sont générés dans la base de données
   - Les PDF sont automatiquement téléchargés dans votre dossier Téléchargements
   - Format: `bulletin-paie-NOM-mois-année.pdf`
   - Exemple: `bulletin-paie-Nom-décembre-2024.pdf`

#### 5. **Confirmation**
   - Une alerte confirme la génération:
   - **"12 bulletin(s) de paie généré(s) et téléchargé(s) avec succès pour décembre 2024"**

## 📋 Ce que Fait le Système Automatiquement

### Lors de la Génération:

1. ✅ **Appelle l'API Backend**
   ```typescript
   POST /hr/payslips/generate
   {
     "employeeIds": ["id1", "id2", ...],
     "month": 11,
     "year": 2024
   }
   ```

2. ✅ **Calcule Automatiquement**
   - Salaire de base (depuis le contrat actif)
   - Primes mensuelles assignées
   - Salaire brut (base + primes)
   - Cotisations sociales (SS 9% + Retraite 9% + Chômage 1.5%)
   - Salaire imposable
   - IRG selon les tranches algériennes
   - Salaire net

3. ✅ **Génère les PDF**
   - Un PDF pour chaque employé
   - Format professionnel avec logo et détails
   - Téléchargement automatique avec nom formaté

4. ✅ **Enregistre dans la Base**
   - Status: DRAFT (brouillon)
   - Peut être consulté/modifié/validé plus tard

## 💡 Fonctionnalités Avancées

### Données Affichées dans le Tableau

Pour chaque employé, vous voyez:
- ✅ Nom complet
- ✅ Poste
- ✅ Département
- ✅ Salaire de base (depuis le contrat actif)

### Gestion Intelligente

Le système vérifie automatiquement:
- ✅ Seuls les employés avec un **contrat actif** peuvent avoir un bulletin
- ✅ Les **primes mensuelles** sont incluses automatiquement
- ✅ Les **primes ponctuelles** du mois sont incluses
- ✅ Un seul bulletin par employé par mois (upsert automatique)

## 🎯 Exemples d'Utilisation

### Exemple 1: Générer pour Tous les Employés

1. Allez à **Gestion de la Paie** → **Bulletins de paie**
2. Sélectionnez **Décembre 2024**
3. Cochez la case en haut du tableau
4. Cliquez sur **"Générer (12)"**
5. Attendez le téléchargement des 12 PDF
6. Confirmation: **"12 bulletin(s) générés et téléchargés"**

### Exemple 2: Générer Seulement pour Vous

1. Allez à **Gestion de la Paie** → **Bulletins de paie**
2. Sélectionnez **Décembre 2024**
3. Cochez uniquement **"Votre Nom"**
4. Cliquez sur **"Générer (1)"**
5. Le PDF `bulletin-paie-Nom-décembre-2024.pdf` est téléchargé
6. Confirmation: **"1 bulletin(s) généré(s) et téléchargé(s)"**

### Exemple 3: Générer pour un Département

1. Allez à **Gestion de la Paie** → **Bulletins de paie**
2. Sélectionnez **Décembre 2024**
3. Cochez manuellement tous les employés du département IT
4. Cliquez sur **"Générer (X)"**
5. Les PDF sont téléchargés

## 📂 Fichiers Téléchargés

Les PDF sont téléchargés dans votre dossier **Téléchargements** avec ce format:

```
bulletin-paie-BENALI-décembre-2024.pdf
bulletin-paie-MEZIANE-décembre-2024.pdf
bulletin-paie-Nom-décembre-2024.pdf
...
```

## 🔍 Consulter les Bulletins Générés

Après la génération, les bulletins sont enregistrés dans la base de données.

**À implémenter (prochainement):**
- Une liste des bulletins générés
- Filtres par mois/année/employé
- Boutons de re-téléchargement
- Changement de status (DRAFT → VALIDATED → PAID)
- Suppression de bulletins

## ⚙️ Configuration Requise

### Avant de Générer

Assurez-vous que:

1. ✅ **Le Backend est démarré**
   ```bash
   cd backend
   npm run start
   # http://localhost:3000
   ```

2. ✅ **Les Données de Base Existent**
   - Paramètres de paie (SNMG, plafond CNAS, taux)
   - Tranches IRG
   - Cotisations sociales
   - Employés avec contrats actifs

3. ✅ **Les Employés ont des Contrats**
   - Chaque employé doit avoir un contrat actif (RUNNING)
   - Le contrat contient le salaire de base

4. ✅ **Les Primes sont Assignées (optionnel)**
   - Allez dans l'onglet **Attribution**
   - Assignez des primes aux employés si nécessaire

## 🛠️ Personnalisation

### Modifier le PDF Généré

Le PDF est généré côté backend par le service:
```
backend/src/hr/services/pdf-generation.service.ts
```

Vous pouvez personnaliser:
- Le design du bulletin
- Les informations affichées
- Le logo de l'entreprise
- Le format du document

### Modifier l'Interface

L'interface se trouve dans:
```
frontend/src/pages/Payroll.tsx
```

Vous pouvez:
- Changer les couleurs
- Ajouter des filtres
- Ajouter des colonnes au tableau
- Personnaliser les boutons

## 📊 Résumé des Fichiers Frontend

```
frontend/src/
├── pages/
│   └── Payroll.tsx                  # Page principale (avec génération)
├── features/hr/
│   ├── employeeStore.ts             # Store Zustand (appels API)
│   ├── PayslipTable.tsx             # Tableau des employés
│   ├── RubriquesConfiguration.tsx   # Onglet Rubriques
│   ├── SalaryStructuresConfig.tsx   # Onglet Structures
│   ├── PayrollParametersConfig.tsx  # Onglet Paramètres
│   └── TaxBracketsConfig.tsx        # Onglet Barème IRG
```

## ⚠️ Notes Importantes

1. **Téléchargements Multiples**:
   - Si vous sélectionnez beaucoup d'employés, il y aura plusieurs téléchargements
   - Un délai de 500ms est appliqué entre chaque téléchargement
   - Certains navigateurs peuvent demander confirmation

2. **Performance**:
   - La génération peut prendre quelques secondes pour beaucoup d'employés
   - Attendez le message de confirmation

3. **Unicité**:
   - Si vous générez deux fois pour le même employé/mois/année
   - Le bulletin est mis à jour (pas de duplication)

## 🎉 Résumé

**Votre interface frontend est déjà prête et fonctionnelle!**

Pour l'utiliser:
1. ✅ Démarrez le backend: `cd backend && npm run start`
2. ✅ Démarrez le frontend: `cd frontend && npm run dev`
3. ✅ Connectez-vous avec vos identifiants
4. ✅ Allez à **Gestion de la Paie** → **Bulletins de paie**
5. ✅ Sélectionnez mois, année et employés
6. ✅ Cliquez sur **"Générer"**
7. ✅ Les PDF sont téléchargés automatiquement!

**Vous n'avez rien à coder!** Tout est déjà là! 🚀
