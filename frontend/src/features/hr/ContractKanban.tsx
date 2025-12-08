import { FileText, Plus } from 'lucide-react';

// Mocking enum if not shared
const STATUSES = ['DRAFT', 'RUNNING', 'TO_RENEW', 'EXPIRED'];

interface ContractKanbanProps {
    contracts: any[];
    onAddClick: () => void;
    onContractClick: (contract: any) => void;
    onStatusChange: (contractId: string, newStatus: string) => void;
    onAmendmentClick: (contract: any) => void;
}

export function ContractKanban({ contracts, onAddClick, onContractClick, onStatusChange, onAmendmentClick }: ContractKanbanProps) {

    const getColumnColor = (status: string) => {
        switch (status) {
            case 'RUNNING': return '#22c55e'; // green
            case 'TO_RENEW': return '#eab308'; // yellow
            case 'EXPIRED': return '#ef4444'; // red
            default: return '#94a3b8'; // gray
        }
    };

    const handleDragStart = (e: React.DragEvent, contractId: string) => {
        e.dataTransfer.setData('contractId', contractId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const contractId = e.dataTransfer.getData('contractId');
        if (contractId) {
            onStatusChange(contractId, status);
        }
    };

    return (
        <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', height: '100%', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>Vue Kanban des Contrats</h3>
                <button
                    onClick={onAddClick}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#2563eb', color: 'white',
                        borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500
                    }}
                >
                    <Plus size={16} /> Nouveau
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                {STATUSES.map(status => (
                    <div
                        key={status}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, status)}
                        style={{ minWidth: '280px', flex: 1, backgroundColor: 'white', borderRadius: '8px', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                    >
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `2px solid ${getColumnColor(status)}`
                        }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#475569' }}>{status}</span>
                            <span style={{ backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                                {contracts.filter(c => c.status === status).length}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {contracts.filter(c => c.status === status).map(contract => (
                                <div
                                    key={contract.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, contract.id)}
                                    onClick={() => onContractClick(contract)}
                                    style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'grab', transition: 'transform 0.1s' }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{contract.type}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {status === 'RUNNING' && !contract.nextContract && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAmendmentClick(contract);
                                                    }}
                                                    title="Créer un avenant"
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                                                >
                                                    <Plus size={16} color="#2563eb" />
                                                </button>
                                            )}
                                            <FileText size={14} color="#94a3b8" />
                                        </div>
                                    </div>
                                    {contract.previousContract && (
                                        <div style={{ fontSize: '0.7rem', color: '#2563eb', marginBottom: '0.25rem', fontStyle: 'italic' }}>
                                            ↳ Avenant au {new Date(contract.previousContract.startDate).toLocaleDateString()}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                        {new Date(contract.startDate).toLocaleDateString()}
                                    </div>
                                    {contract.reference && (
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                                            {contract.reference}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>
                                        {contract.wage} € / mois
                                    </div>
                                </div>
                            ))}
                            {contracts.filter(c => c.status === status).length === 0 && (
                                <div style={{ textAlign: 'center', padding: '1rem', color: '#cbd5e1', fontSize: '0.875rem', fontStyle: 'italic' }}>
                                    Aucun contrat
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
