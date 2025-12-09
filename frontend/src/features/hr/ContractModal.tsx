import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useEmployeeStore } from './employeeStore';
import { X } from 'lucide-react';

interface ContractModalProps {
    employeeId?: string; // Optional now
    contract?: any; // If present, we are editing
    onClose: () => void;
    previousContractId?: string;
}

interface ContractFormData {
    employeeId?: string;
    type: string;
    status: string;
    startDate: string;
    endDate?: string;
    wage: number;
    hourlyWage?: number;
    weeklyHours?: number;
    classification?: string;
    coefficient?: string;
    cnasScheme?: string;
    fiscalScheme?: string;
    executiveStatus?: string;
    trialPeriodDuration?: number;
    trialPeriodEndDate?: string;
    workingSchedule?: string;
    workSchedule?: string;
    scheduledPay?: string;
    reference?: string;
    salaryStructureId?: string;
}

export function ContractModal({ employeeId, contract, onClose, previousContractId }: ContractModalProps) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<ContractFormData>();
    const { createContract, updateContract, employees, fetchEmployees, salaryStructures, fetchSalaryStructures } = useEmployeeStore();

    // Watch fields for conditional logic
    const contractType = watch('type');
    const startDate = watch('startDate');
    const trialDuration = watch('trialPeriodDuration');

    // Auto-calculate trial end date based on duration
    useEffect(() => {
        if (startDate && trialDuration) {
            const start = new Date(startDate);
            start.setDate(start.getDate() + Number(trialDuration));
            setValue('trialPeriodEndDate', start.toISOString().split('T')[0]);
        }
    }, [startDate, trialDuration, setValue]);

    // Force EndDate null if CDI
    useEffect(() => {
        if (contractType === 'CDI') {
            setValue('endDate', '');
        }
    }, [contractType, setValue]);

    const [needsEmployeeSelection] = useState(!employeeId && !contract);

    useEffect(() => {
        if (needsEmployeeSelection && employees.length === 0) {
            fetchEmployees();
        }
        fetchSalaryStructures();
    }, [needsEmployeeSelection, employees.length, fetchEmployees, fetchSalaryStructures]);

    useEffect(() => {
        if (contract) {
            // Pre-fill form
            setValue('type', contract.type);
            setValue('status', contract.status);
            setValue('startDate', contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '');
            setValue('endDate', contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '');
            setValue('wage', contract.wage);
            setValue('hourlyWage', contract.hourlyWage);
            setValue('weeklyHours', contract.weeklyHours);
            setValue('classification', contract.classification || '');
            setValue('coefficient', contract.coefficient || '');
            setValue('cnasScheme', contract.cnasScheme || 'GENERAL');
            setValue('fiscalScheme', contract.fiscalScheme || 'IMPOSABLE');
            setValue('executiveStatus', contract.executiveStatus || 'NON_CADRE');
            setValue('trialPeriodDuration', contract.trialPeriodDuration);
            setValue('trialPeriodEndDate', contract.trialPeriodEndDate ? new Date(contract.trialPeriodEndDate).toISOString().split('T')[0] : '');
            setValue('workingSchedule', contract.workingSchedule || '');
            setValue('workSchedule', contract.workSchedule || 'FIVE_DAYS');
            setValue('scheduledPay', contract.scheduledPay || '');
            setValue('reference', contract.reference || '');
            setValue('salaryStructureId', contract.salaryStructureId || '');
            if (contract.employeeId) {
                setValue('employeeId', contract.employeeId);
            }
        } else {
            reset();
            setValue('status', 'DRAFT');
            setValue('type', 'CDI');
            setValue('workSchedule', 'FIVE_DAYS');
            setValue('cnasScheme', 'GENERAL');
            setValue('fiscalScheme', 'IMPOSABLE');
            setValue('executiveStatus', 'NON_CADRE');
            if (employeeId) {
                setValue('employeeId', employeeId);
            }
        }
    }, [contract, setValue, reset, employeeId]);

    const onSubmit = async (data: ContractFormData) => {
        const targetEmployeeId = employeeId || data.employeeId;
        if (!targetEmployeeId) {
            alert("Veuillez sélectionner un employé.");
            return;
        }

        const payload = {
            ...data,
            employeeId: targetEmployeeId,
            wage: Number(data.wage),
            hourlyWage: data.hourlyWage ? Number(data.hourlyWage) : undefined,
            weeklyHours: data.weeklyHours ? Number(data.weeklyHours) : undefined,
            trialPeriodDuration: data.trialPeriodDuration ? Number(data.trialPeriodDuration) : undefined,
            endDate: data.endDate || undefined,
            trialPeriodEndDate: data.trialPeriodEndDate || undefined,
            reference: data.reference || undefined,
            salaryStructureId: data.salaryStructureId || undefined,
            previousContractId: previousContractId || undefined
        };

        try {
            if (contract) {
                await updateContract(contract.id, payload);
            } else {
                await createContract(payload);
            }
            onClose();
        } catch (e) {
            console.error(e);
            alert("Une erreur est survenue. Vérifiez les dates.");
        }
    };

    const SectionHeader = ({ title }: { title: string }) => (
        <h4 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#1e293b',
            marginTop: '1.5rem',
            marginBottom: '0.75rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #e2e8f0'
        }}>
            {title}
        </h4>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '600px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>{contract ? 'Modifier Contrat' : 'Nouveau Contrat'}</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

                    {/* GENERAL SECTION */}
                    <SectionHeader title="Informations Générales" />

                    {needsEmployeeSelection && (
                        <div>
                            <label style={labelStyle}>Employé</label>
                            <select {...register('employeeId', { required: true })} style={inputStyle}>
                                <option value="">Sélectionner un employé...</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Type de Contrat</label>
                            <select {...register('type')} style={inputStyle}>
                                <option value="CDI">CDI</option>
                                <option value="CDD">CDD</option>
                                <option value="CDD_RENOUVELABLE">CDD Renouvelable</option>
                                <option value="JOURNALIER">Journalier</option>
                                <option value="STAGIAIRE">Stagiaire</option>
                                <option value="APPRENTI">Apprenti</option>
                                <option value="INTERIMAIRE">Intérimaire</option>
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
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Date de début</label>
                            <input type="date" {...register('startDate')} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Date de fin {contractType !== 'CDI' && '*'}</label>
                            <input
                                type="date"
                                {...register('endDate', { required: contractType !== 'CDI' })}
                                style={{ ...inputStyle, backgroundColor: contractType === 'CDI' ? '#f1f5f9' : 'white' }}
                                disabled={contractType === 'CDI'}
                            />
                        </div>
                    </div>

                    {/* TRIAL SECTION */}
                    <SectionHeader title="Période d'Essai" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Durée (jours)</label>
                            <input type="number" {...register('trialPeriodDuration')} style={inputStyle} placeholder="Ex: 30" />
                        </div>
                        <div>
                            <label style={labelStyle}>Fin Période d'Essai</label>
                            <input type="date" {...register('trialPeriodEndDate')} style={inputStyle} />
                        </div>
                    </div>

                    {/* DETAILS & PAY SECTION */}
                    <SectionHeader title="Détails & Paie" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Salaire de base (Mensuel)</label>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input type="number" step="0.01" {...register('wage')} style={{ ...inputStyle, borderTopRightRadius: 0, borderBottomRightRadius: 0 }} />
                                <span style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderLeft: 'none', borderTopRightRadius: '4px', borderBottomRightRadius: '4px', color: '#64748b' }}>Da</span>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Salaire Horaire</label>
                            <input type="number" step="0.01" {...register('hourlyWage')} style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Volume Horaire Hebdo</label>
                            <input type="number" {...register('weeklyHours')} style={inputStyle} defaultValue={40} />
                        </div>
                        <div>
                            <label style={labelStyle}>Heures de Travail (Texte)</label>
                            <input type="text" {...register('workingSchedule')} placeholder="Ex: 08h-16h / Dim-Jeu" style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Classification</label>
                            <input type="text" {...register('classification')} style={inputStyle} placeholder="Niveau/Echelon" />
                        </div>
                        <div>
                            <label style={labelStyle}>Coefficient</label>
                            <input type="text" {...register('coefficient')} style={inputStyle} placeholder="Ex: 120" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Structure Salariale</label>
                            <select {...register('salaryStructureId')} style={inputStyle}>
                                <option value="">Aucune (Règles individuelles uniquement)</option>
                                {salaryStructures.map(struct => (
                                    <option key={struct.id} value={struct.id}>{struct.name}</option>
                                ))}
                            </select>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                Les règles de cette structure seront appliquées automatiquement.
                            </p>
                        </div>
                    </div>

                    {/* SCHEMES SECTION */}
                    <SectionHeader title="Régimes Administratifs" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Régime CNAS</label>
                            <select {...register('cnasScheme')} style={inputStyle}>
                                <option value="GENERAL">Général</option>
                                <option value="CADRE">Cadre</option>
                                <option value="NON_ASSUJETTI">Non Assujetti</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Régime Fiscal</label>
                            <select {...register('fiscalScheme')} style={inputStyle}>
                                <option value="IMPOSABLE">Imposable</option>
                                <option value="EXONERE">Exonéré</option>
                                <option value="ABATTEMENT_40">Abattement 40%</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Statut Cadre</label>
                            <select {...register('executiveStatus')} style={inputStyle}>
                                <option value="NON_CADRE">Non Cadre</option>
                                <option value="CADRE">Cadre</option>
                                <option value="MAITRISE">Maitrise</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.625rem 1.25rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer', fontWeight: 500, color: '#475569' }}>Annuler</button>
                        <button type="submit" style={{ padding: '0.625rem 1.25rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                            {contract ? 'Enregistrer' : 'Créer le contrat'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#334155' };
const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem' };
