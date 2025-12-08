import { useState, useEffect } from 'react';
import { useEmployeeStore } from '../features/hr/employeeStore';
import { Coins, Plus, Trash2, Users, Check, X, ClipboardList, Calendar } from 'lucide-react';

export function Payroll() {
    const {
        payrollBonuses, fetchPayrollBonuses, createPayrollBonus, deletePayrollBonus,
        employees, fetchEmployees, assignBonus, removeBonus,
        selectedEmployee, fetchEmployee,
        generatePayslips, fetchPayslips, payslips
    } = useEmployeeStore();

    const [activeTab, setActiveTab] = useState<'config' | 'assignment' | 'payslips'>('config');

    // Assignment Modal State
    const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
    const [selectedBonusToAssign, setSelectedBonusToAssign] = useState<any>(null);
    const [assignmentDetails, setAssignmentDetails] = useState({
        amount: 0,
        startDate: new Date().toISOString().split('T')[0],
        frequency: 'MONTHLY' as 'MONTHLY' | 'PONCTUELLE',
        endDate: ''
    });

    // Payslip Generation State
    const [payslipMonth, setPayslipMonth] = useState(new Date().getMonth());
    const [payslipYear, setPayslipYear] = useState(new Date().getFullYear());
    const [selectedForPayslip, setSelectedForPayslip] = useState<Set<string>>(new Set());

    const openAssignmentModal = (bonus: any) => {
        setSelectedBonusToAssign(bonus);
        setAssignmentDetails({
            amount: bonus.amount || 0, // Pre-fill with default amount
            startDate: new Date().toISOString().split('T')[0],
            frequency: 'MONTHLY',
            endDate: ''
        });
        setAssignmentModalOpen(true);
    };

    const handleConfirmAssignment = async () => {
        if (!selectedEmployee || !selectedBonusToAssign) return;

        await assignBonus(selectedEmployee.id, selectedBonusToAssign.id, {
            amount: assignmentDetails.amount, // Send the overridden amount
            startDate: assignmentDetails.startDate,
            frequency: assignmentDetails.frequency,
            endDate: assignmentDetails.endDate || undefined
        });

        setAssignmentModalOpen(false);
        setSelectedBonusToAssign(null);
    };

    const [newBonus, setNewBonus] = useState({
        name: '',
        calculationMode: 'FIXE' as 'FIXE' | 'POURCENTAGE',
        amount: 0,
        percentage: 0,
        description: ''
    });

    useEffect(() => {
        fetchPayrollBonuses();
        fetchEmployees();
    }, [fetchPayrollBonuses, fetchEmployees]);

    const handleCreateBonus = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newBonus.name.trim()) {
            await createPayrollBonus({
                ...newBonus,
                amount: newBonus.calculationMode === 'FIXE' ? Number(newBonus.amount) : undefined,
                percentage: newBonus.calculationMode === 'POURCENTAGE' ? Number(newBonus.percentage) : undefined
            });
            setNewBonus({
                name: '',
                calculationMode: 'FIXE',
                amount: 0,
                percentage: 0,
                description: ''
            });
        }
    };

    // --- Payslip Helpers ---
    const getBaseSalary = (employee: any) => {
        const activeContract = employee.contracts?.find((c: any) => !c.endDate || new Date(c.endDate) > new Date());
        return activeContract ? (activeContract.wage || 0) : 0;
    };

    const calculateBonuses = (employee: any, month: number, year: number) => {
        if (!employee.bonuses) return 0;

        const baseSalary = getBaseSalary(employee);
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);

        return employee.bonuses.reduce((total: number, eb: any) => {
            const bonusStart = new Date(eb.startDate);
            const bonusEnd = eb.endDate ? new Date(eb.endDate) : null;

            // Filter inactive assignments
            if (bonusStart > endOfMonth) return total;
            if (bonusEnd && bonusEnd < startOfMonth) return total;

            // Check details
            // If MONTHLY: Valid if active during the month
            // If PONCTUELLE: Valid if startDate is within the month
            let isValid = false;

            if (eb.frequency === 'PONCTUELLE') {
                isValid = bonusStart.getMonth() === month && bonusStart.getFullYear() === year;
            } else {
                // Monthly
                isValid = true; // Already filtered by date ranges above
            }

            if (!isValid) return total;

            // Calculate Value - use 'amount' if overridden, otherwise use definition from linked bonus? 
            // The backend returns employeeBonus which includes overrides.
            // CAUTION: backend might not include calculationMode if it's on the 'bonus' relation and not flattened.
            // We need 'eb.bonus.calculationMode'.

            let value = 0;
            // Prefer overridden amount if it exists (check for null/undefined, not just truthy)
            if (eb.amount !== null && eb.amount !== undefined) {
                value = eb.amount;
            } else if (eb.bonus) {
                // Fallback to bonus definition
                if (eb.bonus.calculationMode === 'FIXE') {
                    value = eb.bonus.amount || 0;
                } else {
                    // PERCENTAGE
                    value = (baseSalary * (eb.bonus.percentage || 0)) / 100;
                }
            }

            return total + value;
        }, 0);
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

    const labelStyle = { display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.25rem' };
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
                    onClick={() => setActiveTab('config')}
                    style={{
                        padding: '0.75rem 1rem',
                        borderBottom: activeTab === 'config' ? '2px solid #059669' : '2px solid transparent',
                        color: activeTab === 'config' ? '#059669' : '#6b7280',
                        fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer'
                    }}
                >
                    <Coins size={18} /> Configuration
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
                    <Users size={18} /> Attribution par Employé
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

            {/* TAB: CONFIGURATION */}
            {activeTab === 'config' && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Ajouter une prime</h3>
                        <form onSubmit={handleCreateBonus} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr auto', gap: '1rem', alignItems: 'end' }}>
                            <div>
                                <label style={labelStyle}>Nom de la prime</label>
                                <input
                                    type="text"
                                    value={newBonus.name}
                                    onChange={(e) => setNewBonus({ ...newBonus, name: e.target.value })}
                                    style={inputStyle}
                                    placeholder="Ex: Prime de Panier"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Mode</label>
                                <select
                                    value={newBonus.calculationMode}
                                    onChange={(e) => setNewBonus({ ...newBonus, calculationMode: e.target.value as any })}
                                    style={inputStyle}
                                >
                                    <option value="FIXE">Fixe</option>
                                    <option value="POURCENTAGE">Pourcentage</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>{newBonus.calculationMode === 'FIXE' ? 'Montant (DA)' : 'Pourcentage (%)'}</label>
                                <input
                                    type="number"
                                    value={newBonus.calculationMode === 'FIXE' ? newBonus.amount : newBonus.percentage}
                                    onChange={(e) => setNewBonus({
                                        ...newBonus,
                                        amount: newBonus.calculationMode === 'FIXE' ? Number(e.target.value) : newBonus.amount,
                                        percentage: newBonus.calculationMode === 'POURCENTAGE' ? Number(e.target.value) : newBonus.percentage
                                    })}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Description</label>
                                <input
                                    type="text"
                                    value={newBonus.description}
                                    onChange={(e) => setNewBonus({ ...newBonus, description: e.target.value })}
                                    style={inputStyle}
                                    placeholder="Optionnel"
                                />
                            </div>
                            <button type="submit" disabled={!newBonus.name.trim()} style={btnStyle}><Plus size={18} /> Ajouter</button>
                        </form>
                    </div>
                    {/* List */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
                                <th style={thStyle}>Nom</th>
                                <th style={thStyle}>Mode</th>
                                <th style={thStyle}>Valeur</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payrollBonuses.map((bonus: any) => (
                                <tr key={bonus.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={tdStyle}>{bonus.name}</td>
                                    <td style={tdStyle}>{bonus.calculationMode}</td>
                                    <td style={tdStyle}>{bonus.calculationMode === 'FIXE' ? `${bonus.amount} DA` : `${bonus.percentage}%`}</td>
                                    <td style={tdStyle}>
                                        <button onClick={() => deletePayrollBonus(bonus.id)} style={{ color: '#ef4444', border: 'none', background: 'none' }}><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB: ASSIGNMENT */}
            {activeTab === 'assignment' && (
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                    {/* Employee List */}
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', height: 'fit-content' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: '#374151' }}>Employés</div>
                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            {employees.map((emp: any) => (
                                <div
                                    key={emp.id}
                                    onClick={() => fetchEmployee(emp.id)}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        cursor: 'pointer',
                                        backgroundColor: selectedEmployee?.id === emp.id ? '#f0fdf4' : 'white',
                                        borderLeft: selectedEmployee?.id === emp.id ? '3px solid #059669' : '3px solid transparent',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        borderBottom: '1px solid #f9fafb'
                                    }}
                                >
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>
                                        {emp.firstName[0]}{emp.lastName[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1f2937' }}>{emp.firstName} {emp.lastName}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{emp.position?.title || 'Sans poste'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Assignment Panel */}
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', minHeight: '300px' }}>
                        {!selectedEmployee ? (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Select employee</div>
                        ) : (
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Primes: <span style={{ color: '#059669' }}>{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                    {payrollBonuses.map((bonus: any) => {
                                        const assignedBonus = selectedEmployee.bonuses?.find((eb: any) => eb.bonusId === bonus.id);
                                        const isAssigned = !!assignedBonus;
                                        return (
                                            <div key={bonus.id} style={{ border: isAssigned ? '1px solid #059669' : '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: isAssigned ? '#ecfdf5' : 'white' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontWeight: 600 }}>{bonus.name}</span>
                                                    {isAssigned && <Check size={16} color="#059669" />}
                                                </div>
                                                <div style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: isAssigned ? '#047857' : '#6b7280' }}>
                                                    {isAssigned ? (
                                                        assignedBonus.amount !== null && assignedBonus.amount !== undefined
                                                            ? `${assignedBonus.amount.toLocaleString()} DA`
                                                            : (assignedBonus.bonus?.calculationMode === 'FIXE' ? `${assignedBonus.bonus?.amount || 0} DA` : `${assignedBonus.bonus?.percentage || 0}%`)
                                                    ) : (
                                                        bonus.calculationMode === 'FIXE' ? `${bonus.amount} DA` : `${bonus.percentage}%`
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => isAssigned ? removeBonus(selectedEmployee.id, bonus.id) : openAssignmentModal(bonus)}
                                                    style={{
                                                        width: '100%', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                                        backgroundColor: isAssigned ? '#fecaca' : '#059669', color: isAssigned ? '#991b1b' : 'white', fontWeight: 500
                                                    }}
                                                >
                                                    {isAssigned ? 'Retirer' : 'Configurer'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
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
                                <th style={thStyle}>Salaire de base</th>
                                <th style={thStyle}>Primes (Prevue)</th>
                                <th style={thStyle}>Net à Payer (Est.)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp: any) => {
                                const baseSalary = getBaseSalary(emp) || 0;
                                const totalBonuses = calculateBonuses(emp, payslipMonth, payslipYear) || 0;
                                const total = baseSalary + totalBonuses;

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
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{emp.department?.name || '-'}</div>
                                        </td>
                                        <td style={tdStyle}>{emp.position?.title || '-'}</td>
                                        <td style={tdStyle}>{baseSalary.toLocaleString()} DA</td>
                                        <td style={{ ...tdStyle, color: '#059669' }}>+{totalBonuses.toLocaleString()} DA</td>
                                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>{total.toLocaleString()} DA</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Assignment Modal reused */}
            {assignmentModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#111827' }}>
                            Configurer la prime: <span style={{ color: '#059669' }}>{selectedBonusToAssign?.name}</span>
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Date d'application *</label>
                                <input
                                    type="date"
                                    value={assignmentDetails.startDate}
                                    onChange={(e) => setAssignmentDetails({ ...assignmentDetails, startDate: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Fréquence</label>
                                <select
                                    value={assignmentDetails.frequency}
                                    onChange={(e) => setAssignmentDetails({ ...assignmentDetails, frequency: e.target.value as any })}
                                    style={inputStyle}
                                >
                                    <option value="MONTHLY">Mensuelle (Récurrente)</option>
                                    <option value="PONCTUELLE">Ponctuelle (Une fois)</option>
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>Montant (DA) {selectedBonusToAssign?.calculationMode === 'POURCENTAGE' && '(Calculé ou Forcé)'}</label>
                                <input
                                    type="number"
                                    value={assignmentDetails.amount}
                                    onChange={(e) => setAssignmentDetails({ ...assignmentDetails, amount: Number(e.target.value) })}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    onClick={() => setAssignmentModalOpen(false)}
                                    style={{ ...btnStyle, backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db' }}
                                >
                                    Annuler
                                </button>
                                <button onClick={handleConfirmAssignment} style={btnStyle}>
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
