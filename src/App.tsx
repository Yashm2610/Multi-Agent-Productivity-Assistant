import React, { Component } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getDocFromServer, doc } from 'firebase/firestore';
import { Sidebar } from './components/Sidebar';
import { Chat } from './components/Chat';
import { Dashboard } from './components/Dashboard';
import { TasksView } from './components/TasksView';
import { CalendarView } from './components/CalendarView';
import { NotesView } from './components/NotesView';
import { Auth } from './components/Auth';
import { Bot, AlertTriangle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white p-6 text-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">System Malfunction</h1>
          <p className="text-gray-400 mb-6 max-w-md">Nexus encountered a critical error. This might be due to configuration issues or network connectivity.</p>
          <pre className="bg-white/5 p-4 rounded-xl text-xs font-mono text-red-400 mb-6 max-w-lg overflow-auto">
            {JSON.stringify(this.state.error, null, 2)}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-full hover:bg-indigo-500 transition-colors"
          >
            <RefreshCcw size={18} />
            Reboot System
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = React.useState<any>(null);
  const [isAuthReady, setIsAuthReady] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('dashboard');

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });

    // Test Firestore connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error: any) {
        if (error.message?.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    return unsub;
  }, []);

  if (!isAuthReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A]">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4"
        >
          <Bot size={32} className="text-white" />
        </motion.div>
        <div className="text-gray-500 font-mono text-xs tracking-widest uppercase">Initializing Nexus...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] p-6 relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full glass p-10 rounded-[40px] text-center space-y-8 relative z-10"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
            <Bot size={40} className="text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Nexus</h1>
            <p className="text-gray-400 leading-relaxed">The unified intelligence for your tasks, schedule, and knowledge.</p>
          </div>
          <div className="pt-4">
            <Auth />
          </div>
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Secure Multi-Agent Environment</div>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Nexus Orchestrator</span>
              <span className="w-1 h-1 rounded-full bg-gray-700" />
              <span className="text-xs font-medium text-gray-400 capitalize">{activeTab}</span>
            </div>
            <Auth />
          </header>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {activeTab === 'dashboard' && <Dashboard />}
                  {activeTab === 'tasks' && <TasksView />}
                  {activeTab === 'calendar' && <CalendarView />}
                  {activeTab === 'notes' && <NotesView />}
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="w-96 flex-shrink-0">
              <Chat />
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

