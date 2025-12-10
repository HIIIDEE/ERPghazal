
function calculate() {
    // Inputs (Benali Scenario)
    const base = 150000;
    const primeResp = 30000;
    const primeDispo = 20000;
    const panier = 2000;    // Non-Cotisable, Imposable
    const transport = 3000; // Non-Cotisable, Imposable

    // 1. Brut Total (for context)
    const brut = base + primeResp + primeDispo + panier + transport;

    // 2. Base SS (Cotisable)
    // Panier & Transport are EXCLUDED from SS Base
    const baseSS = base + primeResp + primeDispo;
    console.log(`Base SS: ${baseSS}`);

    // 3. SS (9%)
    const ss = baseSS * 0.09;
    console.log(`SS (9%): ${ss}`);

    // Calculate Net with NO IRG (for checking)
    console.log(`Net Before IRG: ${brut - ss}`);

    // 4. Imposable (Base IRG)
    // Formula: (Base SS - SS) + Panier + Transport
    const imposable = (baseSS - ss) + panier + transport;
    console.log(`Base IRG (Imposable): ${imposable}`);

    // 5. IRG (Barème 2020)
    let tax = 0;

    // Tranche 1: 0-30000 (0%)

    // Tranche 2: 30001 - 120000 (30%)
    if (imposable > 30000) {
        const taxable = Math.min(imposable, 120000) - 30000;
        tax += taxable * 0.30;
    }

    // Tranche 3: > 120000 (35%)
    if (imposable > 120000) {
        const taxable = imposable - 120000;
        tax += taxable * 0.35;
    }

    // Abatement (Min 1000, Max 1500)
    const abatement = Math.min(Math.max(tax * 0.40, 1000), 1500);
    const irgNet = Math.max(0, tax - abatement);

    console.log(`IRG Net (Calculated): ${irgNet}`);

    // 6. Net à Payer
    const net = imposable - irgNet;
    console.log(`Net à Payer: ${net}`);
}

calculate();
