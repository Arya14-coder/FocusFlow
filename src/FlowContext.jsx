import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { auth, db, googleProvider } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  addDoc,
  limit,
  serverTimestamp 
} from 'firebase/firestore';

const FlowContext = createContext(null);

const DEFAULT_SETTINGS = {
  focusTime: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStartBreaks: true,
  autoStartFocus: false,
  longBreakInterval: 4,
  dailyGoal: 120,
};

export const FlowProvider = ({ children }) => {
  // Auth State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firestore Data State
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Runtime Timer State
  const [timerStatus, setTimerStatus] = useState('idle');
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focusTime * 60);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [initialTime, setInitialTime] = useState(0);

  // Initialize or retrieve a tab-specific session ID
  const tabSessionId = useMemo(() => {
    let id = sessionStorage.getItem('focus_flow_tab_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('focus_flow_tab_id', id);
    }
    return id;
  }, []);

  // Derive sessionCount: focus sessions in the current "sitting" (this tab + <1h gap)
  const sessionCount = useMemo(() => {
    // 1. Only consider sessions from THIS tab session
    const sessionsThisTab = sessions.filter(s => s.tabSessionId === tabSessionId);
    
    // 2. Find the most recent long break IN THIS TAB
    const lastLongBreakIdx = sessionsThisTab.findIndex(s => s.type === 'long-break');
    const sinceLongBreak = lastLongBreakIdx === -1 ? sessionsThisTab : sessionsThisTab.slice(0, lastLongBreakIdx);
    
    if (sinceLongBreak.length === 0) return 0;

    const GAP_THRESHOLD = 60 * 60 * 1000; // 1 hour
    let sittingFocusCount = 0;

    for (let i = 0; i < sinceLongBreak.length; i++) {
      const current = sinceLongBreak[i];
      const nextInPast = sinceLongBreak[i + 1];

      if (current.type === 'focus') {
        sittingFocusCount++;
      }

      // Check gap with the PREVIOUS session in time (the next one in the array which is ordered desc)
      if (nextInPast) {
        const currentTime = new Date(current.timestamp).getTime();
        const nextTime = new Date(nextInPast.timestamp).getTime();
        if (currentTime - nextTime > GAP_THRESHOLD) {
          break; // Gap too large, end of "sitting"
        }
      }
    }

    return sittingFocusCount;
  }, [sessions, tabSessionId]);


  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (!user) {
        // Reset data if logged out
        setTasks([]);
        setSessions([]);
        setSettings(DEFAULT_SETTINGS);
      }
    });
    return unsubscribe;
  }, []);

  // Firestore Sync
  useEffect(() => {
    if (!user) return;

    // Sync Tasks
    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const qTasks = query(tasksRef, orderBy('createdAt', 'desc'));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Sync Sessions (with limit to prevent unbounded growth)
    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    const qSessions = query(sessionsRef, orderBy('timestamp', 'desc'), limit(500));
    const unsubSessions = onSnapshot(qSessions, (snapshot) => {
      setSessions(snapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp;
        return { id: doc.id, ...data, timestamp };
      }));
    });


    // Sync Settings
    const settingsRef = doc(db, 'users', user.uid, 'config', 'settings');
    const unsubSettings = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // Only update if data actually changed to avoid unnecessary re-renders/loop
        setSettings(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
      } else {
        // Init settings for new user
        setDoc(settingsRef, DEFAULT_SETTINGS);
      }
    });

    return () => {
      unsubTasks();
      unsubSessions();
      unsubSettings();
    };
  }, [user]);

  // Sync timer when settings/mode change
  // Only reset on 'idle' – NOT on 'finished', because the rating modal
  // still needs the real timeLeft to compute session duration.
  useEffect(() => {
    if (timerStatus === 'idle') {
      const mins = mode === 'focus' 
        ? settings.focusTime 
        : mode === 'short-break' 
          ? settings.shortBreak 
          : settings.longBreak;
      const seconds = mins * 60;
      setTimeLeft(seconds);
      setInitialTime(seconds); // Bug 2 fix: sync initialTime with starting time
    }
  }, [mode, settings, timerStatus]);

  // Timer Countdown logic
  useEffect(() => {
    let interval = null;
    if (timerStatus === 'running' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerStatus === 'running') {
      setTimerStatus('finished');
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerStatus, timeLeft]);

  // Auth Actions
  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Firebase Authentication Error:', err.code, err.message);
      // You could also set an error state here to show in the UI if desired
      throw err;
    }
  };
  const logout = () => signOut(auth);

  // Task Actions
  const addTask = async ({ text, description = '', poms = 1 }) => {
    if (!user) return;
    try {
      const tasksRef = collection(db, 'users', user.uid, 'tasks');
      await addDoc(tasksRef, {
        text,
        description,
        completed: false,
        poms: Math.max(1, Math.min(8, poms)),
        completedPoms: 0,
        createdAt: serverTimestamp(), // Standardized to serverTimestamp
      });
    } catch (err) {
      console.error('Error adding task:', err);
      throw err;
    }
  };


  const updateTask = async (id, updates) => {
    if (!user) return;
    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', id);
      await updateDoc(taskRef, updates);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const toggleTask = async (id) => {
    if (!user) return;
    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', id);
      const task = tasks.find(t => t.id === id);
      const isCompleting = !task.completed;
      
      if (isCompleting && activeTaskId === id) {
        setActiveTaskId(null);
      }
      
      await updateDoc(taskRef, { completed: isCompleting });
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };


  const deleteTask = async (id) => {
    if (!user) return;
    // Gap 11: Optimistic UI
    const originalTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
    } catch (err) {
      console.error('Failed to delete task:', err);
      setTasks(originalTasks); // Revert on failure
    }
  };

  const incrementTaskPom = async (id) => {
    if (!user) return;
    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', id);
      const task = tasks.find(t => t.id === id);
      await updateDoc(taskRef, { completedPoms: task.completedPoms + 1 });
    } catch (err) {
      console.error('Error incrementing pom:', err);
    }
  };

  // Session Actions
  const addSession = async (sessionData) => {
    if (!user) return;
    try {
      const sessionsRef = collection(db, 'users', user.uid, 'sessions');
      await addDoc(sessionsRef, {
        ...sessionData,
        taskId: activeTaskId,
        tabSessionId, // Track which tab this belongs to
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error adding session:', err);
    }
  };


  const updateSettings = async (newSettings) => {
    if (JSON.stringify(newSettings) === JSON.stringify(settings)) return;
    
    setSettings(newSettings);
    if (!user) return;
    try {
      const settingsRef = doc(db, 'users', user.uid, 'config', 'settings');
      await setDoc(settingsRef, newSettings);
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    tasks,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    incrementTaskPom,
    activeTaskId,
    setActiveTaskId,
    sessions,
    addSession,
    settings,
    setSettings: updateSettings,
    timerStatus,
    setTimerStatus,
    mode,
    setMode,
    timeLeft,
    setTimeLeft,
    sessionCount,
    initialTime,
    setInitialTime,
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) throw new Error('useFlow must be used within FlowProvider');
  return context;
};
