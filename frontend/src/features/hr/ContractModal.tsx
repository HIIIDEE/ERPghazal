import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useEmployeeStore } from './employeeStore';
import { X } from 'lucide-react';

interface ContractModalProps {
    employeeId: string;
    contract?: any; // If present, we are editing
    onClose: () => void;
    previousContractId?: string;
}

interface ContractFormData {
    type: string;
    status: string;
    startDate: string;
    endDate?: string;
    wage: number;
    trialPeriodEndDate?: string;
    workingSchedule?: string;
    workSchedule?: string; // Enum
    scheduledPay?: string;
    reference?: string;
}

export function ContractModal({ employeeId, contract, onClose, previousContractId }: ContractModalProps) {
    const { register, handleSubmit, reset, setValue } = useForm<ContractFormData>();
    const { createContract, updateContract } = useEmployeeStore();
    const [activeSection, setActiveSection] = useState('general'); // general, trial, salary

    useEffect(() => {
        if (contract) {
            // Pre-fill form
            setValue('type', contract.type);
            setValue('status', contract.status);
            setValue('startDate', contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '');
            setValue('endDate', contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '');
            setValue('wage', contract.wage);
            setValue('trialPeriodEndDate', contract.trialPeriodEndDate ? new Date(contract.trialPeriodEndDate).toISOString().split('T')[0] : '');
            setValue('workingSchedule', contract.workingSchedule || '');
            setValue('workSchedule', contract.workSchedule || 'FIVE_DAYS');
            setValue('scheduledPay', contract.scheduledPay || '');
            setValue('reference', contract.reference || '');
        } else {
            reset();
            setValue('status', 'DRAFT'); // Default
            setValue('type', 'CDI');
            setValue('workSchedule', 'FIVE_DAYS');
        }
    }, [contract, setValue, reset]);

    const onSubmit = async (data: ContractFormData) => {
        const payload = {
            ...data,
            employeeId,
            wage: Number(data.wage),
            // Clean up empty strings
            endDate: data.endDate || undefined,
            trialPeriodEndDate: data.trialPeriodEndDate || undefined,
            workingSchedule: data.workingSchedule || undefined,
            workSchedule: data.workSchedule || 'FIVE_DAYS',
            scheduledPay: data.scheduledPay || undefined,
            reference: data.reference || undefined,
            previousContractId: previousContractId || undefined
        };

        if (contract) {
            await updateContract(contract.id, payload);
        } else {
            await createContract(payload);
        }
        onClose();
    };

    const SectionButton = ({ id, label }: { id: string, label: string }) => (
        <button
            type="button"
            onClick={() => setActiveSection(id)}
            style={{
                flex: 1,
                padding: '0.5rem',
                borderBottom: activeSection === id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                color: activeSection === id ? '#2563eb' : '#64748b',
                fontWeight: 500,
                background: 'none',
                borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                cursor: 'pointer', fontSize: '0.875rem'
            }}
        >
            {label}
        </button>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '500px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{contract ? 'Modifier Contrat' : 'Nouveau Contrat'}</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', marginBottom: '1.5rem' }}>
                    <SectionButton id="general" label="Général" />
                    <SectionButton id="trial" label="Période d'Essai" />
                    <SectionButton id="salary" label="Salaire & Paie" />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {activeSection === 'general' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Type de Contrat</label>
                                    <select {...register('type')} style={inputStyle}>
                                        <option value="CDI">CDI</option>
                                        <option value="CDD">CDD</option>
                                        <option value="INTERNSHIP">Stage</option>
                                        <option value="FREELANCE">Freelance</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Statut</label>
                                    <select {...register('status')} style={inputStyle}>
                                        <option value="DRAFT">Brouillon</option>
                                        <option value="RUNNING">En cours</option>
                                        <option value="TO_RENEW">A renouveler</option>
                                        <option value="EXPIRED">Expiré</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Référence</label>
                                    <input type="text" {...register('reference')} style={inputStyle} placeholder="ex: CT-2023-001" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Date de début</label>
                                    <input type="date" {...register('startDate')} style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Date de fin</label>
                                    <input type="date" {...register('endDate')} style={inputStyle} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'trial' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Fin Période d'Essai</label>
                                <input type="date" {...register('trialPeriodEndDate')} style={inputStyle} />
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                La période d'essai permet d'évaluer les compétences du salarié dans son travail.
                            </p>
                        </div>
                    )}

                    {activeSection === 'salary' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Salaire de base (Mensuel)</label>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input type="number" step="0.01" {...register('wage')} style={{ ...inputStyle, borderTopRightRadius: 0, borderBottomRightRadius: 0 }} />
                                    <span style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderLeft: 'none', borderTopRightRadius: '4px', borderBottomRightRadius: '4px', color: '#64748b' }}>€</span>
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Régime de Travail</label>
                                <select {...register('workSchedule')} style={inputStyle}>
                                    <option value="FIVE_DAYS">5 Jours / Semaine (Lun-Ven)</option>
                                    <option value="SIX_DAYS">6 Jours / Semaine (Lun-Sam)</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Paie Planifiée</label>
                                <select {...register('scheduledPay')} style={inputStyle}>
                                    <option value="">Sélectionner...</option>
                                    <option value="MONTHLY">Mensuelle</option>
                                    <option value="QUARTERLY">Trimestrielle</option>
                                    <option value="WEEKLY">Hebdomadaire</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Heures de Travail</label>
                                <input type="text" {...register('workingSchedule')} placeholder="Ex: Standard 40h/semaine" style={inputStyle} />
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer' }}>Annuler</button>
                        <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                            {contract ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#334155' };
const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem' };
