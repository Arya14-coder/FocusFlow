import React, { useState, useEffect } from 'react';
import { useFlow } from '../FlowContext';
import { Save, Bell, Zap, Clock, Target } from 'lucide-react';

// Editable number input – lets you freely clear & type, commits on blur
const NumberInput = ({ value, min = 1, max = 120, onChange }) => {
  const [draft, setDraft] = useState(String(value));

  // Sync when the external value changes (e.g. from Firestore)
  useEffect(() => { setDraft(String(value)); }, [value]);

  const commit = () => {
    const n = parseInt(draft);
    const clamped = isNaN(n) ? min : Math.max(min, Math.min(max, n));
    setDraft(String(clamped));
    onChange(clamped);
  };

  return (
    <input
      type="number"
      value={draft}
      min={min}
      max={max}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && commit()}
      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-zinc-800"
    />
  );
};

const Settings = () => {
  const { settings, setSettings } = useFlow();

  const handleUpdate = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="flex flex-col gap-8 mt-4 pb-20">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-zinc-50 flex flex-col gap-8">
        <h3 className="text-xl font-bold font-outfit text-zinc-900 border-b border-zinc-100 pb-4">
          Timer Preferences
        </h3>

        {/* Time Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4" /> Focus
            </label>
            <div className="flex items-center gap-3">
              <NumberInput value={settings.focusTime} min={1} max={120} onChange={(v) => handleUpdate('focusTime', v)} />
              <span className="text-zinc-400 font-medium">min</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4" /> Short Break
            </label>
            <div className="flex items-center gap-3">
              <NumberInput value={settings.shortBreak} min={1} max={60} onChange={(v) => handleUpdate('shortBreak', v)} />
              <span className="text-zinc-400 font-medium">min</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4" /> Long Break
            </label>
            <div className="flex items-center gap-3">
              <NumberInput value={settings.longBreak} min={1} max={60} onChange={(v) => handleUpdate('longBreak', v)} />
              <span className="text-zinc-400 font-medium">min</span>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest block mb-4">Goals</label>
          
          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-bold text-zinc-800">Daily Focus Goal</p>
                <p className="text-xs text-zinc-400">Target focus minutes per day</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20">
                <NumberInput value={settings.dailyGoal || 120} min={30} max={480} onChange={(v) => handleUpdate('dailyGoal', v)} />
              </div>
              <span className="text-zinc-400 font-medium">min</span>
            </div>
          </div>
        </div>

        {/* Behavior */}
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest block mb-4">Behavior</label>
          
          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-secondary" />
              <div>
                <p className="font-bold text-zinc-800">Auto-start Breaks</p>
                <p className="text-xs text-zinc-400">Timer will automatically start breaks</p>
              </div>
            </div>
            <button 
              onClick={() => handleUpdate('autoStartBreaks', !settings.autoStartBreaks)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                settings.autoStartBreaks ? 'bg-primary' : 'bg-zinc-200'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                settings.autoStartBreaks ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-accent" />
              <div>
                <p className="font-bold text-zinc-800">Auto-start Focus</p>
                <p className="text-xs text-zinc-400">Timer will automatically start focus sessions</p>
              </div>
            </div>
            <button 
              onClick={() => handleUpdate('autoStartFocus', !settings.autoStartFocus)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                settings.autoStartFocus ? 'bg-primary' : 'bg-zinc-200'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                settings.autoStartFocus ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="font-bold text-zinc-800">Long Break Interval</p>
                <p className="text-xs text-zinc-400">Sessions before a long break</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20">
                <NumberInput value={settings.longBreakInterval || 4} min={1} max={12} onChange={(v) => handleUpdate('longBreakInterval', v)} />
              </div>
              <span className="text-zinc-400 font-medium">poms</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
