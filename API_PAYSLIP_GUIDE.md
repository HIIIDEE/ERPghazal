# Guide d'Utilisation de l'API de Génération de Bulletins de Paie

Votre système ERP Ghazal possède déjà une API complète pour la gestion des bulletins de paie. Ce guide vous explique comment l'utiliser.

## 🌐 Configuration de Base

**URL de base:** `http://localhost:3000`
**Module:** `/hr`

## 🔐 Authentification

La plupart des endpoints nécessitent une authentification JWT. Pour obtenir un token:

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "responsable.it@ghazal.dz",
  "password": "password123"
}
```

**Réponse:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "responsable.it@ghazal.dz",
    "roles": ["USER", "MANAGER"]
  }
}
```

Utilisez ce token dans toutes les requêtes suivantes:
```
Authorization: Bearer <votre_token>
```

## 📋 Endpoints Disponibles

### 1. Générer des Bulletins de Paie

**Endpoint:** `POST /hr/payslips/generate`

Génère les bulletins de paie pour un ou plusieurs employés pour un mois donné.

**Requête:**
```bash
curl -X POST http://localhost:3000/hr/payslips/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <votre_token>" \
  -d '{
    "employeeIds": ["employee-id-1", "employee-id-2"],
    "month": 11,
    "year": 2024
  }'
```

**Paramètres:**
- `employeeIds`: Array - Liste des IDs des employés (obligatoire)
- `month`: Number - Mois (0-11, où 0 = Janvier, 11 = Décembre)
- `year`: Number - Année (ex: 2024)

**Réponse:**
```json
[
  {
    "id": "payslip-id-1",
    "employeeId": "employee-id-1",
    "month": 11,
    "year": 2024,
    "baseSalary": 100000,
    "bonuses": 40000,
    "grossSalary": 140000,
    "employeeContributions": {
      "SS_EMPLOYEE": {
        "name": "Sécurité Sociale",
        "rate": 9,
        "amount": 9720
      }
    },
    "totalEmployeeContributions": 9720,
    "taxableSalary": 130280,
    "incomeTax": 21083.70,
    "netSalary": 109196.30,
    "employerContributions": {
      "SS_EMPLOYER": {
        "name": "Sécurité Sociale Patronale",
        "rate": 26,
        "amount": 28080
      }
    },
    "totalEmployerContributions": 28080,
    "status": "DRAFT",
    "employee": {
      "firstName": "Votre",
      "lastName": "Nom",
      "workEmail": "responsable.it@ghazal.dz",
      "department": {
        "name": "Technologies de l'Information"
      },
      "position": {
        "title": "Responsable IT"
      }
    }
  }
]
```

### 2. Récupérer les Bulletins de Paie

**Endpoint:** `GET /hr/payslips`

Récupère tous les bulletins de paie, avec filtres optionnels.

**Requête:**
```bash
# Tous les bulletins
curl http://localhost:3000/hr/payslips \
  -H "Authorization: Bearer <votre_token>"

# Filtrer par mois et année
curl "http://localhost:3000/hr/payslips?month=11&year=2024" \
  -H "Authorization: Bearer <votre_token>"
```

**Paramètres de requête (optionnels):**
- `month`: Number - Filtrer par mois
- `year`: Number - Filtrer par année

**Réponse:** Array de bulletins de paie (même format que génération)

### 3. Télécharger un Bulletin en PDF

**Endpoint:** `GET /hr/payslips/:id/pdf`

Télécharge un bulletin de paie au format PDF.

**Requête:**
```bash
curl http://localhost:3000/hr/payslips/<payslip-id>/pdf \
  -H "Authorization: Bearer <votre_token>" \
  --output bulletin-paie.pdf
```

**Réponse:** Fichier PDF

### 4. Récupérer les Employés

**Endpoint:** `GET /hr/employees`

Liste tous les employés (nécessaire pour obtenir les employeeIds).

**Requête:**
```bash
curl http://localhost:3000/hr/employees \
  -H "Authorization: Bearer <votre_token>"
```

