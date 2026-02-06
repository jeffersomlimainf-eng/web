import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import SettingsModal from './SettingsModal';
import { Settings, Plus, Search, FileText, Trash2, LogOut, Loader2, X } from 'lucide-react';
import clsx from 'clsx';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Note, Folder } from '@/hooks/useNotes';

interface SidebarProps {
    user: User | null;
    notes: Note[];
    folders: Folder[];
    loading: boolean;
    activeNoteId: string | null;
    onSelectNote: (id: string | null) => void;
    onCreateNote: (folderId: string | null) => void;
    onCreateFolder: (title: string) => void;
    onRenameFolder: (id: string, title: string) => void;
    onDeleteFolder: (id: string) => void;
    onDeleteNote: (id: string) => void;
    onMoveNote: (noteId: string, folderId: string | null) => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({
    user,
    notes,
    folders,
    loading,
    activeNoteId,
    onSelectNote,
    onCreateNote,
    onCreateFolder,
    onRenameFolder,
    onDeleteFolder,
    onDeleteNote,
    onMoveNote,
    isOpen = true,
    onClose
}: SidebarProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState('');
    const [creating, setCreating] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const router = useRouter();

    // Data fetching is now handled by parent (useNotes hook)



    const handleCreateNote = async (folderId: string | null = null) => {
        if (creating) return;
        setCreating(true);
        await onCreateNote(folderId); // This needs to return or sidebar needs to wait, assuming instant for now or wait
        // To properly expand folder, we might need logic here, but for now simple proxy.
        if (folderId) setExpandedFolders(prev => new Set(prev).add(folderId));
        setCreating(false);
    };

    const handleCreateFolder = async () => {
        const title = prompt("Nome da nova pasta:");
        if (!title) return;
        onCreateFolder(title);
    };

    const handleRenameFolderWrapper = (id: string, currentTitle: string) => {
        const newTitle = prompt("Novo nome da pasta:", currentTitle);
        if (!newTitle || newTitle === currentTitle) return;
        onRenameFolder(id, newTitle);
    };

    const handleDragStart = (e: React.DragEvent, noteId: string) => {
        e.dataTransfer.setData("text/plain", noteId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (e: React.DragEvent, folderId: string | null) => {
        e.preventDefault();
        const noteId = e.dataTransfer.getData("text/plain");
        if (!noteId) return;

        if (folderId) {
            setExpandedFolders(prev => new Set(prev).add(folderId));
        }

        onMoveNote(noteId, folderId);
    };

    const handleDeleteFolderWrapper = (id: string, title: string) => {
        const folderNotes = notes.filter(n => n.folder_id === id);
        const hasNotes = folderNotes.length > 0;
        const message = hasNotes
            ? `Tem certeza que deseja excluir a pasta "${title}"? As datas notas serão movidas para "Minhas Notas".`
            : `Tem certeza que deseja excluir a pasta "${title}"?`;
        if (!confirm(message)) return;

        onDeleteFolder(id);
    };

    const handleDeleteNoteWrapper = (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta nota?")) return;
        if (activeNoteId === id) onSelectNote(null);
        onDeleteNote(id);
    };

    const handleNoteClick = (id: string) => {
        onSelectNote(id);
        if (window.innerWidth < 768 && onClose) {
            onClose();
        }
    };

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folderId)) next.delete(folderId);
            else next.add(folderId);
            return next;
        });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    // Filter logic
    const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));
    const filteredFolders = folders.filter(f => f.title.toLowerCase().includes(search.toLowerCase()));

    // Grouping
    const rootNotes = filteredNotes.filter(n => !n.folder_id);
    const rootFolders = folders.filter(f => !f.parent_id); // Basic 1-level support for now, recursion later if needed

    const renderFolder = (folder: Folder) => {
        const folderNotes = filteredNotes.filter(n => n.folder_id === folder.id);
        const isExpanded = expandedFolders.has(folder.id);
        const hasChildren = folderNotes.length > 0;

        // If searching, show all matching folders expanded
        if (search && (filteredFolders.includes(folder) || folderNotes.length > 0)) {
            // Force expand if searching (optional UX)
        }

        return (
            <div
                key={folder.id}
                className="mb-1"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, folder.id)}
            >
                <div
                    className="flex justify-between items-center p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer group text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    onClick={() => toggleFolder(folder.id)}
                >
                    <div className="flex items-center gap-2 truncate">
                        <span className="text-xs transition-transform duration-200 text-gray-400" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                        <span className="font-semibold text-sm truncate">{folder.title}</span>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        <button
                            className="p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCreateNote(folder.id);
                            }}
                            title="Nova nota nesta pasta"
                        >
                            <Plus size={12} />
                        </button>
                        <button
                            className="p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded text-xs text-gray-500 hover:text-blue-500 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRenameFolderWrapper(folder.id, folder.title);
                            }}
                            title="Renomear pasta"
                        >
                            <FileText size={12} />
                        </button>
                        <button
                            className="p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded text-xs text-gray-500 hover:text-red-500 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolderWrapper(folder.id, folder.title);
                            }}
                            title="Excluir pasta"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="ml-4 border-l border-gray-200 dark:border-gray-800 pl-2 transition-colors">
                        {folderNotes.map(note => renderNoteItem(note))}
                        {folderNotes.length === 0 && <div className="text-xs text-gray-500 dark:text-gray-500 p-2 italic">Vazio</div>}
                    </div>
                )}
            </div>
        );
    };

    const renderNoteItem = (note: Note) => (
        <div
            key={note.id}
            draggable
            onDragStart={(e) => handleDragStart(e, note.id)}
            onClick={() => handleNoteClick(note.id)}
            className={clsx(
                "p-2 rounded-md cursor-pointer group flex justify-between items-center transition-all duration-200 mb-1 border border-transparent",
                activeNoteId === note.id
                    ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400 border-gray-200 dark:border-gray-700"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800/50"
            )}
        >
            <div className="truncate flex-1 flex items-center gap-2">
                <FileText size={14} className={activeNoteId === note.id ? "text-blue-400" : "opacity-30"} />
                <span className="truncate text-sm">{note.title || 'Sem título'}</span>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNoteWrapper(note.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                title="Excluir nota"
            >
                <Trash2 size={12} />
            </button>
        </div>
    );

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <div className={clsx(
                "w-64 h-full bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col transition-transform duration-300 ease-in-out relative z-50",
                "fixed inset-y-0 left-0 md:relative md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>

                {/* Header */}
                <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50 space-y-3 transition-colors">
                    <div className="flex justify-between items-center">
                        <h1
                            className="font-bold text-gray-900 dark:text-white cursor-default text-lg tracking-tight"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, null)}
                            title="Solte aqui para mover para a raiz"
                        >
                            Minhas Notas
                        </h1>
                        <div className="flex gap-1 items-center">
                            <button onClick={handleCreateFolder} className="p-1 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all" title="Nova Pasta">
                                <span className="text-xs border border-gray-300 dark:border-gray-700 px-1 rounded opacity-70">+📂</span>
                            </button>
                            {/* Mobile Close Button */}
                            <button
                                onClick={onClose}
                                className="md:hidden p-1 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 rounded text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => handleCreateNote(null)}
                        disabled={creating}
                        className="w-full bg-blue-600/90 hover:bg-blue-700 text-white rounded-lg p-2.5 flex items-center justify-center gap-2 text-sm font-medium transition-all shadow-sm hover:shadow-md backdrop-blur-sm"
                    >
                        {creating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                        Nova Nota
                    </button>

                    <div className="relative group">
                        <Search className="absolute left-2.5 top-2.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm text-gray-900 dark:text-white rounded-lg pl-9 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-200 dark:border-gray-800 transition-all placeholder:text-gray-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Note List / Tree */}
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>
                    ) : (
                        <>
                            {/* Folders first */}
                            {rootFolders.map(folder => renderFolder(folder))}

                            {/* Root Notes */}
                            {rootNotes.length > 0 && (
                                <div className="mt-2">
                                    {rootNotes.map(note => renderNoteItem(note))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* User Footer */}
                <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-md flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3 truncate">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs shadow-inner">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col truncate">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[100px]">
                                {user?.email?.split('@')[0]}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all"
                            title="Configurações"
                        >
                            <Settings size={18} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-red-100/50 dark:hover:bg-red-900/20 rounded-lg text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-all"
                            title="Sair"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            </div>
        </>
    );
}
