import { useState, useEffect } from 'react';
import { useEmployeeStore } from './employeeStore';
import { Settings, Shield, Plus, Trash2, CalendarX } from 'lucide-react';

export default function HrConfiguration() {
    const [activeTab, setActiveTab] = useState<'positions' | 'reasons'>('positions');

    // Store
    const {
        positions, fetchPositions, createPosition,
        absenceReasons, fetchAbsenceReasons, createAbsenceReason, deleteAbsenceReason
    } = useEmployeeStore();

    // Local state for forms
    const [newPosition, setNewPosition] = useState('');
    const [newReason, setNewReason] = useState({ name: '', isAuthorized: true });

    useEffect(() => {
        if (activeTab === 'positions') fetchPositions();
        if (activeTab === 'reasons') fetchAbsenceReasons();
    }, [activeTab, fetchPositions, fetchAbsenceReasons]);

    const handleCreatePosition = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPosition.trim()) {
            await createPosition(newPosition);
            setNewPosition('');
        }
    };



    const handleCreateReason = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newReason.name.trim()) {
            await createAbsenceReason(newReason);
            setNewReason({ name: '', isAuthorized: true });
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#e0e7ff', borderRadius: '12px' }}>
                    <Settings size={32} color="#4338ca" />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e1b4b' }}>Configuration RH</h1>
                    <p style={{ color: '#6b7280' }}>Paramètres globaux du module Ressources Humaines.</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <button
                    onClick={() => setActiveTab('positions')}
                    style={{ ...tabStyle, borderBottom: activeTab === 'positions' ? '2px solid #4338ca' : '2px solid transparent', color: activeTab === 'positions' ? '#4338ca' : '#64748b' }}
                >
                    <Shield size={18} /> Postes
                </button>

                <button
                    onClick={() => setActiveTab('reasons')}
                    style={{ ...tabStyle, borderBottom: activeTab === 'reasons' ? '2px solid #4338ca' : '2px solid transparent', color: activeTab === 'reasons' ? '#4338ca' : '#64748b' }}
                >
                    <CalendarX size={18} /> Motifs d'absence
                </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>

                {/* POSITIONS TAB */}
                {activeTab === 'positions' && (
                    <div>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Ajouter un poste</h3>
                            <form onSubmit={handleCreatePosition} style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    type="text"
                                    value={newPosition}
                                    onChange={(e) => setNewPosition(e.target.value)}
                                    placeholder="Ex: Développeur Senior"
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                />
                                <button type="submit" disabled={!newPosition.trim()} style={btnStyle}>
                                    <Plus size={18} /> Ajouter
                                </button>
                            </form>
                        </div>
                        <div style={{ padding: '0' }}>
                            {positions.length === 0 ? <EmptyState /> : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
                                            <th style={thStyle}>Intitulé</th>
                                            <th style={thStyle}>Employés</th>
                                            <th style={thStyle}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {positions.map((pos: any) => (
                                            <tr key={pos.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={tdStyle}>{pos.title}</td>
                                                <td style={tdStyle}><span style={badgeStyle}>{pos.employees?.length || 0}</span></td>
                                                <td style={tdStyle}>-</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}



                {/* ABSENCE REASONS TAB */}
                {activeTab === 'reasons' && (
                    <div>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Ajouter un motif d'absence</h3>
                            <form onSubmit={handleCreateReason} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={newReason.name}
                                    onChange={(e) => setNewReason({ ...newReason, name: e.target.value })}
                                    placeholder="Ex: Maladie, Congé sans solde..."
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                />
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={newReason.isAuthorized}
                                        onChange={(e) => setNewReason({ ...newReason, isAuthorized: e.target.checked })}
                                        style={{ width: '1.25rem', height: '1.25rem' }}
                                    />
                                    <span style={{ fontWeight: 500 }}>Autorisé (Payé) ?</span>
                                </label>
                                <button type="submit" disabled={!newReason.name.trim()} style={btnStyle}>
                                    <Plus size={18} /> Ajouter
                                </button>
                            </form>
                        </div>
                        <div style={{ padding: '0' }}>
                            {absenceReasons.length === 0 ? <EmptyState text="Aucun motif configuré." /> : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
                                            <th style={thStyle}>Motif</th>
                                            <th style={thStyle}>Statut</th>
                                            <th style={thStyle}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {absenceReasons.map((reason: any) => (
                                            <tr key={reason.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={tdStyle}>{reason.name}</td>
                                                <td style={tdStyle}>
                                                    {reason.isAuthorized ?
                                                        <span style={{ ...badgeStyle, backgroundColor: '#dcfce7', color: '#166534' }}>Autorisé</span> :
                                                        <span style={{ ...badgeStyle, backgroundColor: '#fee2e2', color: '#991b1b' }}>Non Autorisé</span>
                                                    }
                                                </td>
                                                <td style={tdStyle}>
                                                    <button onClick={() => deleteAbsenceReason(reason.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

const tabStyle: any = {
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    background: 'none', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '0.5rem'
};
const thStyle = { padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.875rem' };
const tdStyle = { padding: '1rem 1.5rem', fontWeight: 500, color: '#1f2937' };
const badgeStyle = { backgroundColor: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 };
const btnStyle: any = {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4338ca',
    color: 'white',
    borderRadius: '8px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '0.5rem'
};
const EmptyState = ({ text = "Aucune donnée." }: { text?: string }) => (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>{text}</div>
);
