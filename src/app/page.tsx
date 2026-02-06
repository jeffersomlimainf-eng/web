'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Editor from '@/components/Editor';
import { supabase } from "@/utils/supabase";
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useNotes } from '@/hooks/useNotes';
import { Menu } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) router.push('/login');
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Use the comprehensive hook
  const {
    notes,
    folders,
    loading,
    createNote,
    updateNoteTitle,
    createFolder,
    renameFolder,
    deleteFolder,
    deleteNote,
    moveNote
  } = useNotes(user);

  const handleCreateNote = async (folderId: string | null) => {
    const newNote = await createNote(folderId);
    if (newNote) setActiveNoteId(newNote.id);
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden transition-colors duration-200">

      {/* Mobile Menu Button - Visible only on mobile when sidebar is closed */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
        >
          <Menu size={20} />
        </button>
      </div>

      <Sidebar
        user={user}
        notes={notes}
        folders={folders}
        loading={loading}
        activeNoteId={activeNoteId}
        onSelectNote={setActiveNoteId}
        onCreateNote={handleCreateNote}
        onCreateFolder={createFolder}
        onRenameFolder={renameFolder}
        onDeleteFolder={deleteFolder}
        onDeleteNote={deleteNote}
        onMoveNote={moveNote}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 h-full">
        {activeNoteId ? (
          <Editor
            key={activeNoteId}
            noteId={activeNoteId}
            onTitleChange={(newTitle) => updateNoteTitle(activeNoteId, newTitle)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Selecione ou crie uma nota para começar.
          </div>
        )}
      </main>
    </div>
  );
}
