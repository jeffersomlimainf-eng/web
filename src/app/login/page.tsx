'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) alert(error.message);
            else alert('Verifique seu e-mail para confirmar o cadastro!');
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                alert(error.message);
            } else {
                router.push('/');
                router.refresh();
            }
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-200">
            <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 transition-colors">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                    {isSignUp ? 'Criar Conta' : 'Entrar no Minhas Notas'}
                </h2>

                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-semibold transition-colors disabled:opacity-50 mt-2 shadow-md hover:shadow-lg"
                    >
                        {loading ? 'Carregando...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
                    </button>
                </form>

                <div className="mt-4 text-center space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium hover:underline transition-colors block w-full"
                    >
                        {isSignUp ? 'Já tem uma conta? Entre aqui.' : 'Não tem conta? Crie uma agora.'}
                    </button>

                    {!isSignUp && (
                        <a
                            href="/forgot-password"
                            className="text-xs text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 hover:underline transition-colors block"
                        >
                            Esqueci minha senha
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
