import React, { useMemo } from 'react';
import { usePayslipCalculation } from '../../hooks/usePayslipCalculation';

interface PayslipTableProps {
    employees: any[];
    selectedForPayslip: Set<string>;
    payslipMonth: number;
    payslipYear: number;
    onToggleSelection: (empId: string) => void;
    onToggleAll: () => void;
}

const thStyle = { padding: '0.75rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e2e8f0' };
const tdStyle = { padding: '0.75rem', color: '#111827' };

export function PayslipTable({
    employees,
    selectedForPayslip,
    payslipMonth,
    payslipYear,
    onToggleSelection,
    onToggleAll
}: PayslipTableProps) {
    const { getBaseSalary, calculateBonuses, calculateEstimatedNet } = usePayslipCalculation();

    // Memoize calculations for all employees
    const employeeData = useMemo(() => {
        return employees.map((emp) => {
            const baseSalary = getBaseSalary(emp) || 0;
            const totalBonuses = calculateBonuses({ employee: emp, month: payslipMonth, year: payslipYear }) || 0;
            const grossSalary = baseSalary + totalBonuses;
            const estimatedNet = calculateEstimatedNet(grossSalary);

            return {
                employee: emp,
                baseSalary,
                totalBonuses,
                grossSalary,
                estimatedNet
            };
        });
    }, [employees, payslipMonth, payslipYear, getBaseSalary, calculateBonuses, calculateEstimatedNet]);

    return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ ...thStyle, width: '40px' }}>
                        <input
                            type="checkbox"
                            checked={selectedForPayslip.size === employees.length && employees.length > 0}
                            onChange={onToggleAll}
                        />
                    </th>
                    <th style={thStyle}>Employé</th>
                    <th style={thStyle}>Poste</th>
                    <th style={thStyle}>Salaire de base</th>
                    <th style={thStyle}>Primes (Prevue)</th>
                    <th style={thStyle}>Net à Payer (Est.)</th>
                </tr>
            </thead>
            <tbody>
                {employeeData.map(({ employee: emp, baseSalary, totalBonuses, estimatedNet }) => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={tdStyle}>
                            <input
                                type="checkbox"
                                checked={selectedForPayslip.has(emp.id)}
                                onChange={() => onToggleSelection(emp.id)}
                            />
                        </td>
                        <td style={tdStyle}>
                            <div style={{ fontWeight: 600 }}>{emp.firstName} {emp.lastName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{emp.department?.name || '-'}</div>
                        </td>
                        <td style={tdStyle}>{emp.position?.title || '-'}</td>
                        <td style={tdStyle}>{baseSalary.toLocaleString()} DA</td>
                        <td style={{ ...tdStyle, color: '#059669' }}>+{totalBonuses.toLocaleString()} DA</td>
                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>{estimatedNet.toLocaleString()} DA</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
