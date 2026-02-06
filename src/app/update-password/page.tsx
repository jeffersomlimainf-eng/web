'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function UpdatePassword() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        } else {
            setMessage({ type: 'success', text: 'Senha atualizada com sucesso! Redirecionando...' });
            setTimeout(() => {
                router.push('/'); // Go to home/dashboard
            }, 2000);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-200">
            <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 transition-colors">
                <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
                    Definir Nova Senha
                </h2>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
                    Digite sua nova senha abaixo.
                </p>

                {message && (
                    <div className={`p-3 rounded-md text-sm mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Nova Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            required
                            minLength={6}
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-semibold transition-colors disabled:opacity-50 mt-2 shadow-md hover:shadow-lg"
                    >
                        {loading ? 'Atualizando...' : 'Salvar Nova Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
}