**Réponse:**
```json
[
  {
    "id": "employee-id-1",
    "firstName": "Votre",
    "lastName": "Nom",
    "workEmail": "responsable.it@ghazal.dz",
    "jobTitle": "Responsable IT",
    "status": "ACTIVE",
    "hireDate": "2024-01-01T00:00:00.000Z",
    "department": {
      "id": "dept-id",
      "name": "Technologies de l'Information"
    },
    "position": {
      "id": "position-id",
      "title": "Responsable IT"
    },
    "contracts": [...]
  }
]
```

### 5. Supprimer un Bulletin de Paie

**Endpoint:** `DELETE /hr/payslips/:id`

Supprime un bulletin de paie (utile pour les brouillons).

**Requête:**
```bash
curl -X DELETE http://localhost:3000/hr/payslips/<payslip-id> \
  -H "Authorization: Bearer <votre_token>"
```

## 📝 Scénarios d'Utilisation

### Scénario 1: Générer les Bulletins pour TOUS les Employés Actifs

**Étape 1:** Récupérer tous les employés
```bash
curl http://localhost:3000/hr/employees \
  -H "Authorization: Bearer <token>" \
  > employees.json
```

**Étape 2:** Extraire les IDs des employés actifs
```javascript
// En JavaScript/TypeScript
const employees = await fetch('http://localhost:3000/hr/employees', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

const activeEmployeeIds = employees
  .filter(emp => emp.status === 'ACTIVE')
  .map(emp => emp.id);
```

**Étape 3:** Générer les bulletins
```bash
curl -X POST http://localhost:3000/hr/payslips/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d "{
    \"employeeIds\": $(echo $activeEmployeeIds | jq -c),
    \"month\": 11,
    \"year\": 2024
  }"
```

### Scénario 2: Générer le Bulletin pour UN Seul Employé

**Requête:**
```bash
curl -X POST http://localhost:3000/hr/payslips/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "employeeIds": ["<employee-id>"],
    "month": 11,
    "year": 2024
  }'
```

### Scénario 3: Consulter les Bulletins du Mois en Cours

```bash
# Décembre 2024 (month = 11 car 0-indexed)
curl "http://localhost:3000/hr/payslips?month=11&year=2024" \
  -H "Authorization: Bearer <token>"
```

### Scénario 4: Télécharger Tous les Bulletins en PDF

```bash
# Récupérer les bulletins
PAYSLIPS=$(curl -s "http://localhost:3000/hr/payslips?month=11&year=2024" \
  -H "Authorization: Bearer <token>")

# Pour chaque bulletin, télécharger le PDF
echo $PAYSLIPS | jq -r '.[].id' | while read id; do
  curl "http://localhost:3000/hr/payslips/$id/pdf" \
    -H "Authorization: Bearer <token>" \
    --output "bulletin-$id.pdf"
done
```

## 🔧 Intégration avec le Frontend

### Exemple en TypeScript/React

```typescript
// services/payslipService.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Configurer axios avec le token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Service de génération de bulletins
export const payslipService = {
  // Générer des bulletins
  async generatePayslips(employeeIds: string[], month: number, year: number) {
    const response = await api.post('/hr/payslips/generate', {
      employeeIds,
      month,
      year,
    });
    return response.data;
  },

  // Récupérer les bulletins
  async getPayslips(month?: number, year?: number) {
    const params = new URLSearchParams();
    if (month !== undefined) params.append('month', month.toString());
    if (year !== undefined) params.append('year', year.toString());

    const response = await api.get(`/hr/payslips?${params.toString()}`);
    return response.data;
  },

  // Télécharger le PDF
  async downloadPDF(payslipId: string) {
    const response = await api.get(`/hr/payslips/${payslipId}/pdf`, {
      responseType: 'blob',
    });

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bulletin-paie-${payslipId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Récupérer tous les employés
  async getEmployees() {
    const response = await api.get('/hr/employees');
    return response.data;
  },
};
```

### Composant React de Génération

