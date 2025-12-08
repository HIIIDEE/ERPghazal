import { useState } from 'react';
import { useEmployeeStore } from './employeeStore';
import { X, Briefcase, Check, Plus } from 'lucide-react';

interface PositionHistoryModalProps {
    employee: any;
    onClose: () => void;
}

export function PositionHistoryModal({ employee, onClose }: PositionHistoryModalProps) {
    const { positions, fetchPositions, assignPosition } = useEmployeeStore();
    const [view, setView] = useState<'list' | 'assign'>('list');
    const [selectedPosition, setSelectedPosition] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    // Ensure positions are loaded
    useState(() => {
        fetchPositions();
    });

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        await assignPosition(employee.id, selectedPosition, startDate);
        setView('list');
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Briefcase size={20} /> Historique des Postes
                    </h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {view === 'list' ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                                <button
                                    onClick={() => setView('assign')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                >
                                    <Plus size={16} /> Affecter un nouveau poste
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Current Position */}
                                <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369a1', textTransform: 'uppercase' }}>Poste Actuel</span>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                        <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>{employee.position?.title || 'Aucun poste'}</span>
                                        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Depuis le {new Date().toLocaleDateString()}</span>
                                        {/* Note: In real app, we need the start date of current position in Employee model or fetch it separately */}
                                    </div>
                                </div>

                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginTop: '1rem', marginBottom: '0.5rem' }}>Historique</h4>
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                                    {employee.positionHistory?.length > 0 ? (
                                        employee.positionHistory.map((history: any, index: number) => (
                                            <div key={history.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: index < employee.positionHistory.length - 1 ? '1px solid #f1f5f9' : 'none', backgroundColor: '#fff' }}>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{history.position.title}</div>
                                                    <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Ancien poste</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.875rem', color: '#334155' }}>
                                                        {new Date(history.startDate).toLocaleDateString()} - {history.endDate ? new Date(history.endDate).toLocaleDateString() : 'Présent'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '1rem', textAlign: 'center', color: '#cbd5e1', fontStyle: 'italic' }}>Aucun historique disponible</div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleAssign}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem', color: '#1e293b' }}>Affecter un nouveau poste</h4>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Nouvel Intitulé de Poste</label>
                                <select
                                    required
                                    value={selectedPosition}
                                    onChange={e => setSelectedPosition(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '1rem' }}
                                >
                                    <option value="">Sélectionner un poste...</option>
                                    {positions.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Date de début</label>
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '1rem' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" onClick={() => setView('list')} style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer' }}>Annuler</button>
                                <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Check size={16} /> Confirmer l'affectation
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
