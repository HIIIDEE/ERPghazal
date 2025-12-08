import { Users, FileText, Briefcase } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: `${color}20`, color: color }}>
            <Icon size={24} />
        </div>
        <div>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{title}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</h3>
        </div>
    </div>
);

export function Dashboard() {
    return (
        <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>Tableau de bord RH</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <StatCard title="Employés Total" value="124" icon={Users} color="#2563eb" />
                <StatCard title="Contrats Actifs" value="118" icon={FileText} color="#22c55e" />
                <StatCard title="Postes Ouverts" value="5" icon={Briefcase} color="#eab308" />
            </div>

            <div style={{ marginTop: '2rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Activité Récente</h3>
                <p style={{ color: '#64748b' }}>Aucune activité récente.</p>
            </div>
        </div>
    );
}