```tsx
// components/PayslipGenerator.tsx
import React, { useState, useEffect } from 'react';
import { payslipService } from '../services/payslipService';

export const PayslipGenerator: React.FC = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const data = await payslipService.getEmployees();
    setEmployees(data.filter(emp => emp.status === 'ACTIVE'));
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const payslips = await payslipService.generatePayslips(
        selectedEmployees,
        month,
        year
      );
      alert(`${payslips.length} bulletins générés avec succès!`);
    } catch (error) {
      alert('Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    setSelectedEmployees(employees.map(emp => emp.id));
  };

  return (
    <div className="payslip-generator">
      <h2>Générer les Bulletins de Paie</h2>

      <div className="period-selector">
        <label>
          Mois:
          <select value={month} onChange={(e) => setMonth(+e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(2024, i).toLocaleDateString('fr-FR', { month: 'long' })}
              </option>
            ))}
          </select>
        </label>

        <label>
          Année:
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(+e.target.value)}
          />
        </label>
      </div>

      <div className="employee-selector">
        <button onClick={handleSelectAll}>Tout sélectionner</button>
        {employees.map(emp => (
          <label key={emp.id}>
            <input
              type="checkbox"
              checked={selectedEmployees.includes(emp.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedEmployees([...selectedEmployees, emp.id]);
                } else {
                  setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                }
              }}
            />
            {emp.firstName} {emp.lastName} - {emp.jobTitle}
          </label>
        ))}
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || selectedEmployees.length === 0}
      >
        {loading ? 'Génération en cours...' : 'Générer les Bulletins'}
      </button>
    </div>
  );
};
```

## 🧪 Tests avec Postman

1. **Importer la collection:**
   - Créer une collection "ERP Ghazal - Payslips"
   - Ajouter une variable d'environnement `baseUrl` = `http://localhost:3000`
   - Ajouter une variable `token` pour le JWT

2. **Requêtes à créer:**
   - `POST {{baseUrl}}/auth/login` - Login
   - `GET {{baseUrl}}/hr/employees` - Liste employés
   - `POST {{baseUrl}}/hr/payslips/generate` - Générer bulletins
   - `GET {{baseUrl}}/hr/payslips` - Consulter bulletins
   - `GET {{baseUrl}}/hr/payslips/:id/pdf` - Télécharger PDF

## 📊 Calculs Effectués Automatiquement

Le système calcule automatiquement:

1. **Salaire Brut** = Salaire de Base + Primes
2. **Cotisations Salariales** (9% SS + 9% Retraite + 1,5% Chômage) sur assiette plafonnée (108 000 DA)
3. **Salaire Imposable** = Salaire Brut - Cotisations
4. **IRG** selon les tranches algériennes:
   - 0 - 30 000 DA: 0%
   - 30 001 - 120 000 DA: 20%
   - 120 001 - 360 000 DA: 30%
   - > 360 000 DA: 35%
5. **Salaire Net** = Salaire Imposable - IRG
6. **Cotisations Patronales** (26% SS + 10% Retraite) - informatives

## ⚠️ Notes Importantes

1. **Format du Mois:** L'API utilise un index 0-based (0 = Janvier, 11 = Décembre)
2. **Unicité:** Un seul bulletin par employé par mois/année (upsert automatique)
3. **Status DRAFT:** Les bulletins sont créés en brouillon, à valider manuellement
4. **Contrats Actifs:** Seuls les employés avec un contrat actif peuvent avoir un bulletin
5. **Primes Mensuelles:** Seules les primes `frequency: 'MONTHLY'` sont incluses automatiquement

## 🔗 Endpoints Connexes

- `GET /hr/bonuses` - Liste des primes configurées
- `POST /hr/employees/:id/bonuses` - Assigner une prime à un employé
- `GET /hr/contributions` - Liste des cotisations sociales
- `GET /hr/contracts` - Liste des contrats

## 📞 Support

Pour toute question:
- Consultez les logs du backend: `backend/logs`
- Vérifiez les données dans la base de données
- Consultez le schéma Prisma: `backend/prisma/schema.prisma`
