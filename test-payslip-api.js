const http = require('http');

// Test de génération de bulletin
async function testPayslipGeneration() {
    console.log('🔍 Test de l\'API de génération de bulletins...\n');

    // Étape 1: Login
    console.log('1️⃣ Authentification...');
    const loginData = JSON.stringify({
        email: 'responsable.it@ghazal.dz',
        password: 'password123'
    });

    const loginOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': loginData.length
        }
    };

    const token = await new Promise((resolve, reject) => {
        const req = http.request(loginOptions, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    const data = JSON.parse(body);
                    console.log('✅ Authentification réussie');
                    resolve(data.access_token);
                } else {
                    console.error('❌ Erreur d\'authentification:', res.statusCode, body);
                    reject(new Error('Login failed'));
                }
            });
        });
        req.on('error', reject);
        req.write(loginData);
        req.end();
    });

    // Étape 2: Récupérer les employés
    console.log('\n2️⃣ Récupération des employés...');
    const employees = await new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/hr/employees',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const data = JSON.parse(body);
                    console.log(`✅ ${data.length} employés trouvés`);
                    resolve(data);
                } else {
                    console.error('❌ Erreur:', res.statusCode, body);
                    reject(new Error('Failed to fetch employees'));
                }
            });
        });
        req.on('error', reject);
        req.end();
    });

    if (employees.length === 0) {
        console.log('\n⚠️  Aucun employé trouvé. Impossible de tester.');
        return;
    }

    // Prendre le premier employé pour le test
    const testEmployee = employees[0];
    console.log(`   Test avec: ${testEmployee.firstName} ${testEmployee.lastName}`);

    // Étape 3: Générer le bulletin
    console.log('\n3️⃣ Génération du bulletin...');
    const payslipData = JSON.stringify({
        employeeIds: [testEmployee.id],
        month: 11, // Décembre (0-indexed)
        year: 2024
    });

    const payslipOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/hr/payslips/generate',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Content-Length': payslipData.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(payslipOptions, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log(`\n📊 Status Code: ${res.statusCode}`);
                console.log('📄 Response Headers:', res.headers);
                console.log('📝 Response Body:\n');

                try {
                    const data = JSON.parse(body);
                    console.log(JSON.stringify(data, null, 2));

                    if (res.statusCode === 200 || res.statusCode === 201) {
                        console.log('\n✅ Bulletin généré avec succès!');
                        resolve(data);
                    } else {
                        console.log('\n❌ Erreur lors de la génération');
                        console.log('Détails de l\'erreur:', data);
                        reject(new Error(`HTTP ${res.statusCode}`));
                    }
                } catch (e) {
                    // Body n'est peut-être pas du JSON
                    console.log(body);
                    console.log('\n❌ Erreur lors du parsing de la réponse');
                    reject(e);
                }
            });
        });

        req.on('error', (error) => {
            console.error('\n❌ Erreur de requête:', error);
            reject(error);
        });

        req.write(payslipData);
        req.end();
    });
}

// Exécuter le test
testPayslipGeneration()
    .then(() => {
        console.log('\n✅ Test terminé avec succès!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test échoué:', error.message);
        process.exit(1);
    });
