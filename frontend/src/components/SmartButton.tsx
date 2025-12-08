import type { LucideIcon } from 'lucide-react';

interface SmartButtonProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    onClick?: () => void;
}

export function SmartButton({ label, value, icon: Icon, onClick }: SmartButtonProps) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
                minWidth: '140px'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
            <div style={{
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                padding: '0.5rem',
                borderRadius: '50%'
            }}>
                <Icon size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{value}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase' }}>{label}</span>
            </div>
        </button>
    );
}
