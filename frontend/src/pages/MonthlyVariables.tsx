import React, { useState, useEffect } from 'react';
import { useEmployeeStore, type Rubrique } from '../features/hr/employeeStore';
import { Plus, Trash2, Calendar, DollarSign, X, Briefcase, Info, ChevronRight, ArrowLeft, Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MonthlyVariables() {
    const {
        monthlyVariablesEmployees,
        fetchMonthlyVariables,
        rubriques,
        fetchRubriques,
        assignMonthlyVariable,
        deleteEmployeeRubrique,
        simulatePayslip
    } = useEmployeeStore();

    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRubriqueId, setSelectedRubriqueId] = useState<number | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Customize Structure Rubrique Modal
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
    const [customizeRubrique, setCustomizeRubrique] = useState<any>(null);
    const [customAmount, setCustomAmount] = useState<number>(0);

    // Simulation State
    const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
    const [simulationResult, setSimulationResult] = useState<any>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    useEffect(() => {
        fetchMonthlyVariables(month, year);
        fetchRubriques();
    }, [month, year, fetchMonthlyVariables, fetchRubriques]);

    const handleAddVariable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployeeId || !selectedRubriqueId) return;

        try {
            await assignMonthlyVariable(selectedEmployeeId, selectedRubriqueId, {
                startDate: startDate || new Date(year, month, 1).toISOString(),
                endDate: endDate || new Date(year, month + 1, 0).toISOString(),
                montant: amount
            });
            setIsModalOpen(false);
            fetchMonthlyVariables(month, year); // Refresh
        } catch (error) {
            alert('Erreur lors de l\'ajout de la variable');
        }
    };

    const handleDeleteVariable = async (employeeId: string, rubriqueId: number) => {
        if (confirm('Voulez-vous vraiment supprimer cette variable ?')) {
            try {
                await deleteEmployeeRubrique(employeeId, rubriqueId);
                fetchMonthlyVariables(month, year);
            } catch (error) {
                alert('Erreur lors de la suppression');
            }
        }
    };

    const handleSimulate = async () => {
        if (!selectedEmployeeId) return;
        setIsSimulating(true);
        try {
            const result = await simulatePayslip(selectedEmployeeId, month, year);
            setSimulationResult(result);
            setIsSimulationModalOpen(true);
        } catch (error) {
            alert("Erreur lors de la simulation de la paie.");
        } finally {
            setIsSimulating(false);
        }
    };

    const handleCustomizeRubrique = (rubrique: any) => {
        setCustomizeRubrique(rubrique);
        setCustomAmount(rubrique.montant ? Number(rubrique.montant) : 0);
        setIsCustomizeModalOpen(true);
    };

    const handleSaveCustomization = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployeeId || !customizeRubrique) return;

        try {
            await assignMonthlyVariable(selectedEmployeeId, customizeRubrique.rubrique.id, {
                startDate: new Date().toISOString(),
                endDate: null, // Permanent assignment
                montantOverride: customAmount
            });
            setIsCustomizeModalOpen(false);
            fetchMonthlyVariables(month, year); // Refresh
        } catch (error) {
            alert('Erreur lors de la personnalisation');
        }
    };

    // Helper to categorize rubriques
    const categorizeRubriques = (emp: any) => {
        const currentMonthEnd = new Date(year, month + 1, 0);

        const permanent: any[] = [];
        const monthly: any[] = [];
        const seenRubriqueIds = new Set();

        // 1. Direct assignments (EmployeeRubrique)
        emp.rubriques?.forEach((er: any) => {
            const isMonthly = er.endDate && new Date(er.endDate) <= currentMonthEnd;
            if (isMonthly) {
                monthly.push(er);
            } else {
                permanent.push(er);
                seenRubriqueIds.add(er.rubriqueId);
            }
        });

        // 2. Structure rubriques (via active contract)
        if (emp.contracts) {
            emp.contracts.forEach((contract: any) => {
                if (contract.salaryStructure?.rubriques) {
                    contract.salaryStructure.rubriques.forEach((sr: any) => {
                        // Only add if not already present (overridden)
                        if (!seenRubriqueIds.has(sr.rubriqueId)) {
                            permanent.push({
                                id: `struct-${sr.id}`,
                                rubrique: sr.rubrique,
                                montant: null, // Values computed at runtime
                                isStructure: true
                            });
                            seenRubriqueIds.add(sr.rubriqueId);
                        }
                    });
                }
            });
        }

        return { permanent, monthly };
    };

    // Filter employees
    const filteredEmployees = monthlyVariablesEmployees.filter(emp =>
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedEmployeeObj = monthlyVariablesEmployees.find(e => e.id === selectedEmployeeId);

    // --- DETAIL VIEW ---
    if (selectedEmployeeId && selectedEmployeeObj) {
        const { permanent, monthly } = categorizeRubriques(selectedEmployeeObj);

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Header / Back */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => setSelectedEmployeeId(null)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedEmployeeObj.lastName} {selectedEmployeeObj.firstName}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">Active</span>
                            <span>•</span>
                            <span>{selectedEmployeeObj.position?.title || 'Sans poste'}</span>
                        </div>
                    </div>
                    <div className="ml-auto flex gap-3">
                        <button
                            onClick={handleSimulate}
                            disabled={isSimulating}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                        >
                            {isSimulating ? (
                                <span className="animate-spin mr-1">⏳</span>
                            ) : (
                                <DollarSign className="w-4 h-4" />
                            )}
                            Simuler Paie
                        </button>

                        <button
                            onClick={() => {
                                setStartDate(new Date(year, month, 1).toISOString().split('T')[0]);
                                setEndDate(new Date(year, month + 1, 0).toISOString().split('T')[0]);
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Ajouter une Variable
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT: MONTHLY VARIABLES (Editable) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 rounded-md text-blue-600">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Variables du Mois</h3>
                            </div>
                            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">
                                {format(new Date(year, month), 'MMMM yyyy', { locale: fr })}
                            </span>
                        </div>

                        <div className="p-6">
                            {monthly.length > 0 ? (
                                <div className="space-y-3">
                                    {monthly.map((er: any) => (
                                        <div key={er.id} className="group flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                                            <div className="flex items-center gap-3">
                                                {/* <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    {er.rubrique.code.substring(0, 2)}
                                                </div> */}
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{er.rubrique.nom}</p>
                                                    <p className="text-xs text-gray-500">{new Date(er.startDate).toLocaleDateString()} - {er.endDate ? new Date(er.endDate).toLocaleDateString() : '...'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-gray-900">{Number(er.montant).toLocaleString('fr-FR')} DA</span>
                                                <button
                                                    onClick={() => handleDeleteVariable(selectedEmployeeId, er.rubriqueId)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Info className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-sm text-gray-500">Aucune variable ce mois-ci</p>
                                    <button
                                        onClick={() => {
                                            setStartDate(new Date(year, month, 1).toISOString().split('T')[0]);
                                            setEndDate(new Date(year, month + 1, 0).toISOString().split('T')[0]);
                                            setIsModalOpen(true);
                                        }}
                                        className="text-sm text-blue-600 font-medium hover:underline mt-2"
                                    >
                                        Ajouter maintenant
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: FIXED & PERMANENT (Customizable) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-gray-100 rounded-md text-gray-600">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Fixe & Permanent</h3>
                            </div>
                            <span className="text-xs text-blue-600 font-medium">Cliquez pour personnaliser</span>
                        </div>

                        <div className="p-6">
                            {permanent.length > 0 ? (
                                <div className="space-y-3">
                                    {permanent.map((er: any) => (
                                        <div
                                            key={er.id}
                                            onClick={() => handleCustomizeRubrique(er)}
                                            className="group flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="font-medium text-gray-700 text-sm group-hover:text-blue-700 transition-colors">{er.rubrique.nom}</p>
                                                    <p className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
                                                        {er.isStructure ? 'Structure Salariale - Cliquez pour override' : 'Assignation Personnalisée'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {er.montantOverride ? (
                                                    <span className="font-bold text-blue-600 text-sm">{Number(er.montantOverride).toLocaleString('fr-FR')} DA</span>
                                                ) : er.montant ? (
                                                    <span className="font-medium text-gray-600 text-sm">{Number(er.montant).toLocaleString('fr-FR')} DA</span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Calculé</span>
                                                )}
                                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-sm text-gray-400 italic">Aucune rubrique fixe assignée</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* MODAL AJOUT (Existing) */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="font-semibold text-gray-900">Ajouter une Variable</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Pour {selectedEmployeeObj.lastName}</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddVariable} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Rubrique Variable</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5"
                                        required
                                        onChange={(e) => setSelectedRubriqueId(parseInt(e.target.value))}
                                    >
                                        <option value="">Sélectionner...</option>
                                        {rubriques.filter((r: Rubrique) => r.type === 'GAIN' || r.type === 'RETENUE').map((rub: Rubrique) => (
                                            <option key={rub.id} value={rub.id}>{rub.code} - {rub.nom}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Montant</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 pl-10 text-sm py-2.5"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(parseFloat(e.target.value))}
                                        />
                                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <div className="absolute right-3 top-2.5 text-xs font-medium text-gray-400">DA</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Début</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm py-2"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Fin</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm py-2"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-100 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL CUSTOMIZE RUBRIQUE */}
                {isCustomizeModalOpen && customizeRubrique && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                                <div>
                                    <h3 className="font-semibold text-gray-900">Personnaliser la Rubrique</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">{customizeRubrique.rubrique.nom}</p>
                                </div>
                                <button onClick={() => setIsCustomizeModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveCustomization} className="p-6 space-y-4">
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                    <p className="text-xs text-blue-700 font-medium mb-1">ℹ️ Information</p>
                                    <p className="text-xs text-blue-600">
                                        {customizeRubrique.isStructure
                                            ? "Cette rubrique provient de la structure salariale. Définissez un montant personnalisé pour cet employé."
                                            : "Modifiez le montant personnalisé pour cet employé."}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Montant Personnalisé</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 pl-10 text-sm py-2.5"
                                            placeholder="0.00"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(parseFloat(e.target.value))}
                                        />
                                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <div className="absolute right-3 top-2.5 text-xs font-medium text-gray-400">DA</div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Ce montant remplacera la valeur de la structure salariale pour cet employé uniquement.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCustomizeModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-100 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL SIMULATION RESULT */}
                {isSimulationModalOpen && simulationResult && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="font-semibold text-gray-900">Simulation de Paie</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">{selectedEmployeeObj.lastName} {selectedEmployeeObj.firstName} - {format(new Date(year, month), 'MMMM yyyy', { locale: fr })}</p>
                                </div>
                                <button onClick={() => setIsSimulationModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-0">
                                <div className="px-6 py-4 bg-gray-50/30">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-500">Salaire de Base</span>
                                        <span className="text-base font-semibold text-gray-900">{simulationResult.baseSalary?.toLocaleString('fr-FR')} DA</span>
                                    </div>
                                </div>

                                <div className="px-6 py-4 space-y-4">
                                    {/* Gains Details using details.gains if available */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2 border-b border-green-100 pb-1">Gains & Primes</h4>
                                        <div className="space-y-1">
                                            {simulationResult.details?.gains?.map((g: any, idx: number) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-gray-600">{g.name}</span>
                                                    <span className="text-gray-900 font-medium">{Number(g.amount).toLocaleString('fr-FR')} DA</span>
                                                </div>
                                            ))}
                                            {(!simulationResult.details?.gains || simulationResult.details.gains.length === 0) && (
                                                <p className="text-xs text-gray-400 italic">Aucune prime</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-gray-100">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Salaire Brut</span>
                                            <span className="text-gray-900 font-medium">{simulationResult.grossSalary?.toLocaleString('fr-FR')} DA</span>
                                        </div>

                                        <div className="mt-3">
                                            <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2 border-b border-red-100 pb-1">Retenues & Cotisations</h4>
                                            <div className="space-y-1">
                                                {simulationResult.details?.retenues?.map((r: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between text-sm text-red-600">
                                                        <span>{r.name}</span>
                                                        <span>-{Number(r.amount).toLocaleString('fr-FR')} DA</span>
                                                    </div>
                                                ))}
                                                {(!simulationResult.details?.retenues || simulationResult.details.retenues.length === 0) && (
                                                    <p className="text-xs text-gray-400 italic">Aucune retenue</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-5 bg-blue-50 border-t border-blue-100 flex justify-between items-center">
                                    <span className="text-sm font-bold text-blue-900 uppercase">Net à Payer</span>
                                    <span className="text-2xl font-bold text-blue-700">{simulationResult.netSalary?.toLocaleString('fr-FR')} DA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- LIST VIEW ---
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{format(new Date(2025, i, 1), 'MMMM', { locale: fr })}</option>
                            ))}
                        </select>
                        <span className="text-gray-300">|</span>
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un employé..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 w-64 transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-50">
                {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp: any) => {
                        const { monthly } = categorizeRubriques(emp);
                        return (
                            <div
                                key={emp.id}
                                onClick={() => setSelectedEmployeeId(emp.id)}
                                className="group p-4 flex items-center justify-between hover:bg-blue-50/50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors">
                                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{emp.lastName} {emp.firstName}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span>{emp.position?.title || 'Sans poste'}</span>
                                            <span className="text-gray-300">•</span>
                                            <span>{emp.department?.name || 'Sans département'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className="block text-xs text-gray-400 uppercase tracking-wider mb-0.5">Mois</span>
                                        <span className={`text-sm font-medium ${monthly.length > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                            {monthly.length} variable{monthly.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-10 text-center text-gray-500">
                        Aucun collaborateur trouvé pour ce mois.
                    </div>
                )}
            </div>
        </div>
    );
}
