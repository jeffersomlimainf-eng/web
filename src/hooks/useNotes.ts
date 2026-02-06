import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { User } from '@supabase/supabase-js';

export interface Note {
    id: string;
    title: string;
    updated_at: string;
    folder_id: string | null;
    content?: string; // Optional for list view
}

export interface Folder {
    id: string;
    title: string;
    parent_id: string | null;
}

export function useNotes(user: User | null) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user) return;

        const [notesRes, foldersRes] = await Promise.all([
            supabase
                .from('notes')
                .select('id, title, updated_at, folder_id, content')
                .order('updated_at', { ascending: false }),
            supabase
                .from('folders')
                .select('id, title, parent_id')
                .order('title', { ascending: true })
        ]);

        if (notesRes.error) console.error('Error fetching notes:', notesRes.error);
        if (foldersRes.error) console.error('Error fetching folders:', foldersRes.error);

        setNotes(notesRes.data || []);
        setFolders(foldersRes.data || []);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchData();

            // Realtime subscription
            const channel = supabase
                .channel('db_changes_hook')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, (payload) => {
                    // We can handle specific events for better performance, but refetch is safer for now
                    // However, for the "instant" feel, we rely on the manual state updates below.
                    // Realtime acts as a backup/sync for other devices.
                    if (payload.eventType !== 'UPDATE') fetchData(); // Avoid double update if we already updated optimistically
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'folders' }, fetchData)
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        } else {
            setNotes([]);
            setFolders([]);
            setLoading(false);
        }
    }, [user, fetchData]);

    // --- Actions ---

    const createNote = async (folderId: string | null = null) => {
        if (!user) return null;

        const { data, error } = await supabase
            .from('notes')
            .insert([{ user_id: user.id, title: 'Nova Nota', folder_id: folderId, content: '' }])
            .select()
            .single();

        if (error) {
            console.error('Error creating note:', error);
            return null;
        } else if (data) {
            setNotes((prev) => [data, ...prev]);
            return data;
        }
    };

    const updateNoteTitle = (id: string, newTitle: string) => {
        setNotes((prev) => prev.map(n => n.id === id ? { ...n, title: newTitle } : n));
    };

    const createFolder = async (title: string) => {
        if (!user) return;
        const { data, error } = await supabase.from('folders').insert([{ user_id: user.id, title }]).select().single();
        if (error) {
            console.error("Error creating folder:", error);
            alert("Erro ao criar pasta");
        } else {
            if (data) setFolders(prev => [...prev, data]);
            else fetchData();
        }
    }

    const renameFolder = async (id: string, newTitle: string) => {
        setFolders(prev => prev.map(f => f.id === id ? { ...f, title: newTitle } : f));
        const { error } = await supabase.from('folders').update({ title: newTitle }).eq('id', id);
        if (error) {
            console.error("Error renaming:", error);
            fetchData(); // Rollback
        }
    };

    const deleteFolder = async (id: string) => {
        // Simple optimistic logic: remove folder and move its notes to root
        setFolders(prev => prev.filter(f => f.id !== id));
        setNotes(prev => prev.map(n => n.folder_id === id ? { ...n, folder_id: null } : n));

        // DB updates
        const folderNotes = notes.filter(n => n.folder_id === id);
        if (folderNotes.length > 0) {
            await supabase.from('notes').update({ folder_id: null }).eq('folder_id', id);
        }
        await supabase.from('folders').delete().eq('id', id);
    };

    const deleteNote = async (id: string) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        await supabase.from('notes').delete().eq('id', id);
    };

    const moveNote = async (noteId: string, folderId: string | null) => {
        setNotes((prev) => prev.map((n) => n.id === noteId ? { ...n, folder_id: folderId } : n));
        const { error } = await supabase.from('notes').update({ folder_id: folderId }).eq('id', noteId);
        if (error) fetchData();
    };

    return {
        notes,
        folders,
        loading,
        createNote,
        updateNoteTitle,
        createFolder,
        renameFolder,
        deleteFolder,
        deleteNote,
        moveNote,
        refresh: fetchData
    };
}
