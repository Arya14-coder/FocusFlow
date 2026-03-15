import React from 'react';
import { Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFlow } from '../FlowContext';

const LoginShield = ({ title, description }) => {
  const { login } = useFlow();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/50 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl"
    >
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Lock className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 mb-2">{title}</h2>
      <p className="text-zinc-500 mb-8 max-w-xs">{description}</p>
      
      <button
        onClick={login}
        className="flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-2xl font-semibold hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
      >
        <LogIn className="w-5 h-5" />
        Sign in with Google
      </button>
      
      <p className="mt-6 text-xs text-zinc-400">
        Your data will be synced securely across all your devices.
      </p>
    </motion.div>
  );
};

export default LoginShield;
