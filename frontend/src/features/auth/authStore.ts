import { create } from 'zustand';
import { api } from '../../lib/api';

interface User {
    id: string;
    email: string;
    roles: string[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
    login: async (data) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/login', data);
            const { access_token, user } = response.data;
            localStorage.setItem('token', access_token);
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            set({ user, token: access_token, isAuthenticated: true, loading: false });
        } catch (error) {
            set({ loading: false, error: 'Identifiants invalides' });
        }
    },
    register: async (data) => {
        set({ loading: true, error: null });
        try {
            await api.post('/auth/register', data);
            set({ loading: false });
        } catch (error) {
            set({ loading: false, error: 'Erreur lors de l\'inscription' });
        }
    },
    logout: () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isAuthenticated: false });
    },
}));
