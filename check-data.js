const http = require('http');

async function makeRequest(path, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path,
            method: 'GET',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

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

async function checkData() {
    console.log('🔍 Vérification des données de base...\n');

    const token = await login();
    console.log('✅ Connecté\n');

    // Check Rubriques
    console.log('📋 Vérification des Rubriques...');
    const rubriques = await makeRequest('/hr/rubriques', token);
    console.log(`   ${rubriques.data.length || 0} rubriques trouvées`);
    if (rubriques.data.length > 0) {
        console.log('   Exemples:', rubriques.data.slice(0, 3).map(r => r.code).join(', '));
    }

    // Check Salary Structures
    console.log('\n🏗️  Vérification des Structures Salariales...');
    const structures = await makeRequest('/hr/salary-structures', token);
    console.log(`   ${structures.data.length || 0} structures trouvées`);
    if (structures.data.length > 0) {
        console.log('   Structures:', structures.data.map(s => s.name).join(', '));
    }

    // Check Payroll Parameters
    console.log('\n⚙️  Vérification des Paramètres de Paie...');
    const params = await makeRequest('/hr/payroll-config/parameters', token);
    console.log(`   ${params.data.length || 0} paramètres trouvés`);
    if (params.data.length > 0) {
        console.log('   Exemples:', params.data.slice(0, 3).map(p => p.code).join(', '));
    }

    // Check Tax Brackets
    console.log('\n💸 Vérification des Tranches IRG...');
    const tax = await makeRequest('/hr/payroll-config/tax-brackets', token);
    console.log(`   ${tax.data.length || 0} tranches trouvées`);

    // Check Employees with contracts
    console.log('\n👥 Vérification des Employés...');
    const employees = await makeRequest('/hr/employees', token);
    const empCount = employees.data.length || 0;
    console.log(`   ${empCount} employés trouvés`);

    if (empCount > 0) {
        const withContracts = employees.data.filter(e => e.contracts && e.contracts.length > 0).length;
        console.log(`   ${withContracts} employés avec contrats`);

        const activeContracts = employees.data.filter(e => {
            const contract = e.contracts?.find(c => !c.endDate || new Date(c.endDate) > new Date());
            return !!contract;
        }).length;
        console.log(`   ${activeContracts} employés avec contrats actifs`);
    }

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RÉSUMÉ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const missing = [];
    if (rubriques.data.length === 0) missing.push('Rubriques');
    if (structures.data.length === 0) missing.push('Structures salariales');
    if (params.data.length === 0) missing.push('Paramètres de paie');
    if (tax.data.length === 0) missing.push('Tranches IRG');

    if (missing.length > 0) {
        console.log('❌ DONNÉES MANQUANTES:');
        missing.forEach(m => console.log(`   - ${m}`));
        console.log('\n💡 Solution: Exécutez le seed principal:');
        console.log('   cd backend');
        console.log('   npx ts-node prisma/seed-complete-algerian.ts');
    } else {
        console.log('✅ Toutes les données de base sont présentes!');
        console.log('\n⚠️  L\'erreur 500 vient probablement d\'autre chose.');
        console.log('   Vérifiez les logs du backend pour plus de détails.');
    }
}

checkData().catch(console.error);
