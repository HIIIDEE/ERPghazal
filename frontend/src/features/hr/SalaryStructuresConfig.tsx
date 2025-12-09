import { useState, useEffect } from 'react';
import { useEmployeeStore, type SalaryStructure } from './employeeStore';
import { Plus, Trash2, Edit2, List, X } from 'lucide-react';
import { api } from '../../lib/api';

export function SalaryStructuresConfig() {
    const {
        salaryStructures, fetchSalaryStructures, createSalaryStructure, updateSalaryStructure, deleteSalaryStructure,
        rubriques, fetchRubriques, addRubriqueToStructure, removeRubriqueFromStructure
    } = useEmployeeStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null);
    const [detailedStructure, setDetailedStructure] = useState<SalaryStructure | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });

    // For adding rubrique to structure
    const [selectedRubriqueId, setSelectedRubriqueId] = useState<string>('');
    const [rubriqueOrder, setRubriqueOrder] = useState<number>(0);

    useEffect(() => {
        fetchSalaryStructures();
        fetchRubriques();
    }, [fetchSalaryStructures, fetchRubriques]);

    const handleOpenModal = (structure?: SalaryStructure) => {
        if (structure) {
            setEditingStructure(structure);
            setFormData({
                name: structure.name,
                description: structure.description || '',
                isActive: structure.isActive
            });
        } else {
            setEditingStructure(null);
            setFormData({
                name: '',
                description: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleOpenDetail = async (structure: SalaryStructure) => {
        // Fetch full details including rubriques
        try {
            const res = await api.get(`/hr/salary-structures/${structure.id}`);
            setDetailedStructure(res.data);
            setIsDetailModalOpen(true);
        } catch (error) {
            alert("Erreur lors du chargement de la structure");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStructure) {
                await updateSalaryStructure(editingStructure.id, formData);
            } else {
                await createSalaryStructure(formData);
            }
            setIsModalOpen(false);
            setFormData({ name: '', description: '', isActive: true });
            setEditingStructure(null);
        } catch (error) {
            alert('Erreur lors de la sauvegarde');
        }
    };

    const handleAddRubrique = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!detailedStructure || !selectedRubriqueId) return;

        try {
            await addRubriqueToStructure(detailedStructure.id, Number(selectedRubriqueId), rubriqueOrder);
            // Refresh detail
            const res = await api.get(`/hr/salary-structures/${detailedStructure.id}`);
            setDetailedStructure(res.data);
            setSelectedRubriqueId('');
            setRubriqueOrder(prev => prev + 10);
            fetchSalaryStructures(); // Update counts in list
        } catch (error) {
            alert('Erreur lors de l\'ajout de la rubrique');
        }
    }

    const handleRemoveRubrique = async (rubriqueId: number) => {
        if (!detailedStructure) return;
        if (!confirm('Retirer cette rubrique de la structure ?')) return;

        try {
            await removeRubriqueFromStructure(detailedStructure.id, rubriqueId);
            // Refresh detail
            const res = await api.get(`/hr/salary-structures/${detailedStructure.id}`);
            setDetailedStructure(res.data);
            fetchSalaryStructures(); // Update counts in list
        } catch (error) {
            alert("Erreur lors de la suppression");
        }
    }

    const btnStyle: any = {
        padding: '0.5rem 1rem',
        backgroundColor: '#059669',
        color: 'white',
        borderRadius: '6px',
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        fontSize: '0.875rem'
    };

    const inputStyle = { width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem' };

    // Filter out rubriques already in structure
    const availableRubriques = rubriques.filter(r =>
        !detailedStructure?.rubriques?.some(sr => sr.rubrique.id === r.id)
    );

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>Structures Salariales</h3>
                <button onClick={() => handleOpenModal()} style={btnStyle}>
                    <Plus size={18} /> Nouvelle Structure
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {salaryStructures.map(structure => (
                    <div key={structure.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div>
                                <h4 style={{ fontWeight: 600, color: '#1f2937', fontSize: '1.1rem' }}>{structure.name}</h4>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                    {structure.isActive ? <span style={{ color: '#059669' }}>Actif</span> : <span style={{ color: '#9ca3af' }}>Inactif</span>}
                                    {' • '}
                                    {structure._count?.rubriques || 0} règles
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleOpenDetail(structure)} style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }} title="Gérer les règles">
                                    <List size={18} />
                                </button>
                                <button onClick={() => handleOpenModal(structure)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }} title="Modifier">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => { if (confirm('Supprimer ?')) deleteSalaryStructure(structure.id); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }} title="Supprimer">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        {structure.description && (
                            <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.5' }}>
                                {structure.description}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Config Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#111827' }}>
                            {editingStructure ? 'Modifier Structure' : 'Nouvelle Structure'}
                        </h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Nom de la structure</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={inputStyle}
                                    placeholder="Ex: Structure Cadre Supérieur"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ ...inputStyle, minHeight: '80px' }}
                                    placeholder="Description optionnelle..."
                                />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        style={{ width: '1rem', height: '1rem' }}
                                    />
                                    <span style={{ fontSize: '0.875rem' }}>Structure active</span>
                                </label>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ ...btnStyle, backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db' }}>Annuler</button>
                                <button type="submit" style={btnStyle}>Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details/Rubriques Modal */}
            {isDetailModalOpen && detailedStructure && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>Règles Salariales</h3>
                                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>{detailedStructure.name}</div>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: '#f9fafb' }}>
                            {/* Add Rubrique Form */}
                            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e5e7eb' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#374151' }}>Ajouter une règle</h4>
                                <form onSubmit={handleAddRubrique} style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#4b5563' }}>Rubrique</label>
                                        <select
                                            value={selectedRubriqueId}
                                            onChange={e => setSelectedRubriqueId(e.target.value)}
                                            style={inputStyle}
                                            required
                                        >
                                            <option value="">Sélectionner une rubrique...</option>
                                            {availableRubriques.map(r => (
                                                <option key={r.id} value={r.id}>{r.code} - {r.nom}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ width: '100px' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#4b5563' }}>Ordre</label>
                                        <input
                                            type="number"
                                            value={rubriqueOrder}
                                            onChange={e => setRubriqueOrder(Number(e.target.value))}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <button type="submit" disabled={!selectedRubriqueId} style={btnStyle}>
                                        <Plus size={16} /> Ajouter
                                    </button>
                                </form>
                            </div>

                            {/* List */}
                            <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                                            <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#4b5563' }}>Ordre</th>
                                            <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#4b5563' }}>Code</th>
                                            <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#4b5563' }}>Nom</th>
                                            <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#4b5563' }}>Type</th>
                                            <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#4b5563' }}>Calcul</th>
                                            <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#4b5563', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detailedStructure.rubriques?.map(({ rubrique, ordre }) => (
                                            <tr key={rubrique.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '0.75rem 1rem', color: '#374151' }}>{ordre}</td>
                                                <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 600, color: '#111827' }}>{rubrique.code}</td>
                                                <td style={{ padding: '0.75rem 1rem', color: '#374151' }}>{rubrique.nom}</td>
                                                <td style={{ padding: '0.75rem 1rem' }}>
                                                    <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '999px', backgroundColor: rubrique.type === 'GAIN' ? '#ecfdf5' : '#eff6ff', color: rubrique.type === 'GAIN' ? '#065f46' : '#1e40af' }}>
                                                        {rubrique.type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                                    {rubrique.montantType} {rubrique.montantType === 'FIXE' ? `(${rubrique.valeur})` : ''}
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                                    <button onClick={() => handleRemoveRubrique(rubrique.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!detailedStructure.rubriques || detailedStructure.rubriques.length === 0) && (
                                            <tr>
                                                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                                                    Aucune règle associée.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
