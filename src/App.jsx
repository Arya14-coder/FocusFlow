import React, { useState, useEffect, useCallback } from 'react';
import { FlowProvider, useFlow } from './FlowContext';
import Layout from './components/Layout';
import Timer from './components/Timer';
import TodoList from './components/TodoList';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import RatingModal from './components/RatingModal';
import LoginShield from './components/LoginShield';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('timer');
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const { 
    user, 
    loading, 
    timerStatus, 
    mode, 
    setTimerStatus, 
    setMode, 
    addSession, 
    settings, 
    timeLeft, 
    setTimeLeft,
    initialTime,
    sessionCount 
  } = useFlow();

  const handleSessionEnd = useCallback(() => {
    setTimeLeft(settings.focusTime * 60);
    setMode('focus');
    setTimerStatus(settings.autoStartFocus ? 'running' : 'idle');
  }, [settings, setTimeLeft, setMode, setTimerStatus]);

  const handleRatingSave = useCallback((ratingData) => {
    const timeSpentSeconds =
      timeLeft === 0
        ? (initialTime || settings.focusTime * 60)
        : Math.max(initialTime - timeLeft, 1);

    addSession({
      type: 'focus',
      duration: timeSpentSeconds,
      efficiency: ratingData.rating,
      notes: ratingData.notes,
    });

    setIsRatingOpen(false);

    const isLongBreak = (sessionCount + 1) % (settings.longBreakInterval || 4) === 0;
    const nextMode = isLongBreak ? 'long-break' : 'short-break';
    const nextTime = isLongBreak ? settings.longBreak : settings.shortBreak;

    setTimeLeft(nextTime * 60);
    setMode(nextMode);
    setTimerStatus(settings.autoStartBreaks ? 'running' : 'idle');
  }, [settings, sessionCount, timeLeft, initialTime, addSession, setTimeLeft, setMode, setTimerStatus]);

  const handleRatingCancel = useCallback(() => {
    setIsRatingOpen(false);
    
    // Save session with default efficiency of 5 instead of discarding
    const timeSpentSeconds =
      timeLeft === 0
        ? (initialTime || settings.focusTime * 60)
        : Math.max(initialTime - timeLeft, 1);

    addSession({
      type: 'focus',
      duration: timeSpentSeconds,
      efficiency: 5,
      notes: 'No rating provided',
    });

    const isLongBreak = (sessionCount + 1) % (settings.longBreakInterval || 4) === 0;
    const nextMode = isLongBreak ? 'long-break' : 'short-break';
    const nextTime = isLongBreak ? settings.longBreak : settings.shortBreak;

    setTimeLeft(nextTime * 60);
    setMode(nextMode);
    setTimerStatus('idle');
  }, [settings, sessionCount, timeLeft, initialTime, addSession, setTimeLeft, setMode, setTimerStatus]);


  // Gap 14: Update document title
  useEffect(() => {
    if (timerStatus === 'running') {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      document.title = `(${timeStr}) FocusFlow`;
    } else {
      document.title = 'FocusFlow';
    }
  }, [timerStatus, timeLeft]);

  // Watch for session completion
  useEffect(() => {
    if (timerStatus === 'finished' && mode === 'focus') {
      setIsRatingOpen(true);
    } else if (timerStatus === 'finished' && (mode === 'short-break' || mode === 'long-break')) {
      handleSessionEnd();
    }
    // Issue 7: Added handleSessionEnd to deps
  }, [timerStatus, mode, handleSessionEnd]); 


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'timer' && <Timer />}
      
      {activeTab === 'tasks' && (
        user ? <TodoList /> : <LoginShield title="Your Tasks, Everywhere" description="Sign in to save your tasks to the cloud and sync them across all your devices." />
      )}
      
      {activeTab === 'stats' && (
        user ? <Dashboard /> : <LoginShield title="Unlock Your Analytics" description="Track your focus trends, streaks, and productivity insights by signing in." />
      )}
      
      {activeTab === 'settings' && <Settings />}

      <RatingModal 
        isOpen={isRatingOpen} 
        onClose={handleRatingCancel}
        onSave={handleRatingSave}
        sessionType="Focus"
      />
    </Layout>
  );
};

const App = () => (
  <FlowProvider>
    <AppContent />
  </FlowProvider>
);

export default App;
