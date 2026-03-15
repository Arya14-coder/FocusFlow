import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Coffee, Brain, Footprints, Droplets, Laptop, Sparkles, RefreshCw } from 'lucide-react';

const activities = {
  short: [
    {
      id: 'box-breathing',
      title: 'Box Breathing',
      icon: Wind,
      description: 'Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s.',
      type: 'breathing',
    },
    {
      id: 'eye-rest',
      title: '20-20-20 Rule',
      icon: Brain,
      description: 'Look at something 20 feet away for 20 seconds to rest your eyes.',
      type: 'static',
    },
    {
      id: 'hydration',
      title: 'Hydration Check',
      icon: Droplets,
      description: 'Drink a glass of water to stay hydrated and refreshed.',
      type: 'static',
    },
    {
      id: 'desk-stretch',
      title: 'Quick Stretch',
      icon: Sparkles,
      description: 'Stretch your arms and neck to release tension.',
      type: 'static',
    }
  ],
  long: [
    {
      id: 'walk',
      title: 'Take a Short Walk',
      icon: Footprints,
      description: 'Walk around for a bit to get your blood flowing.',
      type: 'static',
    },
    {
      id: 'snack',
      title: 'Healthy Snack',
      icon: Coffee,
      description: 'Grab a healthy snack to refuel your energy.',
      type: 'static',
    },
    {
      id: 'screen-free',
      title: 'Screen-Free Zone',
      icon: Laptop,
      description: 'Step away from all screens to give your eyes a true break.',
      type: 'static',
    }
  ]
};

const BreathingAnimation = () => {
  const [phase, setPhase] = useState('Inhale'); // Inhale, Hold, Exhale, Hold

  useEffect(() => {
    let currentPhase = 'Inhale';
    const interval = setInterval(() => {
      switch (currentPhase) {
        case 'Inhale': currentPhase = 'Hold'; break;
        case 'Hold': currentPhase = 'Exhale'; break;
        case 'Exhale': currentPhase = 'Hold Empty'; break;
        case 'Hold Empty': currentPhase = 'Inhale'; break;
        default: currentPhase = 'Inhale';
      }
      setPhase(currentPhase);
    }, 4000); // 4 seconds per phase

    return () => clearInterval(interval);
  }, []);

  const getScale = () => {
    switch (phase) {
      case 'Inhale': return 1.5;
      case 'Hold': return 1.5;
      case 'Exhale': return 1;
      case 'Hold Empty': return 1;
      default: return 1;
    }
  };

  const getOpacity = () => {
    switch (phase) {
      case 'Inhale': return 1;
      case 'Hold': return 0.8;
      case 'Exhale': return 0.5;
      case 'Hold Empty': return 0.3;
      default: return 1;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-48 py-8">
      <div className="relative flex items-center justify-center w-32 h-32">
        <motion.div
          animate={{ scale: getScale(), opacity: getOpacity() }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="absolute w-20 h-20 bg-primary/20 rounded-full"
        />
        <motion.div
          animate={{ scale: getScale() * 0.8, opacity: getOpacity() }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="absolute w-20 h-20 bg-primary/40 rounded-full"
        />
        <div className="z-10 text-center">
          <span className="text-sm font-bold text-primary tracking-widest uppercase">
            {phase.replace('Empty', '')}
          </span>
        </div>
      </div>
    </div>
  );
};


const GuidedBreaks = ({ mode }) => {
  const [activity, setActivity] = useState(null);
  const lastShortId = useRef(null);
  const lastLongId = useRef(null);

  const shuffleActivity = useCallback(() => {
    const list = mode === 'short-break' ? activities.short : activities.long;
    const lastId = mode === 'short-break' ? lastShortId.current : lastLongId.current;

    let availableActivities = list.filter(a => a.id !== lastId);
    if (availableActivities.length === 0) availableActivities = list; // fallback

    const randomActivity = availableActivities[Math.floor(Math.random() * availableActivities.length)];

    if (mode === 'short-break') lastShortId.current = randomActivity.id;
    else lastLongId.current = randomActivity.id;

    setActivity(randomActivity);
  }, [mode]);



  useEffect(() => {
    shuffleActivity();
  }, [shuffleActivity]);

  if (!activity) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activity.id}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm mx-auto bg-white/50 backdrop-blur-md rounded-3xl p-6 shadow-premium border border-white/40 flex flex-col items-center text-center mt-6"
      >
        <div className="flex justify-between items-start w-full">
          <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-secondary/20 text-primary rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <activity.icon className="w-7 h-7" />
          </div>
          <button 
            onClick={shuffleActivity}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
            title="Get another recommendation"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        
        <h3 className="text-xl font-bold text-zinc-800 mb-2">{activity.title}</h3>
        <p className="text-zinc-500 font-medium leading-relaxed">{activity.description}</p>
        
        {activity.type === 'breathing' && (
          <div className="w-full mt-2">
            <BreathingAnimation />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default GuidedBreaks;
