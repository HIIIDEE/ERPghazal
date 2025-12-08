import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useEmployeeStore } from './employeeStore';
import { X } from 'lucide-react';

interface EmployeeModalProps {
    employee?: any;
    onClose: () => void;
}

interface EmployeeFormData {
    firstName: string;
    lastName: string;
    workEmail: string;
    jobTitle: string;
    workPhone: string;
    workMobile: string;
    departmentId: string;
    hireDate: string;
    // Private
    address?: string;
    privateEmail?: string;
    phone?: string;
    nationality?: string;
    bankAccount?: string;
    maritalStatus?: string;
    gender?: string;
    birthday?: string;
    placeOfBirth?: string;
    countryOfBirth?: string;
    children?: number;
    emergencyContact?: string;
    emergencyPhone?: string;
    positionId?: string; // Add positionId
    status?: string;
    identificationId?: string;
    badgeId?: string;
    paymentMethod?: string;
    workLocation?: string;
    // CNAS
    socialSecurityNumber?: string;
    cnasAgency?: string;
    cnasStartDate?: string;
    isHandicapped?: boolean;
    cnasContribution?: boolean;
}

export function CreateEmployeeModal({ employee, onClose }: EmployeeModalProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<EmployeeFormData>({
        defaultValues: employee ? {
            ...employee,
            positionId: employee.position?.id, // Pre-fill positionId
            hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
            birthday: employee.birthday ? new Date(employee.birthday).toISOString().split('T')[0] : '',
            cnasStartDate: employee.cnasStartDate ? new Date(employee.cnasStartDate).toISOString().split('T')[0] : '',
            status: employee.status || 'ACTIVE',
            isHandicapped: employee.isHandicapped || false,
            cnasContribution: employee.cnasContribution ?? true
        } : {
            status: 'ACTIVE',
            cnasContribution: true,
            isHandicapped: false
        } // Default for new employee
    });

    // Get store actions and state
    const createEmployee = useEmployeeStore((state) => state.createEmployee);
    const updateEmployee = useEmployeeStore((state) => state.updateEmployee);
    const fetchPositions = useEmployeeStore((state) => state.fetchPositions);
    const assignPosition = useEmployeeStore((state) => state.assignPosition);
    const positions = useEmployeeStore((state) => state.positions);

    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);

    const onSubmit = async (data: EmployeeFormData) => {
        try {
            if (employee) {
                // Check if position changed
                let positionUpdated = false;
                if (data.positionId && data.positionId !== employee.position?.id) {
                    await assignPosition(employee.id, data.positionId, new Date().toISOString());
                    positionUpdated = true;
                }

                // Update other fields
                // Sanitizing payload: convert empty string to null for optional fields and Enums
                const payload: any = {
                    ...data,
                    jobTitle: data.jobTitle || null,
                    departmentId: data.departmentId || null,
                    maritalStatus: data.maritalStatus || null,
                    gender: data.gender || null,
                    nationality: data.nationality || null,
                    bankAccount: data.bankAccount || null,
                    address: data.address || null,
                    privateEmail: data.privateEmail || null,
                    phone: data.phone || null,
                    emergencyContact: data.emergencyContact || null,
                    emergencyPhone: data.emergencyPhone || null,
                    status: data.status,
                    socialSecurityNumber: data.socialSecurityNumber || null,
                    cnasAgency: data.cnasAgency || null,
                    cnasStartDate: data.cnasStartDate || null,
                    isHandicapped: data.isHandicapped,
                    cnasContribution: data.cnasContribution
                };

                // If handled by assignPosition, don't send it again to avoid conflicts
                if (positionUpdated) {
                    delete payload.positionId;
                } else {
                    payload.positionId = data.positionId || null;
                }

                await updateEmployee(employee.id, payload);
            } else {
                await createEmployee(data);
                // If creation includes positionId, backend might need to handle assignment logic too
                // or we call assignPosition after creation (requires ID).
                // For now assuming creation just sets relation without history or simple relation.
            }
            onClose();
        } catch (e) {
            alert('Erreur lors de l\'enregistrement');
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '800px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{employee ? 'Modifier Employé' : 'Nouvel Employé'}</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Section Identité */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Identité</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Prénom <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    {...register("firstName", { required: "Prénom requis" })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                />
                                {errors.firstName && <span style={{ color: 'red', fontSize: '0.75rem' }}>{errors.firstName.message}</span>}
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Nom <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    {...register("lastName", { required: "Nom requis" })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                />
                                {errors.lastName && <span style={{ color: 'red', fontSize: '0.75rem' }}>{errors.lastName.message}</span>}
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Poste</label>
                            <select
                                {...register("positionId")}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            >
                                <option value="">Sélectionner un poste...</option>
                                {positions.map((pos: any) => (
                                    <option key={pos.id} value={pos.id}>{pos.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Section Coordonnées Pro */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Coordonnées Professionnelles</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email Pro <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="email"
                                    {...register("workEmail", { required: "Email requis" })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                />
                                {errors.workEmail && <span style={{ color: 'red', fontSize: '0.75rem' }}>{errors.workEmail.message}</span>}
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Mobile Pro</label>
                                <input
                                    {...register("workMobile")}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Lieu de travail (Site)</label>
                                <input
                                    {...register("workLocation")}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                    placeholder="Ex: Siège, Usine..."
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Téléphone Bureau</label>
                                <input
                                    {...register("workPhone")}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Date d'embauche <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="date"
                                    {...register("hireDate", { required: "Date requise" })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Statut</label>
                                <select
                                    {...register("status")}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                >
                                    <option value="ACTIVE">Actif</option>
                                    <option value="SUSPENDED">Suspendu</option>
                                    <option value="EXITED">Sorti</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section CNAS */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#dc2626', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>CNAS / Sécurité Sociale</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input type="checkbox" {...register("isHandicapped")} id="isHandicapped" style={{ width: '1rem', height: '1rem' }} />
                                    <label htmlFor="isHandicapped" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Est handicapée</label>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input type="checkbox" {...register("cnasContribution")} id="cnasContribution" style={{ width: '1rem', height: '1rem' }} />
                                    <label htmlFor="cnasContribution" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Contribution CNAS</label>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>N° Sécurité Sociale</label>
                                    <input {...register("socialSecurityNumber")} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>CNAS Depuis (Date)</label>
                                    <input type="date" {...register("cnasStartDate")} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Agence CNAS</label>
                                    <input {...register("cnasAgency")} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} placeholder="Ex: Batna" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Informations Personnelles */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Informations Personnelles</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Adresse</label>
                                <input {...register("address")} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email Privé</label>
                                <input {...register("privateEmail")} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Téléphone</label>
                                <input {...register("phone")} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Nationalité</label>
                                <input {...register("nationality")} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Compte Bancaire (RIB)</label>
                                <input {...register("bankAccount")} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>État Civil</label>
                                <select {...register("maritalStatus")} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                                    <option value="">-</option>
                                    <option value="Célibataire">Célibataire</option>
                                    <option value="Marié(e)">Marié(e)</option>
                                    <option value="Divorcé(e)">Divorcé(e)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Nombre d'enfants</label>
                                <input type="number" {...register("children")} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Date de naissance</label>
                                <input type="date" {...register("birthday")} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Lieu de naissance</label>
                                <input {...register("placeOfBirth")} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Pays de naissance</label>
                                <input {...register("countryOfBirth")} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                        </div>
                    </div>

                    {/* Section Informations Administratives */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Informations Administratives</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>NIN (Identité Nationale)</label>
                                <input {...register("identificationId")} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Matricule Interne</label>
                                <input {...register("badgeId")} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Mode de Paiement</label>
                                <select {...register("paymentMethod")} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                                    <option value="">-</option>
                                    <option value="VIREMENT">Virement</option>
                                    <option value="ESPECE">Espèce</option>
                                    <option value="CHEQUE">Chèque</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer' }}>Annuler</button>
                        <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '4px', backgroundColor: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}>{employee ? 'Enregistrer' : 'Créer'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
