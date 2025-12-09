import { useState, useEffect } from 'react';
import { useEmployeeStore } from './employeeStore';
import { usePayrollConfigStore } from './payrollConfigStore';
import { Users, Check, DollarSign, Percent, List } from 'lucide-react';

export function BulkRubriqueAssignment() {
    const { employees, fetchEmployees } = useEmployeeStore();
    const { assignRubriqueToEmployee } = usePayrollConfigStore();
    const [allRubriques, setAllRubriques] = useState<any[]>([]);
    const [selectedRubrique, setSelectedRubrique] = useState<any>(null);
    const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
    const [formData, setFormData] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        montantOverride: undefined as number | undefined,
        tauxOverride: undefined as number | undefined
    });
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        fetchEmployees();
        fetchAllRubriques();
    }, [fetchEmployees]);

    const fetchAllRubriques = async () => {
        try {
            const response = await fetch('http://localhost:3000/hr/rubriques');
            const data = await response.json();
            setAllRubriques(data.filter((r: any) => r.isActive));
        } catch (error) {
            console.error('Error fetching rubriques:', error);
        }
    };

    const toggleEmployee = (empId: string) => {
        const newSet = new Set(selectedEmployees);
        if (newSet.has(empId)) {
            newSet.delete(empId);
        } else {
            newSet.add(empId);
        }
        setSelectedEmployees(newSet);
    };

    const toggleAll = () => {
        if (selectedEmployees.size === employees.length) {
            setSelectedEmployees(new Set());
        } else {
            setSelectedEmployees(new Set(employees.map(e => e.id)));
        }
    };

    const handleBulkAssign = async () => {
        if (!selectedRubrique || selectedEmployees.size === 0) {
            alert('Veuillez sélectionner une rubrique et au moins un employé');
            return;
        }

        setIsAssigning(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            for (const empId of Array.from(selectedEmployees)) {
                try {
                    await assignRubriqueToEmployee({
                        employeeId: empId,
                        rubriqueId: selectedRubrique.id,
                        startDate: formData.startDate,
                        endDate: formData.endDate || undefined,
                        montantOverride: formData.montantOverride,
                        tauxOverride: formData.tauxOverride
                    });
                    successCount++;
                } catch (error) {
                    console.error(`Error assigning to employee ${empId}:`, error);
                    errorCount++;
                }
            }

            alert(`Attribution terminée!\n✓ ${successCount} réussies\n${errorCount > 0 ? `✗ ${errorCount} échecs` : ''}`);

            // Reset form
            setSelectedEmployees(new Set());
            setSelectedRubrique(null);
            setFormData({
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                montantOverride: undefined,
                tauxOverride: undefined
            });
        } finally {
            setIsAssigning(false);
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
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
            {/* Rubrique Selection */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', height: 'fit-content' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <List size={18} /> Rubriques
                </div>
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {['BASE', 'GAIN', 'RETENUE', 'COTISATION'].map(type => {
                        const rubsOfType = allRubriques.filter(r => r.type === type);
                        if (rubsOfType.length === 0) return null;

                        return (
                            <div key={type}>
                                <div style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: typeColors[type],
                                    backgroundColor: `${typeColors[type]}10`,
                                    borderBottom: '1px solid #f3f4f6'
                                }}>
                                    {type}
                                </div>
                                {rubsOfType.map((rub: any) => (
                                    <div
                                        key={rub.id}
                                        onClick={() => {
                                            setSelectedRubrique(rub);
                                            setFormData({
                                                startDate: new Date().toISOString().split('T')[0],
                                                endDate: '',
                                                montantOverride: rub.montantType === 'FIXE' ? rub.valeur : undefined,
                                                tauxOverride: rub.montantType === 'POURCENTAGE' ? rub.valeur : undefined
                                            });
                                        }}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            cursor: 'pointer',
                                            backgroundColor: selectedRubrique?.id === rub.id ? `${typeColors[type]}15` : 'white',
                                            borderLeft: selectedRubrique?.id === rub.id ? `3px solid ${typeColors[type]}` : '3px solid transparent',
                                            borderBottom: '1px solid #f9fafb',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1f2937', marginBottom: '0.25rem' }}>
                                            {rub.nom}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                                            {rub.code}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                            {rub.montantType === 'FIXE' && `${rub.valeur || 0} DA`}
                                            {rub.montantType === 'POURCENTAGE' && `${rub.valeur || 0}%`}
                                            {rub.montantType === 'FORMULE' && 'Formule'}
                                            {rub.montantType === 'SAISIE' && 'Saisie'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Assignment Panel */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
                {!selectedRubrique ? (
                    <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexDirection: 'column', gap: '1rem' }}>
                        <List size={48} color="#d1d5db" />
                        <div>Sélectionnez une rubrique à attribuer</div>
                    </div>
                ) : (
                    <div>
                        {/* Selected Rubrique Info */}
                        <div style={{
                            padding: '1rem',
                            backgroundColor: `${typeColors[selectedRubrique.type]}10`,
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            border: `2px solid ${typeColors[selectedRubrique.type]}`
                        }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
                                {selectedRubrique.nom}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <div><strong>Code:</strong> {selectedRubrique.code}</div>
                                <div><strong>Type:</strong> {selectedRubrique.type}</div>
                                <div><strong>Calcul:</strong> {selectedRubrique.montantType}</div>
                                {selectedRubrique.montantType === 'FIXE' && (
                                    <div><strong>Défaut:</strong> {selectedRubrique.valeur || 0} DA</div>
                                )}
                                {selectedRubrique.montantType === 'POURCENTAGE' && (
                                    <div><strong>Défaut:</strong> {selectedRubrique.valeur || 0}%</div>
                                )}
                            </div>
                        </div>

                        {/* Configuration Form */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>
                                Configuration de l'attribution
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>
                                        <DollarSign size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
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
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>
                                        <Percent size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
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
                                <div style={{ marginBottom: '1rem' }}>
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
                        </div>

                        {/* Employee Selection */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                                    <Users size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                    Sélectionner les employés ({selectedEmployees.size}/{employees.length})
                                </h4>
                                <button
                                    onClick={toggleAll}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.75rem',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    {selectedEmployees.size === employees.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                                </button>
                            </div>

                            <div style={{
                                maxHeight: '300px',
                                overflowY: 'auto',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                marginBottom: '1.5rem'
                            }}>
                                {employees.map((emp: any) => {
                                    const isSelected = selectedEmployees.has(emp.id);
                                    return (
                                        <div
                                            key={emp.id}
                                            onClick={() => toggleEmployee(emp.id)}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                cursor: 'pointer',
                                                backgroundColor: isSelected ? '#f0fdf4' : 'white',
                                                borderBottom: '1px solid #f3f4f6',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '4px',
                                                border: isSelected ? '2px solid #059669' : '2px solid #d1d5db',
                                                backgroundColor: isSelected ? '#059669' : 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                flexShrink: 0
                                            }}>
                                                {isSelected && <Check size={14} />}
                                            </div>
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
                                                color: '#4b5563',
                                                flexShrink: 0
                                            }}>
                                                {emp.firstName[0]}{emp.lastName[0]}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1f2937' }}>
                                                    {emp.firstName} {emp.lastName}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                    {emp.position?.title || 'Sans poste'} • {emp.department?.name || 'Sans département'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleBulkAssign}
                                disabled={selectedEmployees.size === 0 || isAssigning}
                                style={{
                                    ...btnStyle,
                                    width: '100%',
                                    justifyContent: 'center',
                                    opacity: selectedEmployees.size === 0 || isAssigning ? 0.5 : 1,
                                    cursor: selectedEmployees.size === 0 || isAssigning ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isAssigning ? (
                                    <>Attribution en cours...</>
                                ) : (
                                    <>
                                        <Check size={18} />
                                        Attribuer à {selectedEmployees.size} employé{selectedEmployees.size > 1 ? 's' : ''}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
