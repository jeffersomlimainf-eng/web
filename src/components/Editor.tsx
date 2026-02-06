'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/utils/supabase';
import 'easymde/dist/easymde.min.css';

// Dynamically import SimpleMDE to avoid SSR issues with 'navigator'
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });


interface EditorProps {
    noteId: string;
    onTitleChange?: (newTitle: string) => void;
}

export default function Editor({ noteId, onTitleChange }: EditorProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch note data when noteId changes
    useEffect(() => {
        const fetchNote = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('notes')
                .select('title, content')
                .eq('id', noteId)
                .single();

            if (data) {
                setTitle(data.title);
                setContent(data.content || '');
            } else if (error) {
                console.error("Error fetching note:", error);
            }
            setLoading(false);
        };

        if (noteId) fetchNote();
    }, [noteId]);

    // Debounce save function
    const saveNote = useCallback(async (newTitle: string, newContent: string) => {
        setSaving(true);
        await supabase.from('notes').update({
            title: newTitle,
            content: newContent
        }).eq('id', noteId);
        setSaving(false);
    }, [noteId]);

    useEffect(() => {
        // Identify typing pause to trigger save
        const timeoutId = setTimeout(() => {
            if (!loading) saveNote(title, content);
        }, 1000); // Save after 1 second of inactivity

        return () => clearTimeout(timeoutId);
    }, [title, content, saveNote, loading]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        // Instant update to parent
        if (onTitleChange) onTitleChange(newTitle);
    }

    const editorOptions = useMemo(() => ({
        spellChecker: false,
        placeholder: 'Escreva sua nota aqui...',
        status: false,
        autosave: {
            enabled: false,
            uniqueId: noteId,
            delay: 1000,
        },
    }), [noteId]);

    // Focus handling to ensure cursor is visible when clicking the container
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [instance, setInstance] = useState<any | null>(null);

    const handleContainerClick = () => {
        if (instance && instance.codemirror) {
            instance.codemirror.focus();
        }
    };

    if (loading) return (
        <div className="flex-1 h-full flex items-center justify-center bg-gray-950 text-gray-500 gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Carregando nota...
        </div>
    );

    return (
        <div className="flex-1 h-full flex flex-col bg-white dark:bg-gray-950 transition-colors duration-200">
            <div className="p-6 pl-16 md:pl-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center transition-colors">
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    className="text-3xl font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none w-full placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
                    placeholder="Título da Nota"
                />
                <div className="text-sm text-gray-500 w-24 text-right">
                    {saving ? 'Salvando...' : 'Salvo'}
                </div>
            </div>

            {/* Editor Container with Click-to-Focus */}
            <div
                className="flex-1 overflow-auto p-4 prose prose-slate dark:prose-invert max-w-none cursor-text transition-colors"
                onClick={handleContainerClick}
            >
                <SimpleMDE
                    id={`editor-${noteId}`}
                    getMdeInstance={setInstance}
                    value={content}
                    onChange={setContent}
                    options={editorOptions}
                    className="h-full"
                />
            </div>

            <style jsx global>{`
                .EasyMDEContainer {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                /* Base (Light Mode) */
                .CodeMirror {
                    background: #ffffff !important;
                    color: #1f2937 !important; /* gray-800 */
                    border: none !important;
                    flex: 1;
                    font-size: 16px;
                    transition: background 0.2s, color 0.2s;
                }
                .CodeMirror-cursor {
                    border-left: 2px solid #000000 !important;
                    border-right: none !important;
                }
                .editor-toolbar {
                    background: #f9fafb !important; /* gray-50 */
                    border-color: #e5e7eb !important; /* gray-200 */
                    opacity: 0.8;
                    transition: background 0.2s, border-color 0.2s;
                }
                .editor-toolbar i {
                    color: #4b5563 !important; /* gray-600 */
                }
                .editor-toolbar a.active, .editor-toolbar a:hover {
                    background: #e5e7eb !important; /* gray-200 */
                    border-color: transparent !important;
                }

                /* Dark Mode Overrides */
                :global(.dark) .CodeMirror {
                    background: #030712 !important; /* gray-950 */
                    color: #e5e7eb !important; /* gray-200 */
                }
                :global(.dark) .CodeMirror-cursor {
                    border-left: 2px solid #ffffff !important;
                }
                :global(.dark) .editor-toolbar {
                    background: #111827 !important; /* gray-900 */
                    border-color: #374151 !important; /* gray-700 */
                }
                :global(.dark) .editor-toolbar i {
                    color: #d1d5db !important; /* gray-300 */
                }
                :global(.dark) .editor-toolbar a.active, 
                :global(.dark) .editor-toolbar a:hover {
                    background: #374151 !important; /* gray-700 */
                }

                /* Hide status bar */
                .editor-statusbar {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
