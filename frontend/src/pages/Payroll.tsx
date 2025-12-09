import { useState, useEffect } from 'react';
import { useEmployeeStore } from '../features/hr/employeeStore';
import { Coins, ClipboardList, Calendar, List, Settings, TrendingUp, UserCheck } from 'lucide-react';
import { RubriquesConfiguration } from '../features/hr/RubriquesConfiguration';
import { PayrollParametersConfig } from '../features/hr/PayrollParametersConfig';
import { TaxBracketsConfig } from '../features/hr/TaxBracketsConfig';
import { SalaryStructuresConfig } from '../features/hr/SalaryStructuresConfig';
import { EmployeeRubriqueAssignment } from '../features/hr/EmployeeRubriqueAssignment';
import { BulkRubriqueAssignment } from '../features/hr/BulkRubriqueAssignment';

export function Payroll() {
    const {
        employees, fetchEmployees,
        generatePayslips, fetchPayslips, payslips
    } = useEmployeeStore();

    const [activeTab, setActiveTab] = useState<'rubriques' | 'structures' | 'parameters' | 'tax-brackets' | 'assignment' | 'payslips'>('rubriques');
    const [assignmentMode, setAssignmentMode] = useState<'individual' | 'bulk'>('bulk');

    // Payslip Generation State
    const [payslipMonth, setPayslipMonth] = useState(new Date().getMonth());
    const [payslipYear, setPayslipYear] = useState(new Date().getFullYear());
    const [selectedForPayslip, setSelectedForPayslip] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // --- Payslip Helpers ---
    const getBaseSalary = (employee: any) => {
        const activeContract = employee.contracts?.find((c: any) => !c.endDate || new Date(c.endDate) > new Date());
        return activeContract ? (activeContract.wage || 0) : 0;
    };

    const togglePayslipSelection = (empId: string) => {
        const newSet = new Set(selectedForPayslip);
        if (newSet.has(empId)) newSet.delete(empId);
        else newSet.add(empId);
        setSelectedForPayslip(newSet);
    };

    const toggleAllPayslips = () => {
        if (selectedForPayslip.size === employees.length) {
            setSelectedForPayslip(new Set());
        } else {
            setSelectedForPayslip(new Set(employees.map((e: any) => e.id)));
        }
    };

    const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem' };
    const btnStyle: any = {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#059669',
        color: 'white',
        borderRadius: '8px',
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        height: 'fit-content'
    };
    const thStyle = { padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.875rem' };
    const tdStyle = { padding: '1rem 1.5rem', fontWeight: 500, color: '#1f2937' };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: '12px' }}>
                    <Coins size={32} color="#059669" />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#064e3b' }}>Gestion de la Paie</h1>
                    <p style={{ color: '#6b7280' }}>Configuration, attribution et génération des bulletins.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <button
                    onClick={() => setActiveTab('rubriques')}
                    style={{
                        padding: '0.75rem 1rem',
                        borderBottom: activeTab === 'rubriques' ? '2px solid #059669' : '2px solid transparent',
                        color: activeTab === 'rubriques' ? '#059669' : '#6b7280',
                        fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer'
                    }}
                >
                    <List size={18} /> Rubriques
                </button>
                <button
                    onClick={() => setActiveTab('structures')}
                    style={{
                        padding: '0.75rem 1rem',
                        borderBottom: activeTab === 'structures' ? '2px solid #059669' : '2px solid transparent',
                        color: activeTab === 'structures' ? '#059669' : '#6b7280',
                        fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer'
                    }}
                >
                    <List size={18} /> Structures
                </button>
                <button
                    onClick={() => setActiveTab('parameters')}
                    style={{
                        padding: '0.75rem 1rem',
                        borderBottom: activeTab === 'parameters' ? '2px solid #059669' : '2px solid transparent',
                        color: activeTab === 'parameters' ? '#059669' : '#6b7280',
                        fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer'
                    }}
                >
                    <Settings size={18} /> Paramètres
                </button>
                <button
                    onClick={() => setActiveTab('tax-brackets')}
                    style={{
                        padding: '0.75rem 1rem',
                        borderBottom: activeTab === 'tax-brackets' ? '2px solid #059669' : '2px solid transparent',
                        color: activeTab === 'tax-brackets' ? '#059669' : '#6b7280',
                        fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer'
                    }}
                >
                    <TrendingUp size={18} /> Barème IRG
                </button>
                <button
                    onClick={() => setActiveTab('assignment')}
                    style={{
                        padding: '0.75rem 1rem',
                        borderBottom: activeTab === 'assignment' ? '2px solid #059669' : '2px solid transparent',
                        color: activeTab === 'assignment' ? '#059669' : '#6b7280',
                        fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer'
                    }}
                >
                    <UserCheck size={18} /> Attribution
                </button>
                <button
                    onClick={() => setActiveTab('payslips')}
                    style={{
                        padding: '0.75rem 1rem',
                        borderBottom: activeTab === 'payslips' ? '2px solid #059669' : '2px solid transparent',
                        color: activeTab === 'payslips' ? '#059669' : '#6b7280',
                        fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer'
                    }}
                >
                    <ClipboardList size={18} /> Bulletins de paie
                </button>
            </div>

            {/* TAB: RUBRIQUES */}
            {activeTab === 'rubriques' && (
                <RubriquesConfiguration />
            )}

            {/* TAB: STRUCTURES */}
            {activeTab === 'structures' && (
                <SalaryStructuresConfig />
            )}

            {/* TAB: PARAMETERS */}
            {activeTab === 'parameters' && (
                <PayrollParametersConfig />
            )}

            {/* TAB: TAX BRACKETS */}
            {activeTab === 'tax-brackets' && (
                <TaxBracketsConfig />
            )}

            {/* TAB: ASSIGNMENT */}
            {activeTab === 'assignment' && (
                <div>
                    {/* Sub-tabs for assignment modes */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '8px', width: 'fit-content' }}>
                        <button
                            onClick={() => setAssignmentMode('bulk')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: assignmentMode === 'bulk' ? '#059669' : 'transparent',
                                color: assignmentMode === 'bulk' ? 'white' : '#6b7280',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Attribution Groupée
                        </button>
                        <button
                            onClick={() => setAssignmentMode('individual')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: assignmentMode === 'individual' ? '#059669' : 'transparent',
                                color: assignmentMode === 'individual' ? 'white' : '#6b7280',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Par Employé
                        </button>
                    </div>

                    {assignmentMode === 'bulk' ? (
                        <BulkRubriqueAssignment />
                    ) : (
                        <EmployeeRubriqueAssignment />
                    )}
                </div>
            )}

            {/* TAB: PAYSLIP GENERATION */}
            {activeTab === 'payslips' && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    {/* Toolbar */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                                <select
                                    value={payslipMonth}
                                    onChange={(e) => setPayslipMonth(Number(e.target.value))}
                                    style={{ ...inputStyle, paddingLeft: '2.5rem', width: '150px' }}
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i}>{new Date(0, i).toLocaleString('fr-FR', { month: 'long' })}</option>
                                    ))}
                                </select>
                            </div>
                            <select
                                value={payslipYear}
                                onChange={(e) => setPayslipYear(Number(e.target.value))}
                                style={{ ...inputStyle, width: '100px' }}
                            >
                                <option value={2024}>2024</option>
                                <option value={2025}>2025</option>
                            </select>
                        </div>

                        <button
                            style={btnStyle}
                            disabled={selectedForPayslip.size === 0}
                            onClick={async () => {
                                if (selectedForPayslip.size === 0) return;

                                try {
                                    // Generate payslips
                                    await generatePayslips(Array.from(selectedForPayslip), payslipMonth, payslipYear);

                                    // Fetch the generated payslips
                                    await fetchPayslips(payslipMonth, payslipYear);

                                    // Download PDFs for each selected employee
                                    const employeeIds = Array.from(selectedForPayslip);
                                    for (const empId of employeeIds) {
                                        // Find the payslip for this employee
                                        const payslip = payslips.find((p: any) =>
                                            p.employeeId === empId &&
                                            p.month === payslipMonth &&
                                            p.year === payslipYear
                                        );

                                        if (payslip) {
                                            // Download the PDF
                                            const response = await fetch(`http://localhost:3000/hr/payslips/${payslip.id}/pdf`);
                                            const blob = await response.blob();
                                            const url = window.URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `bulletin-paie-${payslip.employee.lastName}-${new Date(0, payslipMonth).toLocaleString('fr-FR', { month: 'long' })}-${payslipYear}.pdf`;
                                            document.body.appendChild(a);
                                            a.click();
                                            window.URL.revokeObjectURL(url);
                                            document.body.removeChild(a);

                                            // Small delay between downloads to avoid browser blocking
                                            await new Promise(resolve => setTimeout(resolve, 500));
                                        }
                                    }

                                    alert(`${selectedForPayslip.size} bulletin(s) de paie généré(s) et téléchargé(s) avec succès pour ${new Date(0, payslipMonth).toLocaleString('fr-FR', { month: 'long' })} ${payslipYear}`);
                                } catch (error) {
                                    console.error('Erreur lors de la génération des bulletins:', error);
                                    alert('Erreur lors de la génération des bulletins de paie');
                                }
                            }}
                        >
                            Générer ({selectedForPayslip.size})
                        </button>
                    </div>

                    {/* Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ ...thStyle, width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedForPayslip.size === employees.length && employees.length > 0}
                                        onChange={toggleAllPayslips}
                                    />
                                </th>
                                <th style={thStyle}>Employé</th>
                                <th style={thStyle}>Poste</th>
                                <th style={thStyle}>Département</th>
                                <th style={thStyle}>Salaire de base</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp: any) => {
                                const baseSalary = getBaseSalary(emp) || 0;

                                return (
                                    <tr key={emp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={tdStyle}>
                                            <input
                                                type="checkbox"
                                                checked={selectedForPayslip.has(emp.id)}
                                                onChange={() => togglePayslipSelection(emp.id)}
                                            />
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 600 }}>{emp.firstName} {emp.lastName}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{emp.email || '-'}</div>
                                        </td>
                                        <td style={tdStyle}>{emp.position?.title || '-'}</td>
                                        <td style={tdStyle}>{emp.department?.name || '-'}</td>
                                        <td style={{ ...tdStyle, fontWeight: 'bold', color: '#059669' }}>{baseSalary.toLocaleString()} DA</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
