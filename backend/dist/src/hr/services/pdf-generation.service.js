"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfGenerationService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
let PdfGenerationService = class PdfGenerationService {
    MONTH_NAMES = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    async generatePayslipPDF(payslip) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            this.buildPDFContent(doc, payslip);
            doc.end();
        });
    }
    buildPDFContent(doc, payslip) {
        this.addHeader(doc, payslip);
        this.addEmployeeInfo(doc, payslip);
        this.addSalaryDetails(doc, payslip);
        this.addEmployeeContributions(doc, payslip);
        this.addTaxableAndIRG(doc, payslip);
        this.addNetSalary(doc, payslip);
        this.addEmployerContributions(doc, payslip);
        this.addFooter(doc);
    }
    addHeader(doc, payslip) {
        doc.fontSize(20).text('BULLETIN DE PAIE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Période: ${this.MONTH_NAMES[payslip.month]} ${payslip.year}`, { align: 'center' });
        doc.moveDown(2);
    }
    addEmployeeInfo(doc, payslip) {
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
    addSalaryDetails(doc, payslip) {
        doc.fontSize(14).text('DÉTAILS DE LA RÉMUNÉRATION', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        this.addLine(doc, 'Salaire de base:', payslip.baseSalary);
        if (payslip.details && payslip.details.gains && Array.isArray(payslip.details.gains)) {
            payslip.details.gains.forEach((gain) => {
                this.addLine(doc, `${gain.name}:`, gain.amount);
            });
        }
        else if (payslip.bonuses > 0) {
            this.addLine(doc, 'Primes et indemnités:', payslip.bonuses);
        }
        doc.fontSize(11).font('Helvetica-Bold');
        this.addLine(doc, 'Salaire Brut:', payslip.grossSalary);
        doc.font('Helvetica').fontSize(10);
        doc.moveDown(1.5);
    }
    addEmployeeContributions(doc, payslip) {
        doc.fontSize(14).text('COTISATIONS SALARIALES (déduites du brut)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        for (const [_, detail] of Object.entries(payslip.employeeContributions)) {
            const contrib = detail;
            this.addLine(doc, `${contrib.name} (${contrib.rate}%):`, contrib.amount);
        }
        doc.font('Helvetica-Bold');
        this.addLine(doc, 'Total Cotisations Salariales:', payslip.totalEmployeeContributions);
        doc.font('Helvetica');
        doc.moveDown(1.5);
    }
    addTaxableAndIRG(doc, payslip) {
        doc.fontSize(11).font('Helvetica-Bold');
        this.addLine(doc, 'Salaire Imposable:', payslip.taxableSalary);
        doc.font('Helvetica').fontSize(10);
        doc.moveDown(1.5);
        doc.fontSize(14).text('IMPÔT SUR LE REVENU GLOBAL (IRG)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        this.addLine(doc, 'IRG retenu à la source:', payslip.incomeTax);
        doc.moveDown(2);
    }
    addNetSalary(doc, payslip) {
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#006400');
        this.addLine(doc, 'SALAIRE NET À PAYER:', payslip.netSalary);
        doc.fillColor('#000000').font('Helvetica').fontSize(10);
        doc.moveDown(2);
    }
    addEmployerContributions(doc, payslip) {
        doc.fontSize(14).text('COTISATIONS PATRONALES (à titre informatif)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        for (const [_, detail] of Object.entries(payslip.employerContributions)) {
            const contrib = detail;
            this.addLine(doc, `${contrib.name} (${contrib.rate}%):`, contrib.amount);
        }
        doc.font('Helvetica-Bold');
        this.addLine(doc, 'Total Cotisations Patronales:', payslip.totalEmployerContributions);
        doc.font('Helvetica');
        doc.moveDown(2);
    }
    addFooter(doc) {
        doc.fontSize(8).fillColor('#666666');
        doc.text('Ce document est généré automatiquement par le système ERP Ghazal', { align: 'center' });
        doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
    }
    addLine(doc, label, value) {
        const y = doc.y;
        doc.text(label, 50, y);
        doc.text(`${value.toFixed(2)} DA`, 400, y, { align: 'right' });
        doc.moveDown();
    }
};
exports.PdfGenerationService = PdfGenerationService;
exports.PdfGenerationService = PdfGenerationService = __decorate([
    (0, common_1.Injectable)()
], PdfGenerationService);
//# sourceMappingURL=pdf-generation.service.js.map