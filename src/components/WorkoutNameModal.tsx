import React, { useState, useEffect } from 'react';

interface WorkoutNameModalProps {
  isOpen: boolean;
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
}

export function WorkoutNameModal({ isOpen, onSave, onCancel }: WorkoutNameModalProps) {
  const [workoutName, setWorkoutName] = useState('');
  const [description, setDescription] = useState('');

  // Reset inputs when modal closes
  useEffect(() => {
    if (!isOpen) {
      setWorkoutName('');
      setDescription('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (workoutName.trim()) {
      onSave(workoutName.trim(), description.trim());
      setWorkoutName('');
      setDescription('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-background dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-6 animate-fade-in">
        <h3 className="text-lg font-semibold mb-4 text-foreground dark:text-gray-100">
          Name Your Workout
        </h3>
        <input
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          autoFocus
          placeholder="Workout name"
          className="w-full mb-4 rounded-md border border-border bg-input px-3 py-2 text-foreground placeholder:text-muted-foreground dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <label
          htmlFor="description"
          className="block mb-1 text-sm font-medium text-foreground dark:text-gray-300"
        >
          Description (optional)
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description for your workout..."
          className="w-full mb-6 rounded-md border border-border bg-input px-3 py-2 text-foreground placeholder:text-muted-foreground dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md px-4 py-2 font-medium text-muted-foreground hover:text-destructive dark:hover:text-red-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!workoutName.trim()}
            className={`rounded-md px-4 py-2 font-semibold text-white ${
              workoutName.trim()
                ? 'bg-primary hover:bg-primary/90 dark:bg-primary/90'
                : 'bg-primary/50 cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
