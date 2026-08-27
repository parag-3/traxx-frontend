"use client";

import { useState } from "react";
import { Habit, HabitType, HabitStatusOption, AggregationType } from "@/types/habit";
import { X, Plus, Trash2, CheckCircle2, Sparkles, BookOpen, Dumbbell, Droplets, Heart, Flame, Target, Brain, Coffee, Trophy } from "lucide-react";

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editHabit?: Habit | null;
}

const COLOR_PALETTE = [
  "#6366F1", // Indigo
  "#3B82F6", // Blue
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#14B8A6", // Teal
  "#F59E0B", // Amber
  "#EF4444", // Red/Rose
  "#EC4899", // Pink
  "#8B5CF6", // Violet
  "#64748B", // Slate
];

const ICONS = [
  { name: "CheckCircle", icon: CheckCircle2, label: "Check" },
  { name: "BookOpen", icon: BookOpen, label: "Book" },
  { name: "Dumbbell", icon: Dumbbell, label: "Fitness" },
  { name: "Droplets", icon: Droplets, label: "Water" },
  { name: "Sparkles", icon: Sparkles, label: "Mind" },
  { name: "Heart", icon: Heart, label: "Health" },
  { name: "Flame", icon: Flame, label: "Streak" },
  { name: "Target", icon: Target, label: "Goal" },
  { name: "Brain", icon: Brain, label: "Focus" },
  { name: "Coffee", icon: Coffee, label: "Routine" },
  { name: "Trophy", icon: Trophy, label: "Milestone" },
];

const DEFAULT_STATUS_PRESETS = {
  progress3: [
    { label: "Not Started", value: "NOT_STARTED", color: "#94A3B8", order: 0, isCompleted: false },
    { label: "In Progress", value: "IN_PROGRESS", color: "#3B82F6", order: 1, isCompleted: false },
    { label: "Completed", value: "COMPLETED", color: "#10B981", order: 2, isCompleted: true },
  ],
  binary: [
    { label: "Missed", value: "MISSED", color: "#EF4444", order: 0, isCompleted: false },
    { label: "Done", value: "DONE", color: "#10B981", order: 1, isCompleted: true },
  ],
  rating: [
    { label: "Poor", value: "POOR", color: "#EF4444", order: 0, isCompleted: false },
    { label: "Average", value: "AVERAGE", color: "#F59E0B", order: 1, isCompleted: false },
    { label: "Good", value: "GOOD", color: "#3B82F6", order: 2, isCompleted: true },
    { label: "Excellent", value: "EXCELLENT", color: "#10B981", order: 3, isCompleted: true },
  ],
};

