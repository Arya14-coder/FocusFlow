import React from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Sparkles, Square, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlow } from '../FlowContext';
import GuidedBreaks from './GuidedBreaks';

const Timer = () => {
  const { 
    timerStatus, setTimerStatus, mode, setMode, timeLeft, setTimeLeft, settings,
    initialTime, setInitialTime, activeTaskId, tasks
  } = useFlow();

  const playCompletionSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      const playTone = (freq, start, duration, gainVal) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gain.gain.setValueAtTime(0, audioCtx.currentTime + start);
        gain.gain.linearRampToValueAtTime(gainVal, audioCtx.currentTime + start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };

      // A satisfying major triad (A5, C#6, E6)
      playTone(880, 0, 0.5, 0.4);
      playTone(1108.73, 0.08, 0.5, 0.3);
      playTone(1320, 0.16, 0.6, 0.2);
    } catch (e) {
      console.warn('AudioContext not supported or blocked');
    }
  };

  React.useEffect(() => {
    if (timerStatus === 'finished') {
      playCompletionSound();
    }
  }, [timerStatus]);

  const activeTask = tasks.find(t => t.id === activeTaskId);


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timeLeft / (
    (mode === 'focus' ? settings.focusTime : mode === 'short-break' ? settings.shortBreak : settings.longBreak) * 60
  );

  const toggleTimer = () => {
    if (timerStatus === 'idle') {
      setInitialTime(timeLeft);
    }
    setTimerStatus(timerStatus === 'running' ? 'paused' : 'running');
  };

  const endSession = () => {
    setTimerStatus('finished');
  };

  const resetTimer = () => {
    setTimerStatus('idle');
    const mins = mode === 'focus' ? settings.focusTime : mode === 'short-break' ? settings.shortBreak : settings.longBreak;
    setTimeLeft(mins * 60);
  };

  const getTimerSubtext = () => {
    if (timerStatus === 'paused') return 'Paused';
    if (mode === 'focus') return 'Focusing';
    if (mode === 'short-break') return 'Short Break';
    return 'Long Break';
  };


  const isBreak = mode === 'short-break' || mode === 'long-break';

  return (
    <div className="flex flex-col items-center gap-12 mt-8">
      {/* Mode Switcher */}
      <div className="flex gap-2 bg-zinc-200/40 p-1.5 rounded-2xl">
        {[
          { id: 'focus', label: 'Focus', icon: Brain },
          { id: 'short-break', label: 'Short Break', icon: Coffee },
          { id: 'long-break', label: 'Long Break', icon: Sparkles },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMode(m.id);
              setTimerStatus('idle');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === m.id 
              ? 'bg-white text-zinc-900 shadow-md' 
              : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <m.icon className="w-4 h-4" />
            {m.label}
          </button>
        ))}
      </div>

      {/* Visualizer (Timer Circle or Guided Break) */}
      {isBreak ? (
        <div className="flex flex-col items-center justify-center min-h-[320px]">
          <span className="text-6xl md:text-7xl font-black font-outfit tracking-tight text-zinc-900 mb-2">
            {formatTime(timeLeft)}
          </span>
          <GuidedBreaks mode={mode} />
        </div>
      ) : (
        <div className="relative flex items-center justify-center">
          <svg className="w-72 h-72 md:w-80 md:h-80 transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              className="text-zinc-200/50"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="48%"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              animate={{ pathLength: progress }}
              className="text-primary"
              style={{ 
                strokeLinecap: 'round'
              }}
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-7xl md:text-8xl font-black font-outfit tracking-tight text-zinc-900">
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm font-bold text-zinc-400 mt-2 uppercase tracking-widest">
              {getTimerSubtext()}
            </span>
          </div>
        </div>
      )}


      {/* Controls */}
      <div className="flex items-center gap-8">
        <button 
          onClick={resetTimer}
          className="p-4 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200 transition-colors shadow-premium"
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        <button 
          onClick={toggleTimer}
          className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-2xl shadow-primary/30"
        >
          {timerStatus === 'running' ? (
            <Pause className="w-10 h-10 fill-current" />
          ) : (
            <Play className="w-10 h-10 fill-current ml-1" />
          )}
        </button>

        <button 
          onClick={endSession}
          disabled={timerStatus === 'idle'}
          className={`p-4 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200 transition-colors shadow-premium ${
            timerStatus === 'idle' ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          title="End Session"
        >
          <Square className="w-6 h-6 fill-current" />
        </button>
      </div>

      {/* Active Task / Suggestion Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-premium border border-zinc-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center shrink-0">
          {activeTask ? <Target className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
        </div>
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            {activeTask ? 'Active Task' : 'Suggestion'}
          </h3>
          <p className="text-zinc-800 font-bold truncate">
            {activeTask ? activeTask.text : (isBreak ? "Deep breaths, you've earned this." : "Focus on your most impactful task.")}
          </p>
        </div>
      </div>

    </div>
  );
};

export default Timer;
