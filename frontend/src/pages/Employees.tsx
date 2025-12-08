import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeStore } from '../features/hr/employeeStore';
import { CreateEmployeeModal } from '../features/hr/CreateEmployeeModal';
import { EmployeeKanban } from '../features/hr/EmployeeKanban';
import { UserPlus, Search, LayoutGrid, List as ListIcon } from 'lucide-react';

export function Employees() {
    const { employees, loading, fetchEmployees } = useEmployeeStore();
    const [iscreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const navigate = useNavigate();

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const filteredEmployees = employees.filter(emp =>
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.workEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Gestion des Employés</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}
                >
                    <UserPlus size={20} /> Nouvel Employé
                </button>
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Rechercher un employé..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.625rem 0.5rem 0.625rem 2.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '6px', padding: '4px' }}>
                    <button
                        onClick={() => setViewMode('list')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer',
                            backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
                            color: viewMode === 'list' ? '#1e293b' : '#64748b',
                            boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                            fontWeight: 500
                        }}
                    >
                        <ListIcon size={18} /> Liste
                    </button>
                    <button
                        onClick={() => setViewMode('kanban')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer',
                            backgroundColor: viewMode === 'kanban' ? 'white' : 'transparent',
                            color: viewMode === 'kanban' ? '#1e293b' : '#64748b',
                            boxShadow: viewMode === 'kanban' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                            fontWeight: 500
                        }}
                    >
                        <LayoutGrid size={18} /> Kanban
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>
            ) : viewMode === 'list' ? (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Nom</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Email Pro</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Titre</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Département</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Date d'embauche</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Aucun employé trouvé.</td></tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <tr
                                        key={emp.id}
                                        style={{ borderTop: '1px solid #e2e8f0', cursor: 'pointer' }}
                                        onClick={() => navigate(`/employees/${emp.id}`)}
                                    >
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 500 }}>{emp.firstName} {emp.lastName}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{emp.workEmail}</td>
                                        <td style={{ padding: '1rem' }}>{emp.jobTitle || '-'}</td>
                                        <td style={{ padding: '1rem' }}>{emp.department?.name || '-'}</td>
                                        <td style={{ padding: '1rem' }}>{new Date(emp.hireDate).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmployeeKanban employees={filteredEmployees} departments={[]} />
            )}

            {iscreateModalOpen && <CreateEmployeeModal onClose={() => setIsCreateModalOpen(false)} />}
        </div>
    );
}
