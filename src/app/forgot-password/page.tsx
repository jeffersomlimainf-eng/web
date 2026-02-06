'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // For local development, Supabase might redirect to localhost:3000 by default.
        // We explicitly set the redirect to our update-password page.
        // In production, this URL needs to be configured in Supabase Authentication -> URL Configuration.
        const redirectTo = `${window.location.origin}/update-password`;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Verifique seu e-mail para redefinir a senha!' });
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-200">
            <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 transition-colors">
                <Link href="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={16} /> Voltar para Login
                </Link>

                <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
                    Recuperar Senha
                </h2>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
                    Digite seu e-mail e enviaremos um link para resetar sua senha.
                </p>

                {message && (
                    <div className={`p-3 rounded-md text-sm mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleReset} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            required
                            placeholder="seu@email.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-semibold transition-colors disabled:opacity-50 mt-2 shadow-md hover:shadow-lg"
                    >
                        {loading ? 'Enviar Link' : 'Enviar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
