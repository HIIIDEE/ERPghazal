import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useEmployeeStore } from '../features/hr/employeeStore';
import { ContractModal } from '../features/hr/ContractModal';
import { SmartButton } from '../components/SmartButton';
import { ContractKanban } from '../features/hr/ContractKanban';
import { PositionHistoryModal } from '../features/hr/PositionHistoryModal';
import EmployeeAttendance from '../features/hr/EmployeeAttendance';
import { User, Phone, Mail, FileText, Briefcase, Award, Save, X } from 'lucide-react';

export default function EmployeeDetails() {
    const { id } = useParams<{ id: string }>();
    const { fetchEmployee, selectedEmployee: employee, loading, updateEmployee, fetchDepartments, departments, fetchPositions, positions } = useEmployeeStore();
    const [activeTab, setActiveTab] = useState('work'); // work, private, hr, cnas
    const [viewMode, setViewMode] = useState<'details' | 'contracts_kanban'>('details');
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (id) fetchEmployee(id);
        fetchDepartments();
        fetchPositions();
    }, [id, fetchEmployee, fetchDepartments, fetchPositions]);

    // Reset form when employee, departments or positions are loaded
    useEffect(() => {
        if (employee) {
            reset({
                ...employee,
                departmentId: employee.departmentId || employee.department?.id, // Prioritize ID if available
                positionId: employee.positionId || employee.position?.id,
                hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
                birthday: employee.birthday ? new Date(employee.birthday).toISOString().split('T')[0] : '',
                cnasStartDate: employee.cnasStartDate ? new Date(employee.cnasStartDate).toISOString().split('T')[0] : '',
            });
        }
    }, [employee, reset]);

    const handleSave = async (data: any) => {
        try {
            await updateEmployee(employee!.id, {
                ...data,
                children: data.children ? Number(data.children) : 0,
                hireDate: data.hireDate || null,
                birthday: data.birthday || null,
                cnasStartDate: data.cnasStartDate || null,
                // Ensure IDs are strings or null
                departmentId: data.departmentId || null,
                positionId: data.positionId || null
            });
            setIsEditing(false);
        } catch (error) {
            alert('Erreur lors de la sauvegarde');
        }
    };

    if (loading || !employee) return <div style={{ padding: '2rem' }}>Chargement...</div>;

    const TabButton = ({ name, label }: { name: string, label: string }) => (
        <button
            onClick={() => { setActiveTab(name); setViewMode('details'); }}
            type="button"
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
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0 }}>
                            {employee.firstName} {employee.lastName}
                        </h1>
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
                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, height: 'fit-content' }}
                        >
                            Modifier
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => { setIsEditing(false); reset(); }}
                                style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, height: 'fit-content', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <X size={16} /> Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit(handleSave)}
                                style={{ padding: '0.5rem 1rem', border: 'none', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, height: 'fit-content', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Save size={16} /> Enregistrer
                            </button>
                        </div>
                    )}

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
                        <TabButton name="cnas" label="CNAS" />
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
                                        <InfoRow
                                            label="Département"
                                            value={employee.department?.name}
                                            isEditing={isEditing}
                                            register={register}
                                            name="departmentId"
                                            asSelect={departments.map(d => ({ value: d.id, label: d.name }))}
                                        />
                                        <InfoRow
                                            label="Poste Actuel"
                                            value={employee.position?.title}
                                            isEditing={isEditing}
                                            register={register}
                                            name="positionId"
                                            asSelect={positions.map(p => ({ value: p.id, label: p.title }))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', marginBottom: '1rem' }}>Coordonnées Pro</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <InfoRow label="Email Pro" value={employee.workEmail} isEditing={isEditing} register={register} name="workEmail" />
                                        <InfoRow label="Mobile Pro" value={employee.workMobile} isEditing={isEditing} register={register} name="workMobile" />
                                        <InfoRow label="Tél Bureau" value={employee.workPhone} isEditing={isEditing} register={register} name="workPhone" />
                                        <InfoRow label="Lieu de travail" value={employee.workLocation} isEditing={isEditing} register={register} name="workLocation" />
                                        <InfoRow label="Date d'embauche" value={employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : '-'} isEditing={isEditing} register={register} name="hireDate" type="date" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'private' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', marginBottom: '1rem' }}>Coordonnées Privées</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <InfoRow label="Adresse" value={employee.address} isEditing={isEditing} register={register} name="address" />
                                        <InfoRow label="Email Privé" value={employee.privateEmail} isEditing={isEditing} register={register} name="privateEmail" />
                                        <InfoRow label="Téléphone" value={employee.phone} isEditing={isEditing} register={register} name="phone" />
                                        <InfoRow label="Nationalité" value={employee.nationality} isEditing={isEditing} register={register} name="nationality" />
                                        <InfoRow label="Compte Bancaire" value={employee.bankAccount} isEditing={isEditing} register={register} name="bankAccount" />
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', marginBottom: '1rem' }}>État Civil</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <InfoRow label="Genre" value={employee.gender} isEditing={isEditing} register={register} name="gender" asSelect={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }]} />
                                        <InfoRow label="Date de naissance" value={employee.birthday ? new Date(employee.birthday).toLocaleDateString() : '-'} isEditing={isEditing} register={register} name="birthday" type="date" />
                                        <InfoRow label="Lieu de naissance" value={employee.placeOfBirth} isEditing={isEditing} register={register} name="placeOfBirth" />
                                        <InfoRow label="Pays de naissance" value={employee.countryOfBirth} isEditing={isEditing} register={register} name="countryOfBirth" />
                                        <InfoRow label="État Civil" value={employee.maritalStatus} isEditing={isEditing} register={register} name="maritalStatus" asSelect={[{ value: 'SINGLE', label: 'Célibataire' }, { value: 'MARRIED', label: 'Marié(e)' }, { value: 'DIVORCED', label: 'Divorcé(e)' }, { value: 'WIDOWED', label: 'Veuf/Veuve' }]} />
                                        <InfoRow label="Enfants" value={employee.children?.toString()} isEditing={isEditing} register={register} name="children" type="number" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'cnas' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {/* Checkboxes */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <label style={{ fontSize: '0.875rem', color: '#64748b', minWidth: '150px' }}>Est handicapée</label>
                                        <input
                                            type="checkbox"
                                            {...(isEditing ? register('isHandicapped') : { checked: employee.isHandicapped || false, readOnly: true })}
                                            style={{ accentColor: '#2563eb', width: '1rem', height: '1rem' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <label style={{ fontSize: '0.875rem', color: '#64748b', minWidth: '150px', fontWeight: 600 }}>Contribution cnas ?</label>
                                        <input
                                            type="checkbox"
                                            {...(isEditing ? register('cnasContribution') : { checked: employee.cnasContribution ?? true, readOnly: true })}
                                            style={{ accentColor: '#e11d48', width: '1rem', height: '1rem' }}
                                        />
                                    </div>
                                </div>

                                {/* Main Info Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <InfoRow label="N° Sécurité Sociale" value={employee.socialSecurityNumber} isEditing={isEditing} register={register} name="socialSecurityNumber" />
                                            <InfoRow label="Depuis" value={employee.cnasStartDate ? new Date(employee.cnasStartDate).toLocaleDateString() : '-'} isEditing={isEditing} register={register} name="cnasStartDate" type="date" />
                                            <InfoRow label="Agence" value={employee.cnasAgency} isEditing={isEditing} register={register} name="cnasAgency" isRed />
                                            <InfoRow label="Mutuelle" value={employee.cnasMutual} isEditing={isEditing} register={register} name="cnasMutual" />
                                            <InfoRow label="Taux année de service" value={employee.cnasRateService || "0,00"} isEditing={isEditing} register={register} name="cnasRateService" />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <InfoRow label="Cotisation Salariale" value={employee.cnasRateSalary || "9,00 %"} isEditing={isEditing} register={register} name="cnasRateSalary" />
                                            <InfoRow label="Cotisation Patronale" value={employee.cnasRatePatron || "26,00 %"} isEditing={isEditing} register={register} name="cnasRatePatron" />
                                            <InfoRow label="Oeuvre Sociale 0.5%" value={employee.cnasRateSocial || "0,50 %"} isEditing={isEditing} register={register} name="cnasRateSocial" />
                                            <InfoRow label="Cot part Logement sociale 0.5%" value={employee.cnasRateHousing || "0,50 %"} isEditing={isEditing} register={register} name="cnasRateHousing" />
                                            <InfoRow label="Cacobath" value={employee.cnasRateCacobath || "0,00"} isEditing={isEditing} register={register} name="cnasRateCacobath" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'contracts' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Contrats ({employee.contracts?.length || 0})</h3>
                                    <button
                                        type="button"
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
                        type="button"
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
                            setEditingContract({
                                ...contract,
                                id: undefined,
                                status: 'DRAFT',
                                type: contract.type,
                                startDate: '',
                                previousContractId: contract.id
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
        </div>
    );
}

interface InfoRowProps {
    label: string;
    value?: string;
    isRed?: boolean;
    isEditing?: boolean;
    register?: any;
    name?: string;
    type?: string;
    asSelect?: { value: string, label: string }[];
}

const InfoRow = ({ label, value, isRed, isEditing, register, name, type = 'text', asSelect }: InfoRowProps) => {
    if (isEditing && register && name) {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                {asSelect ? (
                    <select {...register(name)} style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        <option value="">-</option>
                        {asSelect.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        {...register(name)}
                        style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'right' }}
                    />
                )}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
            <span style={{ color: '#64748b' }}>{label}</span>
            <span style={{ fontWeight: 500, color: isRed ? '#dc2626' : 'inherit' }}>{value || '-'}</span>
        </div>
    );
};
