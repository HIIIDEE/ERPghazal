/**
 * Script pour générer les bulletins de paie via l'API
 *
 * Usage:
 *   node generate-payslips-api.js --email <email> --password <password> --month <month> --year <year>
 *   node generate-payslips-api.js --email responsable.it@ghazal.dz --password password123 --month 12 --year 2024
 *   node generate-payslips-api.js --email responsable.it@ghazal.dz --password password123 --month 12 --year 2024 --single <employee-email>
 */

const https = require('http');

// Configuration
const API_URL = 'http://localhost:3000';

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(`--${name}`);
  return index !== -1 ? args[index + 1] : null;
};

const email = getArg('email');
const password = getArg('password');
const month = getArg('month') ? parseInt(getArg('month')) - 1 : new Date().getMonth(); // Convert 1-12 to 0-11
const year = getArg('year') ? parseInt(getArg('year')) : new Date().getFullYear();
const singleEmployeeEmail = getArg('single');

// Validation
if (!email || !password) {
  console.error('❌ Erreur: Email et mot de passe requis');
  console.log('\nUsage:');
  console.log('  node generate-payslips-api.js --email <email> --password <password> --month <month> --year <year>');
  console.log('\nExemple:');
  console.log('  node generate-payslips-api.js --email responsable.it@ghazal.dz --password password123 --month 12 --year 2024');
  console.log('\nPour un seul employé:');
  console.log('  node generate-payslips-api.js --email responsable.it@ghazal.dz --password password123 --month 12 --year 2024 --single employe@ghazal.dz');
  process.exit(1);
}

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Helper to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function main() {
  try {
    console.log('🚀 Génération des bulletins de paie via l\'API\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 1: Login
    console.log('🔐 Authentification...');
    const loginResponse = await makeRequest('POST', '/auth/login', {
      email,
      password,
    });

    const token = loginResponse.access_token;
    console.log('✓ Authentification réussie\n');

    // Step 2: Get employees
    console.log('👥 Récupération des employés...');
    const employees = await makeRequest('GET', '/hr/employees', null, token);
    const activeEmployees = employees.filter(emp => emp.status === 'ACTIVE');
    console.log(`✓ ${activeEmployees.length} employés actifs trouvés\n`);

    // Step 3: Determine which employees to process
    let employeeIds;
    let employeeNames;

    if (singleEmployeeEmail) {
      const employee = activeEmployees.find(emp => emp.workEmail === singleEmployeeEmail);
      if (!employee) {
        console.error(`❌ Employé avec l'email ${singleEmployeeEmail} non trouvé`);
        process.exit(1);
      }
      employeeIds = [employee.id];
      employeeNames = [`${employee.firstName} ${employee.lastName}`];
      console.log(`📌 Employé sélectionné: ${employeeNames[0]}\n`);
    } else {
      employeeIds = activeEmployees.map(emp => emp.id);
      employeeNames = activeEmployees.map(emp => `${emp.firstName} ${emp.lastName}`);
      console.log(`📌 Tous les employés actifs seront traités\n`);
    }

    // Step 4: Generate payslips
    console.log(`💰 Génération des bulletins pour ${monthNames[month]} ${year}...\n`);
    const payslips = await makeRequest('POST', '/hr/payslips/generate', {
      employeeIds,
      month,
      year,
    }, token);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ BULLETINS GÉNÉRÉS AVEC SUCCÈS\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Display summary
    payslips.forEach((payslip, index) => {
      const emp = payslip.employee;
      console.log(`📊 ${emp.firstName} ${emp.lastName}`);
      console.log(`   Position: ${emp.position?.title || 'N/A'}`);
      console.log(`   Département: ${emp.department?.name || 'N/A'}`);
      console.log('   ─────────────────────────────────────────────');
      console.log(`   💼 Salaire de base:     ${payslip.baseSalary.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA`);

      if (payslip.bonuses > 0) {
        console.log(`   🎁 Primes:              ${payslip.bonuses.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA`);
      }

      console.log(`   💰 Salaire brut:        ${payslip.grossSalary.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA`);
      console.log(`   📉 Cotisations:         ${payslip.totalEmployeeContributions.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA`);
      console.log(`   💸 IRG:                 ${payslip.incomeTax.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA`);
      console.log(`   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`);
      console.log(`   ┃ 💵 SALAIRE NET: ${payslip.netSalary.toLocaleString('fr-FR', { minimumFractionDigits: 2 }).padStart(20)} DA ┃`);
      console.log(`   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`);
      console.log(`   📄 ID Bulletin: ${payslip.id}\n`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 RÉSUMÉ: ${payslips.length} bulletin(s) généré(s)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Calculate totals
    const totals = payslips.reduce((acc, p) => ({
      gross: acc.gross + p.grossSalary,
      net: acc.net + p.netSalary,
      contributions: acc.contributions + p.totalEmployeeContributions,
      irg: acc.irg + p.incomeTax,
    }), { gross: 0, net: 0, contributions: 0, irg: 0 });

    console.log('💼 TOTAUX:');
    console.log(`   Masse salariale brute:     ${totals.gross.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA`);
    console.log(`   Total cotisations:         ${totals.contributions.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA`);
    console.log(`   Total IRG:                 ${totals.irg.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA`);
    console.log(`   Masse salariale nette:     ${totals.net.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA\n`);

    console.log('📝 Pour télécharger les PDF:');
    console.log(`   Accédez à: http://localhost:3000/hr/payslips/<id>/pdf\n`);

    console.log('🎉 Terminé!\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();
