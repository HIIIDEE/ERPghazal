import { useEffect, useState } from 'react';
import { useEmployeeStore } from '../features/hr/employeeStore';
import { ContractKanban } from '../features/hr/ContractKanban';
import { ContractModal } from '../features/hr/ContractModal';

export function Contracts() {
    const { fetchContracts, contracts, updateContract, loading } = useEmployeeStore();
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<any>(null);

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    if (loading) return <div style={{ padding: '2rem' }}>Chargement...</div>;

    const handleStatusChange = async (contractId: string, newStatus: string) => {
        await updateContract(contractId, { status: newStatus });
        fetchContracts(); // Refresh list after update
    };

    const handleContractClick = (contract: any) => {
        setEditingContract(contract);
        setIsContractModalOpen(true);
    };

    const handleAmendmentClick = (contract: any) => {
        setEditingContract({
            ...contract,
            id: undefined, // New contract
            status: 'DRAFT',
            type: contract.type,
            startDate: '', // User should set new start date
            previousContractId: contract.id // Link to previous
        });
        setIsContractModalOpen(true);
    };

    return (
        <div style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#0f172a' }}>Gestion des Contrats</h1>

            <div style={{ flex: 1, overflow: 'hidden' }}>
                <ContractKanban
                    contracts={contracts || []}
                    onAddClick={() => { setEditingContract(null); setIsContractModalOpen(true); }}
                    onContractClick={handleContractClick}
                    onStatusChange={handleStatusChange}
                    onAmendmentClick={handleAmendmentClick}
                />
            </div>

            {isContractModalOpen && (
                <ContractModal
                    // If creating new global contract, we need employeeId. 
                    // ContractModal might need adjustment if it expects employeeId prop.
                    // For now, let's assume editingContract has employeeId if it's an edit.
                    // If it's new, we might need a way to select employee. 
                    // The current ContractKanban "New" button might be problematic if it doesn't support selecting employee.
                    // Let's check ContractModal first.
                    employeeId={editingContract?.employeeId || ''}
                    contract={editingContract?.id ? editingContract : null}
                    previousContractId={editingContract?.previousContractId}
                    onClose={() => {
                        setIsContractModalOpen(false);
                        setEditingContract(null);
                        fetchContracts();
                    }}
                />
            )}
        </div>
    );
}

// Note: ContractModal probably requires employeeId.
// If we are creating a *new* contract from this global view, we need to know for WHICH employee.
// The current "New" button in ContractKanban just calls onAddClick.
// I might need to update ContractModal to allow selecting an employee if employeeId is missing.
