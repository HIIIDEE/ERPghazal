import { useState, useEffect } from 'react';
import { useEmployeeStore, type Rubrique } from './employeeStore';
import { Plus, Trash2, Check, X, Calculator, Edit2 } from 'lucide-react';

export function RubriquesConfiguration() {
    const { rubriques, fetchRubriques, createRubrique, updateRubrique, deleteRubrique } = useEmployeeStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRubrique, setEditingRubrique] = useState<Rubrique | null>(null);

    const [formData, setFormData] = useState<Partial<Rubrique>>({
        code: '',
        nom: '',
        type: 'GAIN',
        montantType: 'FIXE',
        valeur: 0,
        formule: '',
        soumisCnas: false,
        soumisIrg: false,
        soumisChargeEmployeur: false,
        ordreAffichage: 0
    });

    useEffect(() => {
        fetchRubriques();
    }, [fetchRubriques]);

    const handleOpenModal = (rubrique?: Rubrique) => {
        if (rubrique) {
            setEditingRubrique(rubrique);
            setFormData({
                code: rubrique.code,
                nom: rubrique.nom,
                type: rubrique.type,
                montantType: rubrique.montantType,
                valeur: rubrique.valeur,
                formule: rubrique.formule,
                soumisCnas: rubrique.soumisCnas,
                soumisIrg: rubrique.soumisIrg,
                soumisChargeEmployeur: rubrique.soumisChargeEmployeur,
                ordreAffichage: rubrique.ordreAffichage
            });
        } else {
            setEditingRubrique(null);
            setFormData({
                code: '',
                nom: '',
                type: 'GAIN',
                montantType: 'FIXE',
                valeur: 0,
                formule: '',
                soumisCnas: false,
                soumisIrg: false,
                soumisChargeEmployeur: false,
                ordreAffichage: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRubrique) {
                await updateRubrique(editingRubrique.id, formData);
                alert('Rubrique modifiée avec succès');
            } else {
                await createRubrique(formData);
                alert('Rubrique créée avec succès');
            }
            setIsModalOpen(false);
            setEditingRubrique(null);
            setFormData({
                code: '',
                nom: '',
                type: 'GAIN',
                montantType: 'FIXE',
                valeur: 0,
                formule: '',
                soumisCnas: false,
                soumisIrg: false,
                soumisChargeEmployeur: false,
                ordreAffichage: 0
            });
        } catch (error) {
            alert(editingRubrique ? 'Erreur lors de la modification de la rubrique' : 'Erreur lors de la création de la rubrique');
        }
    };

    const labelStyle = { display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.25rem' };
    const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem' };
    const checkboxStyle = { marginRight: '0.5rem', width: '1rem', height: '1rem', cursor: 'pointer' };
    const btnStyle: any = {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#059669',
        color: 'white',
        borderRadius: '8px',
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        height: 'fit-content'
    };
    const thStyle = { padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textAlign: 'left' as const };
    const tdStyle = { padding: '1rem 1.5rem', fontWeight: 500, color: '#1f2937' };

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>Configuration des Rubriques</h3>
                <button onClick={() => handleOpenModal()} style={btnStyle}>
                    <Plus size={18} /> Nouvelle Rubrique
                </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={thStyle}>Ordre</th>
                            <th style={thStyle}>Code</th>
                            <th style={thStyle}>Nom</th>
                            <th style={thStyle}>Type</th>
                            <th style={thStyle}>Calcul</th>
                            <th style={thStyle}>Valeur/Formule</th>
                            <th style={thStyle}>CNAS</th>
                            <th style={thStyle}>IRG</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rubriques.map((rubrique) => (
                            <tr key={rubrique.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={tdStyle}>{rubrique.ordreAffichage || '-'}</td>
                                <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600 }}>{rubrique.code}</td>
                                <td style={tdStyle}>{rubrique.nom}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                                        backgroundColor: rubrique.type === 'GAIN' ? '#ecfdf5' : rubrique.type === 'RETENUE' ? '#fef2f2' : '#eff6ff',
                                        color: rubrique.type === 'GAIN' ? '#047857' : rubrique.type === 'RETENUE' ? '#b91c1c' : '#1d4ed8'
                                    }}>
                                        {rubrique.type}
                                    </span>
                                </td>
                                <td style={tdStyle}>{rubrique.montantType}</td>
                                <td style={tdStyle}>
                                    {rubrique.montantType === 'FORMULE' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563', fontStyle: 'italic', fontSize: '0.8rem' }}>
                                            <Calculator size={14} /> {rubrique.formule?.substring(0, 20)}...
                                        </div>
                                    ) : (
                                        rubrique.valeur
                                    )}
                                </td>
                                <td style={tdStyle}>{rubrique.soumisCnas ? <Check size={16} color="#059669" /> : <X size={16} color="#ef4444" />}</td>
                                <td style={tdStyle}>{rubrique.soumisIrg ? <Check size={16} color="#059669" /> : <X size={16} color="#ef4444" />}</td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleOpenModal(rubrique)} style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer' }} title="Modifier">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => deleteRubrique(rubrique.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }} title="Supprimer">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {rubriques.length === 0 && (
                            <tr>
                                <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                                    Aucune rubrique configurée.
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
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#111827' }}>
                            {editingRubrique ? 'Modifier la Rubrique' : 'Créer une Rubrique'}
                        </h3>

                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Code (Unique)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    style={inputStyle}
                                    placeholder="Ex: R001"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Nom / Libellé</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    style={inputStyle}
                                    placeholder="Ex: Salaire de base"
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Type de Rubrique</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    style={inputStyle}
                                >
                                    <option value="GAIN">Gain (+)</option>
                                    <option value="RETENUE">Retenue (-)</option>
                                    <option value="COTISATION">Cotisation</option>
                                    <option value="BASE">Base (Info)</option>
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>Type de Montant</label>
                                <select
                                    value={formData.montantType}
                                    onChange={(e) => setFormData({ ...formData, montantType: e.target.value as any })}
                                    style={inputStyle}
                                >
                                    <option value="FIXE">Fixe</option>
                                    <option value="POURCENTAGE">Pourcentage (%)</option>
                                    <option value="FORMULE">Formule (Script)</option>
                                    <option value="SAISIE">Saisie Manuelle</option>
                                </select>
                            </div>

                            {/* Conditional Fields based on Montant Type */}
                            {formData.montantType === 'FIXE' && (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>Montant (DA)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.valeur}
                                        onChange={(e) => setFormData({ ...formData, valeur: Number(e.target.value) })}
                                        style={inputStyle}
                                    />
                                </div>
                            )}

                            {formData.montantType === 'POURCENTAGE' && (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>Pourcentage (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.valeur}
                                        onChange={(e) => setFormData({ ...formData, valeur: Number(e.target.value) })}
                                        style={inputStyle}
                                    />
                                </div>
                            )}

                            {formData.montantType === 'FORMULE' && (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>Formule de Calcul</label>
                                    <textarea
                                        value={formData.formule}
                                        onChange={(e) => setFormData({ ...formData, formule: e.target.value })}
                                        style={{ ...inputStyle, fontFamily: 'monospace', minHeight: '80px', resize: 'vertical' }}
                                        placeholder="Ex: SALAIRE_BASE * 0.1"
                                    />
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '0.5rem', borderRadius: '4px' }}>
                                        <strong>Variables disponibles :</strong> SALAIRE_BASE, SALAIRE_BRUT, SALAIRE_IMPOSABLE, SNMG, PLAFOND_CNAS, POINT_INDICE. <br />
                                        <em>Vous pouvez aussi utiliser les codes d'autres rubriques ou paramètres créés.</em>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label style={labelStyle}>Ordre d'affichage</label>
                                <input
                                    type="number"
                                    value={formData.ordreAffichage}
                                    onChange={(e) => setFormData({ ...formData, ordreAffichage: Number(e.target.value) })}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '2rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.soumisCnas}
                                        onChange={(e) => setFormData({ ...formData, soumisCnas: e.target.checked })}
                                        style={checkboxStyle}
                                    />
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Soumis CNAS</span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.soumisIrg}
                                        onChange={(e) => setFormData({ ...formData, soumisIrg: e.target.checked })}
                                        style={checkboxStyle}
                                    />
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Soumis IRG</span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.soumisChargeEmployeur}
                                        onChange={(e) => setFormData({ ...formData, soumisChargeEmployeur: e.target.checked })}
                                        style={checkboxStyle}
                                    />
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Ch. Employeur</span>
                                </label>
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
                                    {editingRubrique ? 'Modifier la rubrique' : 'Créer la rubrique'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )
            }
        </div >
    );
}
