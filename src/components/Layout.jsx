import React, { useState } from 'react';
import { Timer, ListTodo, BarChart3, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlow } from '../FlowContext';

const Layout = ({ children, activeTab, setActiveTab }) => {
  const { user, login, logout, loading } = useFlow();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const tabs = [
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'stats', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <Timer className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-outfit">
            Focus<span className="text-primary">Flow</span>
          </h1>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-1 bg-zinc-200/50 p-1 rounded-2xl backdrop-blur-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-800 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Auth Button/Profile */}
          <div className="relative">
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-zinc-200 animate-pulse" />
            ) : user ? (
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden hover:border-primary transition-colors"
              >
                <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
              </button>
            ) : (
              <button 
                onClick={login}
                className="hidden md:block px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                Sign In
              </button>
            )}

            <AnimatePresence>
              {isProfileOpen && user && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-zinc-100 p-2 z-50"
                >
                  <div className="px-3 py-2 border-b border-zinc-50 mb-1">
                    <p className="text-sm font-semibold truncate">{user.displayName}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-2xl flex-1 flex flex-col pb-24 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 md:hidden bg-zinc-900 text-white rounded-3xl px-6 py-4 shadow-2xl flex gap-8 backdrop-blur-lg border border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === tab.id ? 'text-primary scale-110' : 'text-zinc-400'
            }`}
          >
            <tab.icon className="w-6 h-6" />
          </button>
        ))}
        {/* Mobile Sign In if not logged in */}
        {!user && !loading && (
          <button onClick={login} className="flex flex-col items-center gap-1 text-zinc-400">
            <LogOut className="w-6 h-6 rotate-180" />
          </button>
        )}
      </nav>
    </div>
  );
};

export default Layout;
