import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, X } from 'lucide-react';

const RatingModal = ({ isOpen, onClose, onSave, sessionType }) => {
  const [rating, setRating] = useState(8);
  const [notes, setNotes] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(8);
      setNotes('');
    }
  }, [isOpen]);


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-outfit text-zinc-900">Session Complete!</h2>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-zinc-500 mb-8">
            Great job! How would you rate your focus level during this {sessionType} session?
          </p>

          <div className="space-y-8">
            {/* Rating Slider */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Efficiency</span>
                <span className="text-4xl font-black text-primary font-outfit">{rating}<span className="text-zinc-200">/10</span></span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Optional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What went well? Any distractions?"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px] resize-none"
              />
            </div>

            <button
              onClick={() => onSave({ rating, notes, timestamp: new Date().toISOString() })}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Save Session
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RatingModal;
