import { useState, useEffect } from 'react';
import { useEmployeeStore } from './employeeStore';
import { usePayrollConfigStore } from './payrollConfigStore';
import { Users, Plus, Trash2, Calendar, DollarSign, Percent } from 'lucide-react';

export function EmployeeRubriqueAssignment() {
    const { employees, fetchEmployees, selectedEmployee, fetchEmployee } = useEmployeeStore();
    const { employeeRubriques, fetchEmployeeRubriques, assignRubriqueToEmployee, removeEmployeeRubrique } = usePayrollConfigStore();
    const [allRubriques, setAllRubriques] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRubrique, setSelectedRubrique] = useState<any>(null);
    const [formData, setFormData] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        montantOverride: undefined as number | undefined,
        tauxOverride: undefined as number | undefined
    });

    useEffect(() => {
        fetchEmployees();
        fetchAllRubriques();
    }, [fetchEmployees]);

    useEffect(() => {
        if (selectedEmployee) {
            fetchEmployeeRubriques(selectedEmployee.id);
        }
    }, [selectedEmployee, fetchEmployeeRubriques]);

    const fetchAllRubriques = async () => {
        try {
            const response = await fetch('http://localhost:3000/hr/rubriques');
            const data = await response.json();
            setAllRubriques(data.filter((r: any) => r.isActive));
        } catch (error) {
            console.error('Error fetching rubriques:', error);
        }
    };

    const openAssignmentModal = (rubrique: any) => {
        setSelectedRubrique(rubrique);
        setFormData({
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            montantOverride: rubrique.montantType === 'FIXE' ? rubrique.valeur : undefined,
            tauxOverride: rubrique.montantType === 'POURCENTAGE' ? rubrique.valeur : undefined
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee || !selectedRubrique) return;

        try {
            await assignRubriqueToEmployee({
                employeeId: selectedEmployee.id,
                rubriqueId: selectedRubrique.id,
                startDate: formData.startDate,
                endDate: formData.endDate || undefined,
                montantOverride: formData.montantOverride,
                tauxOverride: formData.tauxOverride
            });
            setIsModalOpen(false);
            alert('Rubrique attribuée avec succès');
        } catch (error) {
            alert('Erreur lors de l\'attribution');
        }
    };

    const handleRemove = async (assignmentId: string) => {
        if (confirm('Retirer cette rubrique de l\'employé ?')) {
            try {
                await removeEmployeeRubrique(assignmentId);
                alert('Rubrique retirée');
            } catch (error) {
                alert('Erreur lors de la suppression');
            }
        }
    };

    const getAssignedRubrique = (rubriqueId: number) => {
        return employeeRubriques.find(er =>
            er.rubriqueId === rubriqueId &&
            (!er.endDate || new Date(er.endDate) >= new Date())
        );
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
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const typeColors: Record<string, string> = {
        BASE: '#3b82f6',
        GAIN: '#059669',
        RETENUE: '#ef4444',
        COTISATION: '#f59e0b'
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
            {/* Employee List */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', height: 'fit-content' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} /> Employés
                </div>
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
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                borderBottom: '1px solid #f9fafb'
                            }}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#4b5563'
                            }}>
                                {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1f2937' }}>
                                    {emp.firstName} {emp.lastName}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                    {emp.position?.title || 'Sans poste'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Assignment Panel */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', minHeight: '300px' }}>
                {!selectedEmployee ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexDirection: 'column', gap: '1rem' }}>
                        <Users size={48} color="#d1d5db" />
                        <div>Sélectionnez un employé pour gérer ses rubriques</div>
                    </div>
                ) : (
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Rubriques de paie: <span style={{ color: '#059669' }}>{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                            Attribuez des rubriques à cet employé avec des montants et dates personnalisés
                        </p>

                        {/* Grouped by Type */}
                        {['BASE', 'GAIN', 'RETENUE', 'COTISATION'].map(type => {
                            const rubsOfType = allRubriques.filter(r => r.type === type);
                            if (rubsOfType.length === 0) return null;

                            return (
                                <div key={type} style={{ marginBottom: '2rem' }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: typeColors[type],
                                        marginBottom: '1rem',
                                        paddingBottom: '0.5rem',
                                        borderBottom: `2px solid ${typeColors[type]}40`
                                    }}>
                                        {type === 'BASE' && '💰 BASE'}
                                        {type === 'GAIN' && '➕ GAINS'}
                                        {type === 'RETENUE' && '➖ RETENUES'}
                                        {type === 'COTISATION' && '🏢 COTISATIONS EMPLOYEUR'}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                        {rubsOfType.map((rubrique: any) => {
                                            const assigned = getAssignedRubrique(rubrique.id);
                                            const isAssigned = !!assigned;

                                            return (
                                                <div
                                                    key={rubrique.id}
                                                    style={{
                                                        border: isAssigned ? `2px solid ${typeColors[type]}` : '1px solid #e2e8f0',
                                                        borderRadius: '8px',
                                                        padding: '1rem',
                                                        backgroundColor: isAssigned ? `${typeColors[type]}10` : 'white',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>
                                                                {rubrique.nom}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                                                                {rubrique.code}
                                                            </div>
                                                        </div>
                                                        {isAssigned && (
                                                            <div style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                borderRadius: '50%',
                                                                backgroundColor: typeColors[type],
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white',
                                                                fontSize: '0.75rem'
                                                            }}>
                                                                ✓
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                                                        {rubrique.montantType === 'FIXE' && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                <DollarSign size={14} />
                                                                Fixe: {isAssigned && assigned.montantOverride !== null
                                                                    ? `${assigned.montantOverride} DA (personnalisé)`
                                                                    : `${rubrique.valeur || 0} DA`}
                                                            </div>
                                                        )}
                                                        {rubrique.montantType === 'POURCENTAGE' && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                <Percent size={14} />
                                                                {isAssigned && assigned.tauxOverride !== null
                                                                    ? `${assigned.tauxOverride}% (personnalisé)`
                                                                    : `${rubrique.valeur || 0}%`}
                                                            </div>
                                                        )}
                                                        {rubrique.montantType === 'FORMULE' && '📐 Calculé par formule'}
                                                        {rubrique.montantType === 'SAISIE' && '✏️ Saisie manuelle'}
                                                    </div>

                                                    {isAssigned && assigned && (
                                                        <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <Calendar size={12} />
                                                            Du {new Date(assigned.startDate).toLocaleDateString('fr-FR')}
                                                            {assigned.endDate && ` au ${new Date(assigned.endDate).toLocaleDateString('fr-FR')}`}
                                                        </div>
                                                    )}

                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => openAssignmentModal(rubrique)}
                                                            style={{
                                                                flex: 1,
                                                                padding: '0.5rem',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                backgroundColor: typeColors[type],
                                                                color: 'white',
                                                                fontWeight: 500,
                                                                fontSize: '0.8rem'
                                                            }}
                                                        >
                                                            {isAssigned ? 'Modifier' : 'Attribuer'}
                                                        </button>
                                                        {isAssigned && assigned && (
                                                            <button
                                                                onClick={() => handleRemove(assigned.id)}
                                                                style={{
                                                                    padding: '0.5rem',
                                                                    borderRadius: '6px',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    backgroundColor: '#fecaca',
                                                                    color: '#991b1b'
                                                                }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Assignment Modal */}
            {isModalOpen && selectedRubrique && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        width: '500px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>
                            Attribuer: {selectedRubrique.nom}
                        </h3>
                        <div style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            marginBottom: '1.5rem',
                            padding: '0.75rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '6px'
                        }}>
                            <div><strong>Code:</strong> {selectedRubrique.code}</div>
                            <div><strong>Type:</strong> {selectedRubrique.type}</div>
                            <div><strong>Mode de calcul:</strong> {selectedRubrique.montantType}</div>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Date de début *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Date de fin</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        style={inputStyle}
                                        placeholder="Optionnel"
                                    />
                                </div>
                            </div>

                            {selectedRubrique.montantType === 'FIXE' && (
                                <div>
                                    <label style={labelStyle}>
                                        Montant personnalisé (DA) - Défaut: {selectedRubrique.valeur || 0} DA
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.montantOverride || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            montantOverride: e.target.value ? Number(e.target.value) : undefined
                                        })}
                                        style={inputStyle}
                                        placeholder={`Laisser vide pour ${selectedRubrique.valeur || 0} DA`}
                                    />
                                </div>
                            )}

                            {selectedRubrique.montantType === 'POURCENTAGE' && (
                                <div>
                                    <label style={labelStyle}>
                                        Taux personnalisé (%) - Défaut: {selectedRubrique.valeur || 0}%
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.tauxOverride || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            tauxOverride: e.target.value ? Number(e.target.value) : undefined
                                        })}
                                        style={inputStyle}
                                        placeholder={`Laisser vide pour ${selectedRubrique.valeur || 0}%`}
                                    />
                                </div>
                            )}

                            {selectedRubrique.montantType === 'SAISIE' && (
                                <div>
                                    <label style={labelStyle}>Montant (DA) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.montantOverride || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            montantOverride: Number(e.target.value)
                                        })}
                                        style={inputStyle}
                                    />
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        ...btnStyle,
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        border: '1px solid #d1d5db'
                                    }}
                                >
                                    Annuler
                                </button>
                                <button type="submit" style={btnStyle}>
                                    <Plus size={18} /> Confirmer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
