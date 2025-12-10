import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

interface PayslipData {
    employee: {
        lastName: string;
        firstName: string;
        badgeId?: string;
        socialSecurityNumber?: string;
        position?: { title: string };
        department?: { name: string };
    };
    month: number;
    year: number;
    baseSalary: number;
    bonuses: number;
    grossSalary: number;
    employeeContributions: Record<string, any>;
    totalEmployeeContributions: number;
    taxableSalary: number;
    incomeTax: number;
    netSalary: number;
    employerContributions: Record<string, any>;
    totalEmployerContributions: number;
    details?: any;
}

@Injectable()
export class PdfGenerationService {
    private readonly MONTH_NAMES = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    /**
     * Generate a payslip PDF
     */
    async generatePayslipPDF(payslip: PayslipData): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk: Buffer) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            this.buildPDFContent(doc, payslip);

            doc.end();
        });
    }

    /**
     * Build the PDF content
     */
    private buildPDFContent(doc: PDFKit.PDFDocument, payslip: PayslipData): void {
        this.addHeader(doc, payslip);
        this.addEmployeeInfo(doc, payslip);
        this.addSalaryDetails(doc, payslip);
        this.addEmployeeContributions(doc, payslip);
        this.addTaxableAndIRG(doc, payslip);
        this.addNetSalary(doc, payslip);
        this.addEmployerContributions(doc, payslip);
        this.addFooter(doc);
    }

    private addHeader(doc: PDFKit.PDFDocument, payslip: PayslipData): void {
        doc.fontSize(20).text('BULLETIN DE PAIE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(
            `Période: ${this.MONTH_NAMES[payslip.month]} ${payslip.year}`,
            { align: 'center' }
        );
        doc.moveDown(2);
    }

    private addEmployeeInfo(doc: PDFKit.PDFDocument, payslip: PayslipData): void {
        doc.fontSize(14).text('INFORMATIONS EMPLOYÉ', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        doc.text(`Nom: ${payslip.employee.lastName} ${payslip.employee.firstName}`);
        doc.text(`Matricule: ${payslip.employee.badgeId || 'N/A'}`);
        doc.text(`Poste: ${payslip.employee.position?.title || 'N/A'}`);
        doc.text(`Département: ${payslip.employee.department?.name || 'N/A'}`);

        if (payslip.employee.socialSecurityNumber) {
            doc.text(`N° Sécurité Sociale: ${payslip.employee.socialSecurityNumber}`);
        }
        doc.moveDown(2);
    }

    private addSalaryDetails(doc: PDFKit.PDFDocument, payslip: PayslipData): void {
        doc.fontSize(14).text('DÉTAILS DE LA RÉMUNÉRATION', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);

        // Base salary
        this.addLine(doc, 'Salaire de base:', payslip.baseSalary);

        // Bonuses
        // Bonuses / Gains
        if (payslip.details && payslip.details.gains && Array.isArray(payslip.details.gains)) {
            payslip.details.gains.forEach((gain: any) => {
                this.addLine(doc, `${gain.name}:`, gain.amount);
            });
        } else if (payslip.bonuses > 0) {
            // Fallback for old records
            this.addLine(doc, 'Primes et indemnités:', payslip.bonuses);
        }

        // Gross salary (bold)
        doc.fontSize(11).font('Helvetica-Bold');
        this.addLine(doc, 'Salaire Brut:', payslip.grossSalary);
        doc.font('Helvetica').fontSize(10);
        doc.moveDown(1.5);
    }

    private addEmployeeContributions(doc: PDFKit.PDFDocument, payslip: PayslipData): void {
        doc.fontSize(14).text('COTISATIONS SALARIALES (déduites du brut)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);

        for (const [_, detail] of Object.entries(payslip.employeeContributions)) {
            const contrib = detail as any;
            this.addLine(doc, `${contrib.name} (${contrib.rate}%):`, contrib.amount);
        }

        doc.font('Helvetica-Bold');
        this.addLine(doc, 'Total Cotisations Salariales:', payslip.totalEmployeeContributions);
        doc.font('Helvetica');
        doc.moveDown(1.5);
    }

    private addTaxableAndIRG(doc: PDFKit.PDFDocument, payslip: PayslipData): void {
        // Taxable salary
        doc.fontSize(11).font('Helvetica-Bold');
        this.addLine(doc, 'Salaire Imposable:', payslip.taxableSalary);
        doc.font('Helvetica').fontSize(10);
        doc.moveDown(1.5);

        // IRG
        doc.fontSize(14).text('IMPÔT SUR LE REVENU GLOBAL (IRG)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        this.addLine(doc, 'IRG retenu à la source:', payslip.incomeTax);
        doc.moveDown(2);
    }

    private addNetSalary(doc: PDFKit.PDFDocument, payslip: PayslipData): void {
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#006400');
        this.addLine(doc, 'SALAIRE NET À PAYER:', payslip.netSalary);
        doc.fillColor('#000000').font('Helvetica').fontSize(10);
        doc.moveDown(2);
    }

    private addEmployerContributions(doc: PDFKit.PDFDocument, payslip: PayslipData): void {
        doc.fontSize(14).text('COTISATIONS PATRONALES (à titre informatif)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);

        for (const [_, detail] of Object.entries(payslip.employerContributions)) {
            const contrib = detail as any;
            this.addLine(doc, `${contrib.name} (${contrib.rate}%):`, contrib.amount);
        }

        doc.font('Helvetica-Bold');
        this.addLine(doc, 'Total Cotisations Patronales:', payslip.totalEmployerContributions);
        doc.font('Helvetica');
        doc.moveDown(2);
    }

    private addFooter(doc: PDFKit.PDFDocument): void {
        doc.fontSize(8).fillColor('#666666');
        doc.text('Ce document est généré automatiquement par le système ERP Ghazal', { align: 'center' });
        doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
    }

    /**
     * Add a formatted line with label and value
     */
    private addLine(doc: PDFKit.PDFDocument, label: string, value: number): void {
        const y = doc.y;
        doc.text(label, 50, y);
        doc.text(`${value.toFixed(2)} DA`, 400, y, { align: 'right' });
        doc.moveDown();
    }
}
