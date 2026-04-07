import React from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { CheckCircle2, Calendar, FileText, Clock, AlertCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { CreateTaskDialog } from './CreateTaskDialog';

export function Dashboard() {
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [events, setEvents] = React.useState<any[]>([]);
  const [notes, setNotes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = React.useState(false);

  React.useEffect(() => {
    if (!auth.currentUser) return;

    const unsubTasks = onSnapshot(
      query(collection(db, 'tasks'), where('userId', '==', auth.currentUser.uid), orderBy('createdAt', 'desc')),
      (snapshot) => setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );

    const unsubEvents = onSnapshot(
      query(collection(db, 'events'), where('userId', '==', auth.currentUser.uid), orderBy('startTime', 'asc')),
      (snapshot) => setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );

    const unsubNotes = onSnapshot(
      query(collection(db, 'notes'), where('userId', '==', auth.currentUser.uid), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }
    );

    return () => {
      unsubTasks();
      unsubEvents();
      unsubNotes();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-500 font-mono">INITIALIZING NEXUS...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <header className="flex items-end justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Command Center</h1>
          <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Nexus Orchestrator v1.0</p>
        </div>
        <button
          onClick={() => setIsCreateTaskOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          New Task
        </button>
      </header>

      <CreateTaskDialog isOpen={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tasks Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-lg">
              <CheckCircle2 className="text-emerald-400" size={20} />
              Active Tasks
            </h2>
            <span className="text-xs font-mono text-gray-500">{tasks.length}</span>
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {tasks.length === 0 ? (
                <div className="p-4 glass rounded-2xl text-sm text-gray-500 italic">No active tasks.</div>
              ) : (
                tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 glass rounded-2xl space-y-2 group hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm leading-tight">{task.title}</h3>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full uppercase font-bold",
                        task.priority === 'high' ? "bg-red-500/20 text-red-400" :
                        task.priority === 'medium' ? "bg-amber-500/20 text-amber-400" :
                        "bg-blue-500/20 text-blue-400"
                      )}>
                        {task.priority}
                      </span>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                        <Clock size={10} />
                        {format(new Date(task.dueDate), 'MMM d, HH:mm')}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Calendar Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-lg">
              <Calendar className="text-blue-400" size={20} />
              Upcoming Events
            </h2>
            <span className="text-xs font-mono text-gray-500">{events.length}</span>
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {events.length === 0 ? (
                <div className="p-4 glass rounded-2xl text-sm text-gray-500 italic">No upcoming events.</div>
              ) : (
                events.map((event) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 glass rounded-2xl space-y-2 hover:bg-white/10 transition-colors"
                  >
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                      <Clock size={10} />
                      {format(new Date(event.startTime), 'MMM d, HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                    </div>
                    {event.location && (
                      <div className="text-[10px] text-gray-500 italic truncate">@ {event.location}</div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Notes Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-lg">
              <FileText className="text-purple-400" size={20} />
              Recent Notes
            </h2>
            <span className="text-xs font-mono text-gray-500">{notes.length}</span>
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {notes.length === 0 ? (
                <div className="p-4 glass rounded-2xl text-sm text-gray-500 italic">No notes found.</div>
              ) : (
                notes.map((note) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 glass rounded-2xl space-y-2 hover:bg-white/10 transition-colors"
                  >
                    {note.title && <h3 className="font-medium text-sm">{note.title}</h3>}
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{note.content}</p>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.map((tag: string) => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-gray-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}
