import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Settings as SettingsIcon,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CONFIG_AREAS } from './config/areas';
import AreaView from './components/AreaView';
import GeneralDashboard from './components/GeneralDashboard';
import Settings from './components/Settings';
import LockScreen from './components/LockScreen';
import Login from './pages/Login';
import { useAuth } from './components/AuthContext';
import { db, doc, getDoc, onSnapshot } from './firebase';

export default function App() {
  const { user, loading, logout } = useAuth();
  const [activeAreaId, setActiveAreaId] = useState<string | 'dashboard' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);

  React.useEffect(() => {
    if (!user) return;

    // Listen to user settings in Firestore
    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setUserSettings(doc.data());
      }
    });

    // Check if was locked before
    const locked = localStorage.getItem('isLocked') === 'true';
    if (locked) setIsLocked(true);

    return () => unsub();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-[#00ff9d]/20 border-t-[#00ff9d] rounded-full animate-spin" />
        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest animate-pulse">Iniciando_Sistema...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const activeArea = CONFIG_AREAS.find(a => a.id === activeAreaId);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex text-[13px]">
      <AnimatePresence>
        {isLocked && (
          <LockScreen 
            userName={userSettings?.displayName || user.displayName || 'Valente'} 
            onUnlock={() => {
              setIsLocked(false);
              localStorage.setItem('isLocked', 'false');
            }} 
          />
        )}
      </AnimatePresence>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`bg-black/40 backdrop-blur-xl border-r border-white/10 transition-all duration-300 flex flex-col z-50 fixed inset-y-0 left-0 lg:sticky lg:h-screen ${
          isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <h1 className="font-bold text-xl tracking-tighter text-[#00ff9d] drop-shadow-[0_0_8px_rgba(0,255,157,0.5)]">
                {userSettings?.displayName?.toUpperCase().split(' ')[0] || 'LIFE'}_OS
              </h1>
              <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest mt-1 truncate max-w-[160px]">
                {userSettings?.email || 'SISTEMA_ATIVO'}
              </p>
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-[#00ff9d]"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <button
            onClick={() => setActiveAreaId('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
              activeAreaId === 'dashboard' 
                ? 'bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/20 shadow-[0_0_15px_rgba(0,255,157,0.1)]' 
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
            }`}
          >
            <LayoutDashboard size={20} className={activeAreaId === 'dashboard' ? 'text-[#00ff9d]' : 'group-hover:text-[#00ff9d] transition-colors'} />
            {isSidebarOpen && <span className="font-mono text-xs tracking-widest uppercase">Visão Geral</span>}
          </button>

          <div className={`pt-4 pb-2 px-4 text-[9px] font-mono font-bold text-gray-600 uppercase tracking-[0.3em] ${!isSidebarOpen && 'hidden'}`}>
            Áreas_Da_Vida
          </div>

          {CONFIG_AREAS.map((area) => (
            <button
              key={area.id}
              onClick={() => setActiveAreaId(area.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                activeAreaId === area.id 
                  ? 'bg-white/10 text-white border border-white/10' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <span className="text-xl w-5 flex justify-center">{area.icon}</span>
              {isSidebarOpen && <span className="font-mono text-xs tracking-widest uppercase truncate">{area.nome}</span>}
              {activeAreaId === area.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{ backgroundColor: area.cor }} />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-3 px-4 py-2 mb-2 bg-white/5 rounded-xl border border-white/5 overflow-hidden">
             <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10 ring-2 ring-[#00ff9d]/20">
               {user.photoURL ? (
                 <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-blue-500 flex items-center justify-center"><UserIcon size={14} /></div>
               )}
             </div>
             {isSidebarOpen && (
               <div className="flex flex-col min-w-0">
                 <span className="text-[10px] font-bold text-white truncate">{user.displayName}</span>
                 <span className="text-[8px] font-mono text-gray-500 truncate uppercase mt-0.5">Sessão_Ativa</span>
               </div>
             )}
          </div>

          <button 
            onClick={() => setActiveAreaId('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeAreaId === 'settings' 
                ? 'bg-white/10 text-white border border-white/10' 
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
            }`}
          >
            <SettingsIcon size={20} className={activeAreaId === 'settings' ? 'text-[#00d4ff]' : 'group-hover:text-[#00d4ff] transition-colors'} />
            {isSidebarOpen && <span className="font-mono text-xs tracking-widest uppercase">Configurações</span>}
          </button>

          <button 
            onClick={() => {
              logout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-500 hover:bg-red-500/10 hover:text-red-500 group"
          >
            <LogOut size={20} className="group-hover:text-red-500 transition-colors" />
            {isSidebarOpen && <span className="font-mono text-xs tracking-widest uppercase">Efetuar Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        <div className="scanline" />
        <header className="bg-black/20 backdrop-blur-md sticky top-0 z-30 border-b border-white/5 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-[#00ff9d]"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Sistema_Online</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-[#00d4ff]" />
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Core_v3.1.0</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-[#00ff9d] uppercase tracking-[0.3em] font-bold">SYSTEM_TIME</p>
              <p className="text-xs font-mono text-gray-400">{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Valente" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAreaId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeAreaId === 'dashboard' ? (
                <GeneralDashboard onNavigate={setActiveAreaId} />
              ) : activeAreaId === 'settings' ? (
                <Settings />
              ) : activeArea ? (
                <AreaView config={activeArea} />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