export function CreateHabitModal({ isOpen, onClose, onSuccess, editHabit }: CreateHabitModalProps) {
  const [type, setType] = useState<HabitType>(editHabit?.type || "NUMERICAL");
  const [title, setTitle] = useState(editHabit?.title || "");
  const [description, setDescription] = useState(editHabit?.description || "");
  const [category, setCategory] = useState(editHabit?.category || "General");
  const [color, setColor] = useState(editHabit?.color || "#6366F1");
  const [icon, setIcon] = useState(editHabit?.icon || "CheckCircle");
  
  // Numerical fields
  const [unit, setUnit] = useState(editHabit?.unit || "pages");
  const [targetValue, setTargetValue] = useState(editHabit?.targetValue?.toString() || "30");
  const [aggregationType, setAggregationType] = useState<AggregationType>(editHabit?.aggregationType || "SUM");

  // Custom Status fields
  const [statusOptions, setStatusOptions] = useState<HabitStatusOption[]>(
    editHabit?.statusOptions && editHabit.statusOptions.length > 0
      ? editHabit.statusOptions
      : DEFAULT_STATUS_PRESETS.progress3
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddStatusOption = () => {
    const nextIdx = statusOptions.length + 1;
    setStatusOptions([
      ...statusOptions,
      {
        label: `Status ${nextIdx}`,
        value: `STATUS_${nextIdx}`,
        color: COLOR_PALETTE[(nextIdx - 1) % COLOR_PALETTE.length] || "#3B82F6",
        order: statusOptions.length,
        isCompleted: false,
      },
    ]);
  };

  const handleRemoveStatusOption = (index: number) => {
    if (statusOptions.length <= 1) {
      setError("Must have at least 1 status option");
      return;
    }
    const updated = statusOptions.filter((_, i) => i !== index);
    setStatusOptions(updated.map((opt, i) => ({ ...opt, order: i })));
  };

  const handleStatusChange = (index: number, field: keyof HabitStatusOption, val: any) => {
    const updated = [...statusOptions];
    const opt = updated[index];
    if (opt) {
      if (field === "label") {
        opt.label = val;
        opt.value = val.toUpperCase().replace(/\s+/g, "_");
      } else {
        (opt as any)[field] = val;
      }
      setStatusOptions(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a habit title");
      return;
    }

    if (type === "NUMERICAL") {
      if (!unit.trim()) {
        setError("Please provide a unit for numerical habits (e.g. pages, km, mins, ml)");
        return;
      }
      if (!targetValue || isNaN(parseFloat(targetValue)) || parseFloat(targetValue) <= 0) {
        setError("Please provide a positive target value");
        return;
      }
    }

    if (type === "STATUS") {
      if (statusOptions.length < 2) {
        setError("Please define at least 2 status options for enum habits");
        return;
      }
    }

    try {
      setLoading(true);
      const payload: any = {
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || "General",
        color,
        icon,
        type,
      };

      if (type === "NUMERICAL") {
        payload.unit = unit.trim();
        payload.targetValue = parseFloat(targetValue);
        payload.aggregationType = aggregationType;
      } else {
        payload.statusOptions = statusOptions;
      }

      const url = editHabit
        ? `http://localhost:3001/api/habits/${editHabit.id}`
        : "http://localhost:3001/api/habits";
      const method = editHabit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save habit");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800/60 sticky top-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md z-10">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {editHabit ? "Edit Habit" : "Create New Habit"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {type === "NUMERICAL" ? "Track numbers, units, sums & averages" : "Track custom color-coded status states"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Type Selector (Numerical vs Custom Status) */}
          {!editHabit && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Habit Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("NUMERICAL")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    type === "NUMERICAL"
                      ? "border-blue-500/80 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="font-semibold text-sm">🔢 Numerical Habit</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Quantities, units (pages, km, ml, mins), sum & avg stats
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setType("STATUS")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    type === "STATUS"
                      ? "border-purple-500/80 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="font-semibold text-sm">🏷️ Custom Status / Enum</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Custom enum values (e.g. Done, Progress, Skipped) with custom colors
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Habit Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Read Non-Fiction Books"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Learning"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why this habit matters..."
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </div>

          {/* Color & Icon Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Habit Accent Color
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === c ? "scale-125 ring-2 ring-offset-2 ring-zinc-900 dark:ring-white dark:ring-offset-zinc-950" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Icon
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ICONS.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setIcon(item.name)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                        icon === item.name
                          ? "border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-black"
                          : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                      }`}
                      title={item.label}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Numerical Config */}
          {type === "NUMERICAL" && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Numerical Settings
                </span>
                <span className="text-[11px] text-zinc-400">Target & Aggregations</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Daily Target *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="30"
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Unit * (Must have)
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="pages, km, ml, mins"
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Stats Summary
                  </label>
                  <select
                    value={aggregationType}
                    onChange={(e) => setAggregationType(e.target.value as AggregationType)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SUM">SUM (Total over period)</option>
                    <option value="AVERAGE">AVERAGE (Daily average)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Custom Status / Enum Config */}
          {type === "STATUS" && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Custom Enum / Status States & Colors
                </span>
                {/* Presets */}
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-zinc-400">Presets:</span>
                  <button
                    type="button"
                    onClick={() => setStatusOptions(DEFAULT_STATUS_PRESETS.progress3)}
                    className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    3-State
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusOptions(DEFAULT_STATUS_PRESETS.binary)}
                    className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    Yes/No
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusOptions(DEFAULT_STATUS_PRESETS.rating)}
                    className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    Rating
                  </button>
                </div>
              </div>

              {/* Status List */}
              <div className="space-y-2.5">
                {statusOptions.map((opt, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2.5 p-2 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                  >
                    {/* Color Swatch Picker */}
                    <div className="relative group flex items-center justify-center">
                      <input
                        type="color"
                        value={opt.color}
                        onChange={(e) => handleStatusChange(index, "color", e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                        title="Pick custom color"
                      />
                    </div>

                    {/* Label Input */}
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) => handleStatusChange(index, "label", e.target.value)}
                      placeholder="Status Label"
                      className="flex-1 px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />

                    {/* Counts as Completed Toggle */}
                    <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer whitespace-nowrap px-1">
                      <input
                        type="checkbox"
                        checked={opt.isCompleted}
                        onChange={(e) => handleStatusChange(index, "isCompleted", e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-emerald-500 focus:ring-emerald-400"
                      />
                      <span>Counts as Goal</span>
                    </label>

                    {/* Delete Option */}
                    <button
                      type="button"
                      onClick={() => handleRemoveStatusOption(index)}
                      className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"
                      title="Remove status"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddStatusOption}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Status State
              </button>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : editHabit ? "Update Habit" : "Create Habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
