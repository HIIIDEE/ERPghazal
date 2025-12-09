import { useState, useEffect } from 'react';
import { usePayrollConfigStore } from './payrollConfigStore';
import { Plus, Trash2, RefreshCw, Calculator, TrendingUp } from 'lucide-react';

export function TaxBracketsConfig() {
    const { taxBrackets, fetchTaxBrackets, createTaxBracket, deleteTaxBracket, initializeDefaultTaxBrackets } = usePayrollConfigStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        minAmount: 0,
        maxAmount: undefined as number | undefined,
        rate: 0,
        fixedAmount: 0,
        ordre: 1,
        startDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchTaxBrackets();
    }, [fetchTaxBrackets]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTaxBracket(formData as any);
            setIsModalOpen(false);
            setFormData({
                nom: '',
                minAmount: 0,
                maxAmount: undefined,
                rate: 0,
                fixedAmount: 0,
                ordre: taxBrackets.length + 1,
                startDate: new Date().toISOString().split('T')[0]
            });
            alert('Tranche IRG créée avec succès');
        } catch (error) {
            alert('Erreur lors de la création de la tranche');
        }
    };

    const handleInitialize = async () => {
        if (confirm('Initialiser le barème IRG 2024 par défaut ? Cela supprimera toutes les tranches existantes.')) {
            try {
                await initializeDefaultTaxBrackets();
                alert('Barème IRG initialisé');
            } catch (error) {
                alert('Erreur lors de l\'initialisation');
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Supprimer cette tranche IRG ?')) {
            try {
                await deleteTaxBracket(id);
                alert('Tranche supprimée');
            } catch (error) {
                alert('Erreur lors de la suppression');
            }
        }
    };

    // Get active brackets (most recent startDate without endDate)
    const activeBrackets = taxBrackets
        .filter(b => !b.endDate)
        .sort((a, b) => a.ordre - b.ordre);

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
                        <TrendingUp size={24} color="#059669" />
                        Barème IRG (Impôt sur le Revenu)
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        Configuration des tranches d'imposition progressives
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleInitialize} style={{ ...btnStyle, backgroundColor: '#3b82f6' }}>
                        <RefreshCw size={18} /> Barème 2024
                    </button>
                    <button onClick={() => setIsModalOpen(true)} style={btnStyle}>
                        <Plus size={18} /> Nouvelle tranche
                    </button>
                </div>
            </div>

            {/* Visual representation */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calculator size={16} /> Barème actuel
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activeBrackets.map((bracket, idx) => (
                        <div key={bracket.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                backgroundColor: `hsl(${160 - idx * 30}, 70%, 95%)`,
                                border: `2px solid hsl(${160 - idx * 30}, 70%, 50%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                color: `hsl(${160 - idx * 30}, 70%, 40%)`
                            }}>
                                {idx + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, color: '#111827' }}>{bracket.nom}</div>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    {bracket.minAmount.toLocaleString()} DA - {bracket.maxAmount ? `${bracket.maxAmount.toLocaleString()} DA` : '∞'}
                                </div>
                            </div>
                            <div style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: `hsl(${160 - idx * 30}, 70%, 95%)`,
                                borderRadius: '8px',
                                fontWeight: 700,
                                color: `hsl(${160 - idx * 30}, 70%, 40%)`
                            }}>
                                {bracket.rate}%
                            </div>
                            {bracket.fixedAmount > 0 && (
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    + {bracket.fixedAmount.toLocaleString()} DA
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={thStyle}>Ordre</th>
                            <th style={thStyle}>Nom</th>
                            <th style={thStyle}>Min (DA)</th>
                            <th style={thStyle}>Max (DA)</th>
                            <th style={thStyle}>Taux (%)</th>
                            <th style={thStyle}>Base fixe (DA)</th>
                            <th style={thStyle}>Période</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {taxBrackets.sort((a, b) => {
                            const dateCompare = new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
                            return dateCompare !== 0 ? dateCompare : a.ordre - b.ordre;
                        }).map((bracket) => (
                            <tr key={bracket.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: bracket.endDate ? '#f9fafb' : 'white' }}>
                                <td style={tdStyle}>{bracket.ordre}</td>
                                <td style={tdStyle}>{bracket.nom}</td>
                                <td style={tdStyle}>{bracket.minAmount.toLocaleString()}</td>
                                <td style={tdStyle}>{bracket.maxAmount ? bracket.maxAmount.toLocaleString() : '∞'}</td>
                                <td style={{ ...tdStyle, fontWeight: 700, color: '#059669' }}>{bracket.rate}%</td>
                                <td style={tdStyle}>{bracket.fixedAmount.toLocaleString()}</td>
                                <td style={{ ...tdStyle, fontSize: '0.8rem' }}>
                                    <div>{new Date(bracket.startDate).toLocaleDateString('fr-FR')}</div>
                                    <div style={{ color: bracket.endDate ? '#ef4444' : '#059669', fontWeight: 600 }}>
                                        {bracket.endDate ? new Date(bracket.endDate).toLocaleDateString('fr-FR') : 'En cours'}
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <button onClick={() => handleDelete(bracket.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {taxBrackets.length === 0 && (
                            <tr>
                                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                                    Aucune tranche IRG configurée. Cliquez sur "Barème 2024" pour initialiser.
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
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#111827' }}>Créer une tranche IRG</h3>

                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={labelStyle}>Nom *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    style={inputStyle}
                                    placeholder="Ex: Tranche 1 (20%)"
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Montant minimum (DA) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.minAmount}
                                    onChange={(e) => setFormData({ ...formData, minAmount: Number(e.target.value) })}
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Montant maximum (DA)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.maxAmount || ''}
                                    onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value ? Number(e.target.value) : undefined })}
                                    style={inputStyle}
                                    placeholder="Vide = illimité"
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Taux (%) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.rate}
                                    onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Montant fixe de base (DA)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.fixedAmount}
                                    onChange={(e) => setFormData({ ...formData, fixedAmount: Number(e.target.value) })}
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Ordre *</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.ordre}
                                    onChange={(e) => setFormData({ ...formData, ordre: Number(e.target.value) })}
                                    style={inputStyle}
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

                            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
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
