import React from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { cn } from '../lib/utils';

export function CalendarView() {
  const [events, setEvents] = React.useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  React.useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'events'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('startTime', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const selectedDayEvents = events.filter(e => isSameDay(new Date(e.startTime), selectedDate));

  return (
    <div className="p-8 h-full flex flex-col gap-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-gray-400 text-sm">Organize your schedule and upcoming events.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-bold min-w-[120px] text-center uppercase tracking-widest font-mono">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), day));
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "aspect-square p-2 rounded-2xl border transition-all relative flex flex-col items-center justify-center gap-1 group",
                    isSelected ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" : 
                    isToday(day) ? "bg-white/10 border-indigo-500/50 text-indigo-400" :
                    isCurrentMonth ? "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10" :
                    "bg-transparent border-transparent text-gray-700 pointer-events-none"
                  )}
                >
                  <span className="text-sm font-bold">{format(day, 'd')}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5">
                      {dayEvents.slice(0, 3).map((_, i) => (
                        <div key={i} className={cn(
                          "w-1 h-1 rounded-full",
                          isSelected ? "bg-white" : "bg-indigo-400"
                        )} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Events */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <div className="flex items-center justify-between shrink-0">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <CalendarIcon size={20} className="text-indigo-400" />
              {format(selectedDate, 'MMM d, yyyy')}
            </h2>
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
              {selectedDayEvents.length} Events
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {selectedDayEvents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-gray-600 text-center space-y-2"
                >
                  <CalendarIcon size={32} className="opacity-20" />
                  <p className="text-xs italic">No events scheduled for this day.</p>
                </motion.div>
              ) : (
                selectedDayEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 glass rounded-[24px] space-y-3 border border-white/5 hover:bg-white/10 transition-all group"
                  >
                    <h3 className="font-bold text-sm leading-tight group-hover:text-indigo-400 transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                        <Clock size={12} className="text-indigo-500/50" />
                        {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 italic">
                          <MapPin size={12} className="text-indigo-500/50" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
