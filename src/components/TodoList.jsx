import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, CheckCircle2, Circle, Trash2, ListTodo, ChevronDown,
  AlignLeft, Target, Pencil, X, Check, Minus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlow } from '../FlowContext';

// ─── Pom Selector Dots ────────────────────────────────────────────────
const PomSelector = ({ value, onChange, max = 8 }) => (
  <div className="flex items-center gap-1.5">
    <button
      type="button"
      onClick={() => onChange(Math.max(1, value - 1))}
      className="w-6 h-6 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors"
    >
      <Minus className="w-3 h-3" />
    </button>
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          className={`w-3 h-3 rounded-full transition-all ${
            i < value ? 'bg-primary scale-100' : 'bg-zinc-200 hover:bg-zinc-300 scale-90'
          }`}
        />
      ))}
    </div>
    <button
      type="button"
      onClick={() => onChange(Math.min(max, value + 1))}
      className="w-6 h-6 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors"
    >
      <Plus className="w-3 h-3" />
    </button>
    <span className="text-[11px] font-bold text-zinc-400 ml-1">{value} pom{value !== 1 ? 's' : ''}</span>
  </div>
);

// ─── Auto-resize Textarea ─────────────────────────────────────────────
const AutoTextarea = ({ value, onChange, placeholder, className = '' }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={2}
      className={`resize-none overflow-hidden ${className}`}
    />
  );
};

// ─── Task Card ────────────────────────────────────────────────────────
const TaskCard = ({ task, onToggle, onDelete, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editPoms, setEditPoms] = useState(task.poms || 1);

  const saveEdit = () => {
    if (!editText.trim()) return;
    onUpdate(task.id, {
      text: editText.trim(),
      description: editDesc.trim(),
      poms: editPoms,
    });
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditText(task.text);
    setEditDesc(task.description || '');
    setEditPoms(task.poms || 1);
    setEditing(false);
  };

  const pomProgress = task.poms > 0 ? (task.completedPoms / task.poms) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`bg-white rounded-[1.4rem] border border-zinc-100 shadow-sm hover:shadow-premium transition-all overflow-hidden ${
        task.completed ? 'opacity-50' : ''
      }`}
    >
      {/* ── Main Row ─── */}
      <div className="flex items-start gap-3 p-4 sm:p-5">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 shrink-0 transition-all ${
            task.completed ? 'text-zinc-300' : 'text-primary hover:scale-110'
          }`}
        >
          {task.completed
            ? <CheckCircle2 className="w-6 h-6" />
            : <Circle className="w-6 h-6" />}
        </button>

        {/* Content */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => !editing && setExpanded(!expanded)}
        >
          <p className={`font-semibold text-[15px] leading-snug transition-all ${
            task.completed ? 'line-through text-zinc-400' : 'text-zinc-800'
          }`}>
            {task.text}
          </p>

          {/* Description preview */}
          {task.description && !expanded && (
            <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{task.description}</p>
          )}

          {/* Pom dots & progress */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-1">
              {Array.from({ length: task.poms || 1 }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < (task.completedPoms || 0) ? 'bg-primary' : 'bg-zinc-200'
                  }`}
                />
              ))}
            </div>
            {task.poms > 1 && (
              <span className="text-[10px] font-bold text-zinc-300">
                {task.completedPoms || 0}/{task.poms}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {!task.completed && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditing(!editing); setExpanded(true); }}
              className="p-2 text-zinc-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-zinc-300 hover:text-zinc-500 rounded-xl transition-all"
          >
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* ── Expanded Section ─── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 ml-9 border-t border-zinc-50">
              {editing ? (
                /* ── Edit Mode ─── */
                <div className="flex flex-col gap-3 pt-4">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Task title"
                  />
                  <AutoTextarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Add a description..."
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <div>
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Estimated Pomodoros</span>
                    <PomSelector value={editPoms} onChange={setEditPoms} />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={saveEdit}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:scale-[1.02] transition-transform"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ── View Mode ─── */
                <div className="pt-4 flex flex-col gap-2">
                  {task.description ? (
                    <p className="text-sm text-zinc-500 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                  ) : (
                    <p className="text-sm text-zinc-300 italic">No description</p>
                  )}
                  {/* Progress bar */}
                  {task.poms > 1 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(pomProgress)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pomProgress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main TodoList ────────────────────────────────────────────────────
const TodoList = () => {
  const { tasks, addTask, toggleTask, deleteTask, updateTask } = useFlow();
  const [inputValue, setInputValue] = useState('');
  const [descValue, setDescValue] = useState('');
  const [showDesc, setShowDesc] = useState(false);
  const [pomCount, setPomCount] = useState(1);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      try {
        await addTask({
          text: inputValue.trim(),
          description: descValue.trim(),
          poms: pomCount,
        });
        setInputValue('');
        setDescValue('');
        setShowDesc(false);
        setPomCount(1);
      } catch (err) {
        console.error('Error adding task from UI:', err);
      }
    }
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="flex flex-col gap-6 mt-4 pb-24">
      {/* ── Add Task Form ────────────── */}
      <form onSubmit={handleAdd} className="bg-white rounded-[1.6rem] shadow-premium border border-zinc-100 overflow-hidden">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What are you working on?"
            className="w-full px-6 py-5 focus:outline-none text-[15px] font-medium text-zinc-800 placeholder-zinc-300 pr-28"
          />
          <div className="absolute right-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowDesc(!showDesc)}
              className={`p-2.5 rounded-xl transition-all ${
                showDesc ? 'bg-primary/10 text-primary' : 'text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50'
              }`}
              title="Add description"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collapsible description + poms */}
        <AnimatePresence>
          {showDesc && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-5 flex flex-col gap-3 border-t border-zinc-50 pt-4">
                <AutoTextarea
                  value={descValue}
                  onChange={(e) => setDescValue(e.target.value)}
                  placeholder="Add a description or notes..."
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                    <Target className="w-3 h-3 inline mr-1" />Estimated Pomodoros
                  </span>
                  <PomSelector value={pomCount} onChange={setPomCount} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* ── Active Tasks ─────────────── */}
      {activeTasks.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">
            Active — {activeTasks.length}
          </span>
          <AnimatePresence initial={false}>
            {activeTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onUpdate={updateTask}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Completed Tasks ──────────── */}
      {completedTasks.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">
            Completed — {completedTasks.length}
          </span>
          <AnimatePresence initial={false}>
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onUpdate={updateTask}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Empty State ──────────────── */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-4">
          <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center">
            <ListTodo className="w-10 h-10 opacity-30" />
          </div>
          <p className="font-medium">No tasks yet. Start by adding one!</p>
        </div>
      )}
    </div>
  );
};

export default TodoList;
