'use client';

import { X, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen) return null;

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md p-6 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configurações</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Aparência</h3>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setTheme('light')}
                                className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all duration-200 ${theme === 'light'
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                    : 'border-transparent bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Sun size={28} />
                                <span className="font-semibold">Claro</span>
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all duration-200 ${theme === 'dark'
                                    ? 'border-blue-600 bg-gray-800 dark:bg-blue-900/30 text-blue-400'
                                    : 'border-transparent bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Moon size={28} />
                                <span className="font-semibold">Escuro</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500">
                    Minhas Notas v1.0
                </div>
            </div>
        </div>
    );
}
