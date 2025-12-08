import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Mail, Phone } from 'lucide-react';

interface EmployeeKanbanProps {
    employees: any[];
    departments: any[];
}

export const EmployeeKanban: React.FC<EmployeeKanbanProps> = ({ employees }) => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const getEmployeeDisplayStatus = (emp: any) => {
        if (emp.status === 'SUSPENDED') return { label: 'Suspendu', color: '#f59e0b', bg: '#fef3c7' };
        if (emp.status === 'EXITED') return { label: 'Sorti', color: '#ef4444', bg: '#fee2e2' };

        // Check for active contract
        const activeContract = emp.contracts?.find((c: any) => c.status === 'RUNNING');

        if (activeContract) {
            // Check for trial period within the active contract
            if (activeContract.trialPeriodEndDate) {
                const trialEnd = new Date(activeContract.trialPeriodEndDate);
                if (trialEnd > new Date()) {
                    return { label: 'Période d\'essai', color: '#8b5cf6', bg: '#ede9fe' };
                }
            }
            return { label: 'Actif', color: '#22c55e', bg: '#dcfce7' };
        }

        // No active contract - check for expired
        if (emp.contracts?.some((c: any) => c.status === 'EXPIRED')) {
            return { label: 'Contrat Expiré', color: '#64748b', bg: '#f1f5f9' };
        }

        return { label: 'Sans Contrat', color: '#94a3b8', bg: '#f8fafc' };
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            if (statusFilter === 'ALL') return true;
            const status = getEmployeeDisplayStatus(emp);
            if (statusFilter === 'ACTIVE') return status.label === 'Actif';
            if (statusFilter === 'TRIAL') return status.label === 'Période d\'essai';
            if (statusFilter === 'SUSPENDED') return emp.status === 'SUSPENDED';
            if (statusFilter === 'EXITED') return emp.status === 'EXITED';
            if (statusFilter === 'EXPIRED') return status.label === 'Contrat Expiré';
            if (statusFilter === 'NO_CONTRACT') return status.label === 'Sans Contrat';
            return true;
        });
    }, [employees, statusFilter]);

    // Group employees by department
    const groupedEmployees = useMemo(() => {
        const groups: Record<string, any[]> = {};

        // Initialize 'Unassigned' group
        groups['Sans Département'] = [];

        filteredEmployees.forEach(emp => {
            const deptName = emp.department?.name || 'Sans Département';
            if (!groups[deptName]) {
                groups[deptName] = [];
            }
            groups[deptName].push(emp);
        });

        return groups;
    }, [filteredEmployees]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0 1rem', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                >
                    <option value="ALL">Tous les statuts</option>
                    <option value="ACTIVE">Actifs</option>
                    <option value="TRIAL">Période d'essai</option>
                    <option value="EXPIRED">Contrat Expiré</option>
                    <option value="NO_CONTRACT">Sans Contrat</option>
                    <option value="SUSPENDED">Suspendus</option>
                    <option value="EXITED">Sortis</option>
                </select>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', height: '100%' }}>
                {Object.entries(groupedEmployees).map(([deptName, deptEmployees]) => (
                    <div key={deptName} style={{
                        minWidth: '300px',
                        maxWidth: '300px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid #e2e8f0',
                        height: 'fit-content',
                        maxHeight: '100%'
                    }}>
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>{deptName}</h3>
                            <span style={{
                                fontSize: '0.75rem', fontWeight: 600,
                                backgroundColor: '#e2e8f0', color: '#64748b',
                                padding: '2px 8px', borderRadius: '12px'
                            }}>
                                {deptEmployees.length}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', paddingRight: '4px' }}>
                            {deptEmployees.map(emp => {
                                const status = getEmployeeDisplayStatus(emp);
                                return (
                                    <div
                                        key={emp.id}
                                        onClick={() => navigate(`/employees/${emp.id}`)}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '8px',
                                            padding: '1rem',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            border: '1px solid #e2e8f0',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.75rem',
                                            opacity: emp.status === 'EXITED' ? 0.7 : 1
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                                            e.currentTarget.style.borderColor = '#cbd5e1';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                backgroundColor: '#e0e7ff', color: '#4f46e5',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 600, fontSize: '0.9rem', flexShrink: 0
                                            }}>
                                                {emp.firstName[0]}
                                                {emp.lastName[0]}
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>
                                                        {emp.firstName} {emp.lastName}
                                                    </h4>
                                                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: status.bg, color: status.color, fontWeight: 600 }}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.8rem' }}>
                                                    <Briefcase size={12} />
                                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.jobTitle || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {emp.workEmail && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                                                    <Mail size={12} />
                                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.workEmail}</span>
                                                </div>
                                            )}
                                            {emp.workMobile && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                                                    <Phone size={12} />
                                                    <span>{emp.workMobile}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
