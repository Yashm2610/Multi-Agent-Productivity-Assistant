import React from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { firestoreService } from '../services/firestoreService';
import { CheckCircle2, Circle, Trash2, Clock, Filter, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { CreateTaskDialog } from './CreateTaskDialog';

export function TasksView() {
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [filter, setFilter] = React.useState<'all' | 'pending' | 'completed'>('all');
  const [search, setSearch] = React.useState('');
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  React.useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const toggleStatus = async (task: any) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await firestoreService.updateTask(task.id, { status: newStatus });
  };

  const deleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await firestoreService.deleteTask(id);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto h-full flex flex-col">
      <header className="flex items-end justify-between shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-gray-400 text-sm">Manage your objectives and daily goals.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus size={18} />
          Add Task
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                filter === f ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-2"
            >
              <CheckCircle2 size={40} className="opacity-20" />
              <p className="text-sm italic">No tasks found matching your criteria.</p>
            </motion.div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "group flex items-center gap-4 p-4 glass rounded-2xl transition-all border border-white/5",
                  task.status === 'completed' && "opacity-60"
                )}
              >
                <button
                  onClick={() => toggleStatus(task)}
                  className={cn(
                    "shrink-0 transition-colors",
                    task.status === 'completed' ? "text-emerald-400" : "text-gray-600 hover:text-gray-400"
                  )}
                >
                  {task.status === 'completed' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-medium text-sm transition-all",
                    task.status === 'completed' && "line-through text-gray-500"
                  )}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                        <Clock size={10} />
                        {format(new Date(task.dueDate), 'MMM d, HH:mm')}
                      </div>
                    )}
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider",
                      task.priority === 'high' ? "text-red-400 bg-red-400/10" :
                      task.priority === 'medium' ? "text-amber-400 bg-amber-400/10" :
                      "text-blue-400 bg-blue-400/10"
                    )}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <CreateTaskDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
