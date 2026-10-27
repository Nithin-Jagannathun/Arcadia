import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Compass,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';

export const MilestonesPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Academics',
    targetDate: '',
    status: 'In Progress',
    milestones: [],
  });
  const [newMilestoneInput, setNewMilestoneInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/goals');
      if (res.data.success) {
        setGoals(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleToggleMilestone = async (goalId, milestoneId) => {
    try {
      await api.patch(`/goals/${goalId}/milestones/${milestoneId}/toggle`);
      fetchGoals();
    } catch (err) {
      console.error('Failed to toggle milestone:', err);
    }
  };

  const handleOpenCreateGoal = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      category: 'Academics',
      targetDate: '',
      status: 'In Progress',
      milestones: [
        { title: 'Project requirements & literature review', completed: false },
        { title: 'System architecture design & prototype', completed: false },
        { title: 'Implementation and user testing', completed: false },
      ],
    });
    setGoalModalOpen(true);
  };

  const handleOpenEditGoal = (goal) => {
    setEditingGoal(goal);
    const targetDateStr = goal.targetDate
      ? new Date(goal.targetDate).toISOString().slice(0, 10)
      : '';
    setFormData({
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      targetDate: targetDateStr,
      status: goal.status,
      milestones: goal.milestones.map((m) => ({
        _id: m._id,
        title: m.title,
        completed: m.completed,
      })),
    });
    setGoalModalOpen(true);
  };

  const handleAddMilestoneToForm = () => {
    if (!newMilestoneInput.trim()) return;
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { title: newMilestoneInput.trim(), completed: false }],
    });
    setNewMilestoneInput('');
  };

  const handleRemoveMilestoneFromForm = (index) => {
    const updated = [...formData.milestones];
    updated.splice(index, 1);
    setFormData({ ...formData, milestones: updated });
  };

  const handleSubmitGoalForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingGoal) {
        await api.put(`/goals/${editingGoal._id}`, formData);
      } else {
        await api.post('/goals', formData);
      }
      setGoalModalOpen(false);
      fetchGoals();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return;
    try {
      await api.delete(`/goals/${goalToDelete._id}`);
      fetchGoals();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    } finally {
      setGoalToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Goal Roadmap & Milestones
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Break long-term academic, research, and career milestones into actionable progression.
          </p>
        </div>
        <button
          onClick={handleOpenCreateGoal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading roadmaps..." />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No goals established yet"
          description="Create your first goal to visualize semester roadmaps and milestone progression."
          actionText="Create First Goal"
          onAction={handleOpenCreateGoal}
        />
      ) : (
        <div className="space-y-6">
          {goals.map((goal) => {
            const total = goal.totalMilestones || goal.milestones.length;
            const completed =
              goal.completedMilestones || goal.milestones.filter((m) => m.completed).length;
            const progress = goal.progress || (total > 0 ? Math.round((completed / total) * 100) : 0);

            return (
              <div
                key={goal._id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 hover:border-slate-700/80 transition-all"
              >
                {/* Goal Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2.5 mb-1.5">
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                        {goal.category}
                      </span>
                      <StatusBadge status={goal.status} />
                      {goal.targetDate && (
                        <span className="text-xs text-slate-400 flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 self-end sm:self-start">
                    <button
                      onClick={() => handleOpenEditGoal(goal)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Goal"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setGoalToDelete(goal);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">
                      Overall Roadmap Completion ({completed} of {total} milestones)
                    </span>
                    <span className="font-bold text-indigo-400 text-sm">{progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Vertical Milestone Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Milestone Progression Timeline
                  </h4>

                  {goal.milestones.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No milestones defined yet.</p>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                      {goal.milestones.map((m, idx) => (
                        <div key={m._id || idx} className="relative flex items-start space-x-3 group">
                          {/* Dot / Checkbox */}
                          <button
                            onClick={() => handleToggleMilestone(goal._id, m._id)}
                            className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer z-10 ${
                              m.completed
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-500/20'
                                : 'bg-slate-900 border-2 border-slate-600 hover:border-indigo-400'
                            }`}
                            title="Click to toggle milestone completion"
                          >
                            {m.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Circle className="w-2 h-2 text-transparent" />
                            )}
                          </button>

                          <div
                            onClick={() => handleToggleMilestone(goal._id, m._id)}
                            className={`flex-1 p-3 rounded-xl border transition-colors cursor-pointer ${
                              m.completed
                                ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs sm:text-sm font-semibold ${
                                  m.completed ? 'line-through text-slate-500' : 'text-slate-200'
                                }`}
                              >
                                {m.title}
                              </span>
                              {m.completedAt && (
                                <span className="text-[10px] text-emerald-400 font-medium">
                                  Completed {new Date(m.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {m.description && (
                              <p className="text-xs text-slate-500 mt-1">{m.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Linked Assignments */}
                {goal.linkedAssignments && goal.linkedAssignments.length > 0 && (
                  <div className="pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Linked Academic Assignments ({goal.linkedAssignments.length})</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {goal.linkedAssignments.map((a) => (
                        <div
                          key={a._id}
                          className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-white truncate">{a.title}</p>
                            <span className="text-[10px] text-indigo-400 uppercase font-semibold">
                              {a.course}
                            </span>
                          </div>
                          <PriorityBadge priority={a.priority} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT GOAL MODAL */}
      <Modal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title={editingGoal ? 'Edit Goal' : 'Create New Goal'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmitGoalForm} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Complete Final Year Capstone Project"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Academics">Academics</option>
                <option value="Career">Career</option>
                <option value="Projects">Projects</option>
                <option value="Personal">Personal</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="In Progress">In Progress</option>
                <option value="Not Started">Not Started</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description & Purpose
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Why this goal matters and what success looks like..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Milestones list in form */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Milestones Roadmap
            </label>
            <div className="space-y-2 mb-3">
              {formData.milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <span className="truncate flex-1 pr-2">
                    {idx + 1}. {m.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestoneFromForm(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add milestone inline input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMilestoneInput}
                onChange={(e) => setNewMilestoneInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMilestoneToForm();
                  }
                }}
                placeholder="Add next sequential milestone..."
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddMilestoneToForm}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
              >
                Add
              </button>
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setGoalModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingGoal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteGoal}
        title="Delete Goal"
        message={`Are you sure you want to delete "${goalToDelete?.title}"? Linked assignments will not be deleted but will become unlinked.`}
        confirmText="Delete Goal"
      />
    </div>
  );
};
