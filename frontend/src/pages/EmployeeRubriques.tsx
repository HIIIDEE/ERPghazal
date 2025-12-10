import React, { useState, useEffect } from 'react';
import { useEmployeeStore, type Rubrique } from '../features/hr/employeeStore';
import { Plus, Trash2, Edit2, ArrowLeft, Search, DollarSign, X, Info, CheckCircle2 } from 'lucide-react';

export default function EmployeeRubriques() {
    const {
        employees,
        fetchEmployees,
        rubriques,
        fetchRubriques,
        assignMonthlyVariable,
        deleteEmployeeRubrique
    } = useEmployeeStore();

    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [employeeDetails, setEmployeeDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRubrique, setEditingRubrique] = useState<any>(null);
    const [selectedRubriqueId, setSelectedRubriqueId] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState<number>(0);

    useEffect(() => {
        fetchEmployees();
        fetchRubriques();
    }, [fetchEmployees, fetchRubriques]);

    // Fetch employee details with contracts and rubriques
    const loadEmployeeDetails = async (employeeId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/hr/employees/${employeeId}`);
            const data = await response.json();
            setEmployeeDetails(data);
        } catch (error) {
            console.error('Error loading employee:', error);
            alert('Erreur lors du chargement des données employé');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedEmployeeId) {
            loadEmployeeDetails(selectedEmployeeId);
        }
    }, [selectedEmployeeId]);

    const handleAddRubrique = () => {
        setEditingRubrique(null);
        setSelectedRubriqueId(null);
        setCustomAmount(0);
        setIsModalOpen(true);
    };

    const handleEditRubrique = (rubrique: any, isFromStructure = false) => {
        setEditingRubrique(rubrique);
        if (isFromStructure) {
            // For structure rubriques, use the rubrique.id from rubrique object
            setSelectedRubriqueId(rubrique.rubrique.id);
            // Get the default value from structure
            const defaultValue = rubrique.rubrique.montantType === 'FIXE' && rubrique.rubrique.valeur
                ? Number(rubrique.rubrique.valeur)
                : 0;
            setCustomAmount(defaultValue);
        } else {
            // For custom rubriques
            setSelectedRubriqueId(rubrique.rubriqueId);
            setCustomAmount(Number(rubrique.montantOverride) || 0);
        }
        setIsModalOpen(true);
    };

    const handleSaveRubrique = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployeeId || !selectedRubriqueId) return;

        try {
            await assignMonthlyVariable(selectedEmployeeId, selectedRubriqueId, {
                startDate: new Date().toISOString(),
                endDate: null, // Permanent
                montantOverride: customAmount
            });
            setIsModalOpen(false);
            loadEmployeeDetails(selectedEmployeeId); // Refresh
        } catch (error) {
            console.error('Error saving rubrique:', error);
            alert('Erreur lors de l\'enregistrement');
        }
    };

    const handleDeleteRubrique = async (rubriqueId: number) => {
        if (!selectedEmployeeId) return;
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette personnalisation ?')) return;

        try {
            await deleteEmployeeRubrique(selectedEmployeeId, rubriqueId);
            loadEmployeeDetails(selectedEmployeeId); // Refresh
        } catch (error) {
            console.error('Error deleting rubrique:', error);
            alert('Erreur lors de la suppression');
        }
    };

    // Group rubriques
    const getGroupedRubriques = () => {
        if (!employeeDetails) return { structureRubriques: [], customRubriques: [] };

        const structureRubriques: any[] = [];
        const customRubriques: any[] = [];
        const seenRubriqueIds = new Set();

        // Custom rubriques (employee-specific)
        if (employeeDetails.rubriques) {
            employeeDetails.rubriques.forEach((er: any) => {
                customRubriques.push(er);
                seenRubriqueIds.add(er.rubriqueId);
            });
        }

        // Structure rubriques (from salary structure)
        if (employeeDetails.contracts && employeeDetails.contracts.length > 0) {
            employeeDetails.contracts.forEach((contract: any) => {
                if (contract.salaryStructure?.rubriques) {
                    contract.salaryStructure.rubriques.forEach((sr: any) => {
                        if (!seenRubriqueIds.has(sr.rubriqueId)) {
                            structureRubriques.push({
                                ...sr,
                                isFromStructure: true,
                                structureName: contract.salaryStructure.name
                            });
                        }
                    });
                }
            });
        }

        return { structureRubriques, customRubriques };
    };

    const filteredEmployees = employees.filter(emp =>
        (emp.lastName + ' ' + emp.firstName).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // DETAIL VIEW
    if (selectedEmployeeId && employeeDetails) {
        const { structureRubriques, customRubriques } = getGroupedRubriques();

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => {
                            setSelectedEmployeeId(null);
                            setEmployeeDetails(null);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900">
                            {employeeDetails.firstName} {employeeDetails.lastName}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {employeeDetails.position?.title || 'Sans poste'} • {employeeDetails.department?.name || 'Sans département'}
                        </p>
                    </div>
                    <button
                        onClick={handleAddRubrique}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Ajouter une rubrique
                    </button>
                </div>

                {/* No contract warning */}
                {(!employeeDetails.contracts || employeeDetails.contracts.length === 0) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-yellow-900">Aucun contrat trouvé</p>
                            <p className="text-sm text-yellow-700 mt-1">
                                Cet employé n'a pas de contrat actif. Créez un contrat avec une structure salariale pour afficher les rubriques automatiques.
                            </p>
                        </div>
                    </div>
                )}

                {/* No salary structure warning */}
                {employeeDetails.contracts && employeeDetails.contracts.length > 0 &&
                 !employeeDetails.contracts.some((c: any) => c.salaryStructure) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-blue-900">Aucune structure salariale</p>
                            <p className="text-sm text-blue-700 mt-1">
                                Le contrat de cet employé n'a pas de structure salariale assignée. Modifiez le contrat pour sélectionner une structure (Ex: Cadre, Standard, etc.).
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Rubriques personnalisées */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                            <h3 className="font-semibold text-gray-900">Rubriques Personnalisées</h3>
                            <p className="text-xs text-gray-500 mt-1">Rubriques spécifiques à cet employé</p>
                        </div>
                        <div className="p-6">
                            {customRubriques.length > 0 ? (
                                <div className="space-y-3">
                                    {customRubriques.map((er: any) => {
                                        // Check if this rubrique exists in the structure
                                        const isOverride = employeeDetails.contracts?.some((contract: any) =>
                                            contract.salaryStructure?.rubriques?.some((sr: any) =>
                                                sr.rubriqueId === er.rubriqueId
                                            )
                                        );

                                        return (
                                            <div
                                                key={er.id}
                                                className="group flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-gray-900 text-sm">{er.rubrique.nom}</p>
                                                        {isOverride && (
                                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                                                Personnalisé
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500">Code: {er.rubrique.code} • Type: {er.rubrique.type}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-blue-600">
                                                        {Number(er.montantOverride || 0).toLocaleString('fr-FR')} DA
                                                    </span>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEditRubrique(er)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRubrique(er.rubriqueId)}
                                                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                            title={isOverride ? "Supprimer la personnalisation (valeur de la structure sera rétablie)" : "Supprimer la rubrique"}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500">Aucune rubrique personnalisée</p>
                                    <button
                                        onClick={handleAddRubrique}
                                        className="text-sm text-blue-600 hover:underline mt-2"
                                    >
                                        Ajouter une rubrique
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rubriques de structure */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Rubriques de Structure</h3>
                            <p className="text-xs text-gray-500 mt-1">Provenant de la structure salariale</p>
                        </div>
                        <div className="p-6">
                            {structureRubriques.length > 0 ? (
                                <div className="space-y-3">
                                    {structureRubriques.map((sr: any) => (
                                        <div
                                            key={sr.id}
                                            className="group flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-gray-100/50 transition-all"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-700 text-sm">{sr.rubrique.nom}</p>
                                                <p className="text-xs text-gray-400">
                                                    {sr.structureName} • {sr.rubrique.code}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-600 font-medium">
                                                    {sr.rubrique.montantType === 'FIXE' && sr.rubrique.valeur ?
                                                        `${Number(sr.rubrique.valeur).toLocaleString('fr-FR')} DA` :
                                                        sr.rubrique.montantType === 'POURCENTAGE' ?
                                                        `${sr.rubrique.valeur}%` :
                                                        'Calculé'
                                                    }
                                                </span>
                                                <button
                                                    onClick={() => handleEditRubrique(sr, true)}
                                                    className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Personnaliser cette rubrique"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-400">Aucune structure salariale</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Add/Edit */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {editingRubrique ? 'Modifier' : 'Ajouter'} une rubrique
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {employeeDetails.firstName} {employeeDetails.lastName}
                                    </p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveRubrique} className="p-6 space-y-4">
                                {editingRubrique?.isFromStructure && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-xs text-blue-700">
                                            <p className="font-medium">Personnalisation de rubrique</p>
                                            <p className="mt-1">Vous créez une valeur spécifique pour cet employé qui remplacera celle de la structure salariale.</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Rubrique</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        value={selectedRubriqueId || ''}
                                        onChange={(e) => setSelectedRubriqueId(parseInt(e.target.value))}
                                        disabled={!!editingRubrique}
                                    >
                                        <option value="">Sélectionner...</option>
                                        {rubriques.map((rub: Rubrique) => (
                                            <option key={rub.id} value={rub.id}>
                                                {rub.code} - {rub.nom} ({rub.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Montant personnalisé</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 pl-10"
                                            placeholder="0.00"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(parseFloat(e.target.value))}
                                        />
                                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <div className="absolute right-3 top-2.5 text-xs font-medium text-gray-400">DA</div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // LIST VIEW
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Affectation des Rubriques</h2>
                    <p className="text-sm text-gray-500 mt-1">Gérez les rubriques spécifiques par employé</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un employé..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 w-64"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-50">
                {filteredEmployees.map((emp) => (
                    <div
                        key={emp.id}
                        onClick={() => setSelectedEmployeeId(emp.id)}
                        className="p-4 flex items-center justify-between hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                                {emp.firstName?.[0]}{emp.lastName?.[0]}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{emp.lastName} {emp.firstName}</h3>
                                <p className="text-sm text-gray-500">
                                    {emp.position?.title || 'Sans poste'} • {emp.department?.name || 'Sans département'}
                                </p>
                            </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                            Gérer les rubriques →
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
