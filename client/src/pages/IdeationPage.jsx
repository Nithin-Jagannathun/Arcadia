import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Compass,
  FileCheck2,
  Lightbulb,
  Pencil,
  Pin,
  Plus,
  Search,
  Tag,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { StatusBadge } from '../components/Badge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';

export const IdeationPage = () => {
  const [ideas, setIdeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [ideaToConvert, setIdeaToConvert] = useState(null);
  const [convertType, setConvertType] = useState('assignment');
  const [convertCourse, setConvertCourse] = useState('General');
  const [convertDeadline, setConvertDeadline] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Research',
    tags: '',
    planningStatus: 'Brainstorming',
    pinned: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('q', search.trim());
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);

      const res = await api.get(`/ideas?${params.toString()}`);
      if (res.data.success) {
        setIdeas(res.data.data);
        if (res.data.categories) setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to load ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchIdeas();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, statusFilter]);

  const handleTogglePin = async (idea) => {
    try {
      await api.put(`/ideas/${idea._id}`, { pinned: !idea.pinned });
      fetchIdeas();
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleOpenCreateIdea = () => {
    setEditingIdea(null);
    setFormData({
      title: '',
      description: '',
      category: 'Research',
      tags: '',
      planningStatus: 'Brainstorming',
      pinned: false,
    });
    setIdeaModalOpen(true);
  };

  const handleOpenEditIdea = (idea) => {
    setEditingIdea(idea);
    setFormData({
      title: idea.title,
      description: idea.description || '',
      category: idea.category,
      tags: idea.tags ? idea.tags.join(', ') : '',
      planningStatus: idea.planningStatus,
      pinned: idea.pinned,
    });
    setIdeaModalOpen(true);
  };

  const handleSubmitIdea = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editingIdea) {
        await api.put(`/ideas/${editingIdea._id}`, payload);
      } else {
        await api.post('/ideas', payload);
      }
      setIdeaModalOpen(false);
      fetchIdeas();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving idea');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenConvertModal = (idea) => {
    setIdeaToConvert(idea);
    setConvertType('assignment');
    setConvertCourse(idea.category || 'General');
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setConvertDeadline(d.toISOString().slice(0, 16));
    setConvertModalOpen(true);
  };

  const handleConvertIdea = async (e) => {
    e.preventDefault();
    if (!ideaToConvert) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/ideas/${ideaToConvert._id}/convert`, {
        targetType: convertType,
        course: convertCourse,
        deadline: convertDeadline,
      });

      if (res.data.success) {
        setConvertModalOpen(false);
        setSuccessBanner(
          `Idea "${ideaToConvert.title}" converted into ${convertType === 'assignment' ? 'an Assignment' : 'a Goal'} successfully!`
        );
        setTimeout(() => setSuccessBanner(''), 6000);
        fetchIdeas();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to convert idea');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIdea = async () => {
    if (!ideaToDelete) return;
    try {
      await api.delete(`/ideas/${ideaToDelete._id}`);
      fetchIdeas();
    } catch (err) {
      console.error('Failed to delete idea:', err);
    } finally {
      setIdeaToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Academic Ideation Workspace
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Capture thoughts, project concepts, and research topics. Convert them into assignments
            or goals when ready.
          </p>
        </div>
        <button
          onClick={handleOpenCreateIdea}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Idea</span>
        </button>
      </div>

      {/* Success banner */}
      {successBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner('')}
            className="text-xs text-emerald-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ideas by title or notes..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category filter */}
        <div className="w-full md:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Stages</option>
            <option value="Brainstorming">Brainstorming</option>
            <option value="Exploring">Exploring</option>
            <option value="Planned">Planned</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Ideas Grid */}
      {loading ? (
        <LoadingSpinner text="Loading creative thoughts..." />
      ) : ideas.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No ideas logged yet"
          description="Capture interesting research papers, hackathon ideas, or study plans."
          actionText="Create First Idea"
          onAction={handleOpenCreateIdea}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <div
              key={idea._id}
              className={`flex flex-col justify-between rounded-2xl p-5 border transition-all duration-200 relative ${
                idea.pinned
                  ? 'bg-slate-900 border-indigo-500/40 shadow-lg shadow-indigo-950/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Top tags & pin */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    {idea.category}
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <StatusBadge status={idea.planningStatus} />
                    <button
                      onClick={() => handleTogglePin(idea)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        idea.pinned
                          ? 'text-indigo-400 bg-indigo-500/20'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                      }`}
                      title={idea.pinned ? 'Unpin idea' : 'Pin idea'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white mb-2">{idea.title}</h3>

                {/* Notes */}
                {idea.description && (
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line line-clamp-4">
                    {idea.description}
                  </p>
                )}

                {/* Tags */}
                {idea.tags && idea.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {idea.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80"
                      >
                        <Tag className="w-2.5 h-2.5 text-indigo-400" />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleOpenConvertModal(idea)}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Convert to Action</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEditIdea(idea)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit Idea"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIdeaToDelete(idea);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Idea"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT IDEA MODAL */}
      <Modal
        isOpen={ideaModalOpen}
        onClose={() => setIdeaModalOpen(false)}
        title={editingIdea ? 'Edit Idea' : 'Capture New Idea'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmitIdea} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Idea Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Real-time Campus Shuttle Tracker"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Research, Projects, Career"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Planning Stage
              </label>
              <select
                value={formData.planningStatus}
                onChange={(e) => setFormData({ ...formData, planningStatus: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Brainstorming">Brainstorming</option>
                <option value="Exploring">Exploring</option>
                <option value="Planned">Planned</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g. react, node, ai, sem6"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description & Notes
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jot down architectural ideas, references, or action items..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="pinnedCheck"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <label htmlFor="pinnedCheck" className="text-xs text-slate-300 select-none">
              Pin to top of workspace
            </label>
          </div>

          <div className="pt-3 flex justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIdeaModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingIdea ? 'Save Changes' : 'Save Idea'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONVERT IDEA TO ASSIGNMENT OR GOAL MODAL */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title="Convert Idea to Actionable Resource"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConvertIdea} className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Convert <strong className="text-white">"{ideaToConvert?.title}"</strong> into an active
            academic deliverable. The original idea remains in your archive with stage set to "Planned".
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Convert As</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConvertType('assignment')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  convertType === 'assignment'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Assignment</span>
              </button>
              <button
                type="button"
                onClick={() => setConvertType('goal')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  convertType === 'goal'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Long-Term Goal</span>
              </button>
            </div>
          </div>

          {convertType === 'assignment' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Course or Subject
              </label>
              <input
                type="text"
                required
                value={convertCourse}
                onChange={(e) => setConvertCourse(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Deadline
            </label>
            <input
              type="datetime-local"
              required
              value={convertDeadline}
              onChange={(e) => setConvertDeadline(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setConvertModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Converting...' : `Create ${convertType === 'assignment' ? 'Assignment' : 'Goal'}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteIdea}
        title="Delete Idea"
        message={`Are you sure you want to permanently delete "${ideaToDelete?.title}"?`}
        confirmText="Delete Idea"
      />
    </div>
  );
};
