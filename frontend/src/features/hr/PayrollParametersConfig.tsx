import { useState, useEffect } from 'react';
import { usePayrollConfigStore } from './payrollConfigStore';
import { Plus, Trash2, Settings, RefreshCw } from 'lucide-react';

export function PayrollParametersConfig() {
    const { parameters, fetchParameters, createParameter, deleteParameter, initializeDefaultParameters } = usePayrollConfigStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        nom: '',
        valeur: 0,
        description: '',
        startDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchParameters();
    }, [fetchParameters]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createParameter(formData);
            setIsModalOpen(false);
            setFormData({
                code: '',
                nom: '',
                valeur: 0,
                description: '',
                startDate: new Date().toISOString().split('T')[0]
            });
            alert('Paramètre créé avec succès');
        } catch (error) {
            alert('Erreur lors de la création du paramètre');
        }
    };

    const handleInitialize = async () => {
        if (confirm('Initialiser les paramètres par défaut ? Cela ne supprimera pas les paramètres existants.')) {
            try {
                await initializeDefaultParameters();
                alert('Paramètres par défaut initialisés');
            } catch (error) {
                alert('Erreur lors de l\'initialisation');
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Supprimer ce paramètre ?')) {
            try {
                await deleteParameter(id);
                alert('Paramètre supprimé');
            } catch (error) {
                alert('Erreur lors de la suppression');
            }
        }
    };

    // Group parameters by code to show history
    const groupedParams = parameters.reduce((acc, param) => {
        if (!acc[param.code]) acc[param.code] = [];
        acc[param.code].push(param);
        return acc;
    }, {} as Record<string, typeof parameters>);

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
        display: 'flex', alignItems: 'center', gap: '0.5rem'
    };
    const thStyle = { padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textAlign: 'left' as const };
    const tdStyle = { padding: '1rem 1.5rem', fontWeight: 500, color: '#1f2937' };

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Settings size={24} color="#059669" />
                        Paramètres de Paie
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        Configuration des valeurs globales (SNMG, plafonds, etc.)
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleInitialize} style={{ ...btnStyle, backgroundColor: '#3b82f6' }}>
                        <RefreshCw size={18} /> Initialiser défauts
                    </button>
                    <button onClick={() => setIsModalOpen(true)} style={btnStyle}>
                        <Plus size={18} /> Nouveau paramètre
                    </button>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={thStyle}>Code</th>
                            <th style={thStyle}>Nom</th>
                            <th style={thStyle}>Valeur</th>
                            <th style={thStyle}>Description</th>
                            <th style={thStyle}>Date début</th>
                            <th style={thStyle}>Date fin</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedParams).map(([_code, params]) => (
                            params.map((param, idx) => (
                                <tr key={param.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: idx === 0 ? 'white' : '#f9fafb' }}>
                                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600 }}>{param.code}</td>
                                    <td style={tdStyle}>{param.nom}</td>
                                    <td style={{ ...tdStyle, fontWeight: 700, color: '#059669' }}>
                                        {param.valeur.toLocaleString()} DA
                                    </td>
                                    <td style={{ ...tdStyle, fontSize: '0.8rem', color: '#6b7280' }}>{param.description || '-'}</td>
                                    <td style={tdStyle}>{new Date(param.startDate).toLocaleDateString('fr-FR')}</td>
                                    <td style={tdStyle}>
                                        {param.endDate ? new Date(param.endDate).toLocaleDateString('fr-FR') : (
                                            <span style={{ color: '#059669', fontWeight: 600 }}>En cours</span>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        <button onClick={() => handleDelete(param.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ))}
                        {parameters.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                                    Aucun paramètre configuré. Cliquez sur "Initialiser défauts" pour démarrer.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#111827' }}>Créer un paramètre</h3>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Code (Unique) *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    style={inputStyle}
                                    placeholder="Ex: SNMG, PLAFOND_CNAS"
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Nom *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    style={inputStyle}
                                    placeholder="Ex: Salaire Minimum Garanti"
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Valeur (DA) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.valeur}
                                    onChange={(e) => setFormData({ ...formData, valeur: Number(e.target.value) })}
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                    placeholder="Description du paramètre"
                                />
                            </div>

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

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ ...btnStyle, backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db' }}
                                >
                                    Annuler
                                </button>
                                <button type="submit" style={btnStyle}>
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
