import React from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { FileText, Search, Plus, Trash2, Tag, Clock, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { firestoreService } from '../services/firestoreService';

export function NotesView() {
  const [notes, setNotes] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState('');
  const [selectedNote, setSelectedNote] = React.useState<any>(null);
  const [noteToDelete, setNoteToDelete] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'notes'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleDelete = async () => {
    if (!noteToDelete) return;
    try {
      await firestoreService.deleteNote(noteToDelete);
      setNoteToDelete(null);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title?.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 h-full flex flex-col gap-8 max-w-6xl mx-auto relative">
      <AnimatePresence>
        {noteToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNoteToDelete(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50 p-6"
            >
              <div className="glass-dark rounded-[32px] p-8 shadow-2xl border border-white/10 text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle size={32} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">Delete Note?</h2>
                  <p className="text-sm text-gray-400">This action cannot be undone. Are you sure you want to remove this piece of knowledge?</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNoteToDelete(null)}
                    className="flex-1 py-3 glass rounded-xl text-sm font-medium hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-600/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <header className="flex items-end justify-between shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-gray-400 text-sm">Capture ideas, snippets, and important information.</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-20 text-gray-600 text-center space-y-2"
            >
              <FileText size={40} className="opacity-20" />
              <p className="text-sm italic">No notes found matching your search.</p>
            </motion.div>
          ) : (
            filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-6 glass rounded-[32px] space-y-4 border border-white/5 hover:bg-white/10 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors" />
                
                <div className="space-y-2">
                  {note.title && (
                    <h3 className="font-bold text-lg leading-tight group-hover:text-indigo-400 transition-colors">
                      {note.title}
                    </h3>
                  )}
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-6 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {note.tags.map((tag: string) => (
                        <span key={tag} className="flex items-center gap-1 text-[9px] px-2 py-0.5 bg-white/5 rounded-full border border-white/10 text-gray-500 group-hover:text-gray-300 transition-colors">
                          <Tag size={8} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-600 font-mono">
                      <Clock size={10} />
                      {format(new Date(note.createdAt), 'MMM d, yyyy')}
                    </div>
                    <button 
                      onClick={() => setNoteToDelete(note.id)}
                      className="p-1.5 text-gray-700 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
