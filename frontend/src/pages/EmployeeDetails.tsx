import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEmployeeStore } from '../features/hr/employeeStore';
import { ContractModal } from '../features/hr/ContractModal';
import { SmartButton } from '../components/SmartButton';
import { ContractKanban } from '../features/hr/ContractKanban';
import { CreateEmployeeModal } from '../features/hr/CreateEmployeeModal';
import { PositionHistoryModal } from '../features/hr/PositionHistoryModal';
import EmployeeAttendance from '../features/hr/EmployeeAttendance';
import { User, Phone, Mail, FileText, Briefcase, Award } from 'lucide-react';

export default function EmployeeDetails() {
    const { id } = useParams<{ id: string }>();
    const { fetchEmployee, selectedEmployee: employee, loading } = useEmployeeStore();
    const [activeTab, setActiveTab] = useState('work'); // work, private, hr
    const [viewMode, setViewMode] = useState<'details' | 'contracts_kanban'>('details');
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(false);
    const [editingContract, setEditingContract] = useState<any>(null);

    useEffect(() => {
        if (id) fetchEmployee(id);
    }, [id, fetchEmployee]);

    if (loading || !employee) return <div style={{ padding: '2rem' }}>Chargement...</div>;

    const TabButton = ({ name, label }: { name: string, label: string }) => (
        <button
            onClick={() => { setActiveTab(name); setViewMode('details'); }}
            style={{
                padding: '0.75rem 1.5rem',
                borderBottom: activeTab === name && viewMode === 'details' ? '2px solid #2563eb' : '2px solid transparent',
                color: activeTab === name && viewMode === 'details' ? '#2563eb' : '#64748b',
                fontWeight: 500,
                background: 'none',
                border: 'none',
                cursor: 'pointer'
            }}
        >
            {label}
        </button>
    );

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={40} color="#94a3b8" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0 }}>{employee.firstName} {employee.lastName}</h1>
                        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>{employee.jobTitle || 'Aucun poste défini'}</p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', fontSize: '0.875rem' }}>
                                <Mail size={14} /> {employee.workEmail}
                            </span>
                            {employee.workPhone && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', fontSize: '0.875rem' }}>
                                    <Phone size={14} /> {employee.workPhone}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Smart Buttons Area */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setEditingEmployee(true)}
                        style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, height: 'fit-content' }}
                    >
                        Modifier
                    </button>
                    <SmartButton
                        label="Contrats"
                        value={employee.contracts?.length || 0}
                        icon={Briefcase}
                        onClick={() => setViewMode('contracts_kanban')}
                    />
                    <SmartButton
                        label="Carrière"
                        value={employee.positionHistory?.length || 0}
                        icon={Award}
                        onClick={() => setIsPositionModalOpen(true)}
                    />
                </div>
            </div>

            {/* Navigation / Tabs */}
            {viewMode === 'details' ? (
                <>
                    <div style={{ borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <TabButton name="work" label="Informations Pro" />
                        <TabButton name="private" label="Informations Privées" />
                        <TabButton name="planning" label="Planning" />
                        <TabButton name="contracts" label="Contrats (Liste)" />
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        {activeTab === 'planning' && <EmployeeAttendance employeeId={employee.id} />}
                        {activeTab === 'work' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', marginBottom: '1rem' }}>Organisation</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <InfoRow label="Département" value={employee.department?.name} />
                                        <InfoRow label="Poste Actuel" value={employee.position?.title || 'Non défini'} />
                                        <InfoRow label="Manager" value="-" />
                                        <InfoRow label="Coach" value="-" />
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', marginBottom: '1rem' }}>Horaires</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <InfoRow label="Heures de travail" value="Standard 40h" />
                                        <InfoRow label="Fuseau horaire" value="UTC" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'private' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', marginBottom: '1rem' }}>Coordonnées Privées</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <InfoRow label="Adresse" value={employee.address} />
                                        <InfoRow label="Email Privé" value={employee.privateEmail} />
                                        <InfoRow label="Téléphone" value={employee.phone} />
                                        <InfoRow label="Nationalité" value={employee.nationality} />
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', marginBottom: '1rem' }}>État Civil</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <InfoRow label="Genre" value={employee.gender} />
                                        <InfoRow label="Date de naissance" value={employee.birthday ? new Date(employee.birthday).toLocaleDateString() : '-'} />
                                        <InfoRow label="Lieu de naissance" value={`${employee.placeOfBirth || ''} ${employee.countryOfBirth ? `(${employee.countryOfBirth})` : ''}`} />
                                        <InfoRow label="État Civil" value={employee.maritalStatus} />
                                        <InfoRow label="Enfants" value={employee.children?.toString()} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'contracts' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Contrats ({employee.contracts?.length || 0})</h3>
                                    <button
                                        onClick={() => setIsContractModalOpen(true)}
                                        style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <FileText size={16} /> Nouveau Contrat
                                    </button>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                            <th style={{ padding: '0.75rem', fontSize: '0.875rem' }}>Ref</th>
                                            <th style={{ padding: '0.75rem', fontSize: '0.875rem' }}>Type</th>
                                            <th style={{ padding: '0.75rem', fontSize: '0.875rem' }}>Début</th>
                                            <th style={{ padding: '0.75rem', fontSize: '0.875rem' }}>Fin</th>
                                            <th style={{ padding: '0.75rem', fontSize: '0.875rem' }}>Salaire</th>
                                            <th style={{ padding: '0.75rem', fontSize: '0.875rem' }}>Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employee.contracts?.map((contract: any) => (
                                            <tr key={contract.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '0.75rem', fontWeight: 500 }}>{contract.reference || '-'}</td>
                                                <td style={{ padding: '0.75rem' }}>{contract.type}</td>
                                                <td style={{ padding: '0.75rem' }}>{new Date(contract.startDate).toLocaleDateString()}</td>
                                                <td style={{ padding: '0.75rem' }}>{contract.endDate ? new Date(contract.endDate).toLocaleDateString() : '-'}</td>
                                                <td style={{ padding: '0.75rem' }}>{contract.wage} €</td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '999px',
                                                        fontSize: '0.75rem',
                                                        backgroundColor: contract.status === 'RUNNING' ? '#dcfce7' : '#f1f5f9',
                                                        color: contract.status === 'RUNNING' ? '#166534' : '#64748b'
                                                    }}>
                                                        {contract.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div style={{ marginTop: '1rem' }}>
                    <button
                        onClick={() => setViewMode('details')}
                        style={{ marginBottom: '1rem', padding: '0.5rem', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        ← Retour aux détails
                    </button>
                    <ContractKanban
                        contracts={employee.contracts || []}
                        onAddClick={() => { setEditingContract(null); setIsContractModalOpen(true); }}
                        onContractClick={(contract) => { setEditingContract(contract); setIsContractModalOpen(true); }}
                        onStatusChange={async (contractId, newStatus) => {
                            await useEmployeeStore.getState().updateContract(contractId, { status: newStatus });
                        }}
                        onAmendmentClick={(contract) => {
                            // Clone contract for amendment
                            setEditingContract({
                                ...contract,
                                id: undefined, // New contract
                                status: 'DRAFT',
                                type: contract.type,
                                startDate: '', // User should set new start date
                                previousContractId: contract.id // Link to previous
                            });
                            setIsContractModalOpen(true);
                        }}
                    />
                </div>
            )}

            {isContractModalOpen && (
                <ContractModal
                    employeeId={employee.id}
                    contract={editingContract?.id ? editingContract : null}
                    previousContractId={editingContract?.previousContractId}
                    onClose={() => { setIsContractModalOpen(false); setEditingContract(null); }}
                />
            )}

            {isPositionModalOpen && (
                <PositionHistoryModal
                    employee={employee}
                    onClose={() => setIsPositionModalOpen(false)}
                />
            )}

            {editingEmployee && (
                <CreateEmployeeModal
                    employee={employee}
                    onClose={() => setEditingEmployee(false)}
                />
            )}
        </div>
    );
}

const InfoRow = ({ label, value }: { label: string, value?: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
        <span style={{ color: '#64748b' }}>{label}</span>
        <span style={{ fontWeight: 500 }}>{value || '-'}</span>
    </div>
);
