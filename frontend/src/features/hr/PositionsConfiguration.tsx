import { useEffect, useState } from 'react';
import { useEmployeeStore } from './employeeStore';
import { Plus, Trash2, Shield } from 'lucide-react';

export default function PositionsConfiguration() {
    const { positions, fetchPositions, createPosition } = useEmployeeStore();
    const [newPosition, setNewPosition] = useState('');

    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPosition.trim()) {
            await createPosition(newPosition);
            setNewPosition('');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#e0e7ff', borderRadius: '12px' }}>
                    <Shield size={32} color="#4338ca" />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e1b4b' }}>Configuration des Postes</h1>
                    <p style={{ color: '#6b7280' }}>Gérez les intitulés de postes disponibles dans l'entreprise.</p>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            value={newPosition}
                            onChange={(e) => setNewPosition(e.target.value)}
                            placeholder="Nouvel intitulé de poste (ex: Développeur Senior)"
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                        />
                        <button
                            type="submit"
                            disabled={!newPosition.trim()}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#4338ca',
                                color: 'white',
                                borderRadius: '8px',
                                fontWeight: 600,
                                border: 'none',
                                cursor: newPosition.trim() ? 'pointer' : 'not-allowed',
                                opacity: newPosition.trim() ? 1 : 0.7,
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <Plus size={18} /> Ajouter
                        </button>
                    </form>
                </div>

                <div style={{ padding: '0' }}>
                    {positions.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                            Aucun poste configuré. Ajoutez-en un ci-dessus.
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Intitulé du Poste</th>
                                    <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', width: '100px' }}>Employés</th>
                                    <th style={{ padding: '1rem 1.5rem', width: '80px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {positions.map((pos: any) => (
                                    <tr key={pos.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: '#1f2937' }}>{pos.title}</td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#6b7280' }}>
                                            <span style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                {pos.employees?.length || 0}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
