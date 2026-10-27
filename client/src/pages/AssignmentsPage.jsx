import {
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { DeadlineIndicator, PriorityBadge, StatusBadge } from '../components/Badge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export const AssignmentsPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search state
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('deadline_asc');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    deadline: '',
    priority: 'Medium',
    status: 'Not Started',
    type: 'Individual',
    estimatedHours: 1,
    goalId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Load assignments with active filters
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('q', search.trim());
      if (courseFilter) params.append('course', courseFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (sortBy) params.append('sort', sortBy);

      const res = await api.get(`/assignments?${params.toString()}`);
      if (res.data.success) {
        setAssignments(res.data.data);
        if (res.data.courses) setCourses(res.data.courses);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available goals for linking
  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      if (res.data.success) {
        setGoals(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssignments();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, courseFilter, priorityFilter, statusFilter, typeFilter, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setCourseFilter('');
    setPriorityFilter('');
    setStatusFilter('');
    setTypeFilter('');
    setSortBy('deadline_asc');
  };

  const handleOpenCreateModal = () => {
    setEditingAssignment(null);
    setFormData({
      title: '',
      description: '',
      course: '',
      deadline: '',
      priority: 'Medium',
      status: 'Not Started',
      type: 'Individual',
      estimatedHours: 2,
      goalId: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (assignment) => {
    setEditingAssignment(assignment);
    const deadlineStr = assignment.deadline
      ? new Date(assignment.deadline).toISOString().slice(0, 16)
      : '';
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      course: assignment.course,
      deadline: deadlineStr,
      priority: assignment.priority,
      status: assignment.status,
      type: assignment.type,
      estimatedHours: assignment.estimatedHours || 1,
      goalId: assignment.goalId?._id || assignment.goalId || '',
    });
    setModalOpen(true);
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/assignments/${id}`, { status: newStatus });
      fetchAssignments();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        goalId: formData.goalId ? formData.goalId : null,
      };

      if (editingAssignment) {
        await api.put(`/assignments/${editingAssignment._id}`, payload);
      } else {
        await api.post('/assignments', payload);
      }
      setModalOpen(false);
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    try {
      await api.delete(`/assignments/${assignmentToDelete._id}`);
      fetchAssignments();
    } catch (err) {
      console.error('Failed to delete assignment:', err);
    } finally {
      setAssignmentToDelete(null);
    }
  };

  const warningDays = user?.deadlineWarningDays || 3;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Academic Assignments
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Organize coursework, track submissions, and monitor upcoming deadlines.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments by title, course, or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Course filter */}
          <div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Submitted">Submitted</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Type filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Types</option>
              <option value="Individual">Individual</option>
              <option value="Group">Group</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="deadline_asc">Deadline: Earliest First</option>
              <option value="deadline_desc">Deadline: Latest First</option>
              <option value="priority_desc">Priority: High to Low</option>
              <option value="createdAt_desc">Recently Created</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div>
            <button
              onClick={handleResetFilters}
              className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg font-medium transition-colors cursor-pointer border border-slate-700/50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Assignments List / Empty State */}
      {loading ? (
        <LoadingSpinner text="Filtering assignments..." />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No assignments match your criteria"
          description={
            search || courseFilter || statusFilter || priorityFilter || typeFilter
              ? 'Try adjusting your filters or search keywords.'
              : 'You have not added any assignments yet. Keep your coursework on track!'
          }
          actionText={
            search || courseFilter || statusFilter || priorityFilter || typeFilter
              ? 'Clear All Filters'
              : 'Add First Assignment'
          }
          onAction={
            search || courseFilter || statusFilter || priorityFilter || typeFilter
              ? handleResetFilters
              : handleOpenCreateModal
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment) => {
            const isSubmitted = assignment.status === 'Submitted';

            return (
              <div
                key={assignment._id}
                className={`flex flex-col justify-between bg-slate-900/80 border rounded-2xl p-5 hover:border-slate-700 transition-all ${
                  isSubmitted ? 'border-slate-800/60 opacity-80' : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Top tags: Course, Type, Priority */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20 uppercase tracking-wider">
                      {assignment.course}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{assignment.type}</span>
                      </span>
                      <PriorityBadge priority={assignment.priority} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-base font-bold text-white mt-1 ${
                      isSubmitted ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {assignment.title}
                  </h3>

                  {/* Description */}
                  {assignment.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {assignment.description}
                    </p>
                  )}

                  {/* Linked Goal tag */}
                  {assignment.goalId && (
                    <div className="mt-2.5 inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-950 text-indigo-300 border border-slate-800">
                      <Layers className="w-3 h-3 text-indigo-400" />
                      <span>Goal: {assignment.goalId.title}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
                  {/* Deadline & Status row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-300">
                        {new Date(assignment.deadline).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <DeadlineIndicator
                      deadline={assignment.deadline}
                      isSubmitted={isSubmitted}
                      warningDays={warningDays}
                    />
                  </div>

                  {/* Quick Status selector & Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <select
                      value={assignment.status}
                      onChange={(e) => handleQuickStatusChange(assignment._id, e.target.value)}
                      className="text-xs px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Submitted">Submitted</option>
                    </select>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(assignment)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Assignment"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setAssignmentToDelete(assignment);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT ASSIGNMENT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Operating Systems Kernel Assignment"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Course or Subject *
              </label>
              <input
                type="text"
                required
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                placeholder="e.g. CS302"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Deadline Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Submitted">Submitted</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Individual">Individual</option>
                <option value="Group">Group</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Effort (Hours)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Link to Goal (Optional)
              </label>
              <select
                value={formData.goalId}
                onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">None (Independent)</option>
                {goals.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.title} ({g.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description & Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Rubric notes, submission portal links, group members, etc."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingAssignment ? 'Save Changes' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteAssignment}
        title="Delete Assignment"
        message={`Are you sure you want to permanently delete "${assignmentToDelete?.title}"? This cannot be undone.`}
        confirmText="Delete Assignment"
      />
    </div>
  );
};
