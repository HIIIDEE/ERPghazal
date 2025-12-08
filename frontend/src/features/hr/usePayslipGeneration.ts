import { useCallback } from 'react';
import { useEmployeeStore } from './employeeStore';

/**
 * Custom hook for payslip generation and PDF download
 */
export function usePayslipGeneration() {
    const { generatePayslips, fetchPayslips, payslips } = useEmployeeStore();

    /**
     * Generate payslips and download PDFs for selected employees
     */
    const generateAndDownloadPayslips = useCallback(async (
        selectedEmployeeIds: string[],
        month: number,
        year: number
    ) => {
        if (selectedEmployeeIds.length === 0) {
            throw new Error('Aucun employé sélectionné');
        }

        // Generate payslips
        await generatePayslips(selectedEmployeeIds, month, year);

        // Fetch the generated payslips
        await fetchPayslips(month, year);

        // Download PDFs for each selected employee
        await downloadPayslipPDFs(selectedEmployeeIds, month, year, payslips);

        return selectedEmployeeIds.length;
    }, [generatePayslips, fetchPayslips, payslips]);

    /**
     * Download PDF for multiple payslips
     */
    const downloadPayslipPDFs = async (
        employeeIds: string[],
        month: number,
        year: number,
        payslipsList: any[]
    ) => {
        for (const empId of employeeIds) {
            // Find the payslip for this employee
            const payslip = payslipsList.find((p: any) =>
                p.employeeId === empId &&
                p.month === month &&
                p.year === year
            );

            if (payslip) {
                await downloadSinglePDF(payslip, month, year);
                // Small delay between downloads to avoid browser blocking
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    };

    /**
     * Download a single PDF
     */
    const downloadSinglePDF = async (payslip: any, month: number, year: number) => {
        try {
            const response = await fetch(`http://localhost:3000/hr/payslips/${payslip.id}/pdf`);

            if (!response.ok) {
                throw new Error('Erreur lors du téléchargement du PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            const monthName = new Date(0, month).toLocaleString('fr-FR', { month: 'long' });
            a.download = `bulletin-paie-${payslip.employee.lastName}-${monthName}-${year}.pdf`;

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Erreur téléchargement PDF:', error);
            throw error;
        }
    };

    return {
        generateAndDownloadPayslips
    };
}
