import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../features/auth/authStore';

export function MainLayout() {
    const logout = useAuthStore((state) => state.logout);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <aside style={{ width: '250px', backgroundColor: 'var(--sidebar-bg)', color: 'white', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>ERP Ghazal</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '4px', transition: 'background 0.2s' }}>
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link to="/employees" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '4px', transition: 'background 0.2s' }}>
                        <Users size={20} /> Employés
                    </Link>
                    <Link to="/contracts" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '4px', transition: 'background 0.2s' }}>
                        <FileText size={20} /> Contrats
                    </Link>
                </nav>

                <div style={{ marginTop: 'auto', borderTop: '1px solid #334155', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link to="/config" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Settings size={20} /> Configuration
                    </Link>
                    <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', color: 'white', padding: 0 }}>
                        <LogOut size={20} /> Déconnexion
                    </button>
                </div>
            </aside>
            <main style={{ flex: 1, padding: '2rem' }}>
                <Outlet />
            </main>
        </div>
    );
}
