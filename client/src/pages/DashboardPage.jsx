import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Flag,
  ListTodo,
  Plus,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { DeadlineIndicator, PriorityBadge, StatusBadge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      pending: 0,
      dueSoon: 0,
      overdue: 0,
      completedThisWeek: 0,
      warningDays: 3,
    },
    overdue: [],
    upcomingWarning: [],
    focusList: [],
    activeGoals: [],
  });

  // Quick Action Modal states
  const [quickAssignmentOpen, setQuickAssignmentOpen] = useState(false);
  const [quickGoalOpen, setQuickGoalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Quick assignment form
  const [assignTitle, setAssignTitle] = useState('');
  const [assignCourse, setAssignCourse] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('');
  const [assignPriority, setAssignPriority] = useState('Medium');

  // Quick goal form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('Academics');
  const [goalMilestoneTitle, setGoalMilestoneTitle] = useState('');

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/assignments/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickStatusUpdate = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'Submitted' ? 'In Progress' : 'Submitted';
      await api.put(`/assignments/${id}`, { status: nextStatus });
      fetchDashboardData();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleCreateQuickAssignment = async (e) => {
    e.preventDefault();
    if (!assignTitle || !assignCourse || !assignDeadline) return;
    setSubmitting(true);
    try {
      await api.post('/assignments', {
        title: assignTitle,
        course: assignCourse,
        deadline: assignDeadline,
        priority: assignPriority,
      });
      setQuickAssignmentOpen(false);
      setAssignTitle('');
      setAssignCourse('');
      setAssignDeadline('');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateQuickGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle) return;
    setSubmitting(true);
    try {
      const milestones = goalMilestoneTitle.trim()
        ? [{ title: goalMilestoneTitle.trim(), completed: false }]
        : [];
      await api.post('/goals', {
        title: goalTitle,
        category: goalCategory,
        milestones,
      });
      setQuickGoalOpen(false);
      setGoalTitle('');
      setGoalMilestoneTitle('');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating goal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Analyzing your academic agenda..." />;
  }

  const { stats, overdue, upcomingWarning, focusList, activeGoals } = data;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Here is what requires your focus right now. Warning window is set to{' '}
            <span className="text-indigo-400 font-semibold">{stats.warningDays} days</span>.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setQuickAssignmentOpen(true)}
            className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Assignment</span>
          </button>
          <button
            onClick={() => setQuickGoalOpen(true)}
            className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{stats.pending}</span>
            <span className="text-xs text-slate-400">assignments</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Active academic tasks</div>
        </div>

        {/* Due Soon */}
        <div className="bg-slate-900/70 border border-amber-500/20 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Due Soon
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">{stats.dueSoon}</span>
            <span className="text-xs text-amber-400/80">&lt; {stats.warningDays} days</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Requires prompt attention</div>
        </div>

        {/* Overdue */}
        <div className="bg-slate-900/70 border border-rose-500/20 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Overdue
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-300">{stats.overdue}</span>
            <span className="text-xs text-rose-400/80">passed deadline</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Past target date</div>
        </div>

        {/* Completed This Week */}
        <div className="bg-slate-900/70 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Submitted
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
              {stats.completedThisWeek}
            </span>
            <span className="text-xs text-emerald-400/80">this week</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Great productivity momentum!</div>
        </div>
      </div>

      {/* OVERDUE STRIP - Never silently hidden */}
      {overdue.length > 0 && (
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-5 shadow-lg shadow-rose-950/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-rose-200">
                  Overdue Assignments ({overdue.length})
                </h3>
                <p className="text-xs text-rose-300/70">
                  These deadlines have passed and require immediate submission.
                </p>
              </div>
            </div>
            <Link
              to="/assignments?status=Not+Started"
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline"
            >
              View in Assignments
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdue.map((item) => (
              <div
                key={item._id}
                className="bg-slate-900/90 border border-rose-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                      {item.course}
                    </span>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                  <div className="mt-2 flex items-center justify-between">
                    <DeadlineIndicator
                      deadline={item.deadline}
                      isSubmitted={item.status === 'Submitted'}
                      warningDays={stats.warningDays}
                    />
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleQuickStatusUpdate(item._id, item.status)}
                    className="text-xs font-semibold px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
                  >
                    Mark as Submitted
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPCOMING DEADLINE STRIP - Sorted by urgency */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Upcoming Deadline Strip (Next {stats.warningDays} Days)
              </h3>
              <p className="text-xs text-slate-400">
                Sorted by closest urgency. Excludes already submitted work.
              </p>
            </div>
          </div>
          <Link
            to="/assignments"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            All Assignments →
          </Link>
        </div>

        {upcomingWarning.length === 0 ? (
          <div className="p-6 text-center bg-slate-950/40 rounded-xl border border-slate-800/50">
            <Sparkles className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">
              No assignments approaching deadlines within {stats.warningDays} days!
            </p>
            <p className="text-xs text-slate-500 mt-1">
              You're in good shape. Check your long-term goals or start future assignments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingWarning.map((item) => (
              <div
                key={item._id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                      {item.course}
                    </span>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                  <div className="mt-2.5 flex items-center justify-between">
                    <DeadlineIndicator
                      deadline={item.deadline}
                      isSubmitted={item.status === 'Submitted'}
                      warningDays={stats.warningDays}
                    />
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(item.deadline).toLocaleDateString()}</span>
                  </span>
                  <button
                    onClick={() => handleQuickStatusUpdate(item._id, item.status)}
                    className="font-medium text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    Quick Submit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TWO COLUMN SECTION: Today's Focus & Milestone Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Focus (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Today's Focus</h3>
                <p className="text-xs text-slate-400">
                  Priority-weighted queue of urgent & high-impact academic work
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400 px-2 py-0.5 rounded-md bg-slate-800">
              Top {focusList.length}
            </span>
          </div>

          {focusList.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Focus queue clear"
              description="No pressing assignments pending right now. Great time to ideate or relax in Doodle Studio!"
              actionText="Add Assignment"
              onAction={() => setQuickAssignmentOpen(true)}
            />
          ) : (
            <div className="space-y-2.5">
              {focusList.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800/90 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1 pr-3">
                    <button
                      onClick={() => handleQuickStatusUpdate(item._id, item.status)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        item.status === 'Submitted'
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-600 hover:border-indigo-400'
                      }`}
                      title="Toggle submission status"
                    >
                      {item.status === 'Submitted' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4
                          className={`text-sm font-semibold truncate ${
                            item.status === 'Submitted'
                              ? 'line-through text-slate-500'
                              : 'text-white'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[11px] font-medium text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20 shrink-0">
                          {item.course}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <DeadlineIndicator
                          deadline={item.deadline}
                          isSubmitted={item.status === 'Submitted'}
                          warningDays={stats.warningDays}
                        />
                        {item.estimatedHours > 0 && (
                          <span className="text-slate-500">~{item.estimatedHours}h effort</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2">
                    <PriorityBadge priority={item.priority} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Milestone Roadmap Overview (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Active Goals</h3>
                  <p className="text-xs text-slate-400">Long-term academic and career roadmaps</p>
                </div>
              </div>
              <Link
                to="/milestones"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Roadmap →
              </Link>
            </div>

            {activeGoals.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No active goals"
                description="Set a target like 'Complete Semester 6 Project' or 'Prepare for Placements'."
                actionText="Create Goal"
                onAction={() => setQuickGoalOpen(true)}
              />
            ) : (
              <div className="space-y-3.5">
                {activeGoals.map((goal) => {
                  const total = goal.milestones.length;
                  const completed = goal.milestones.filter((m) => m.completed).length;
                  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                  const nextMilestone = goal.milestones.find((m) => !m.completed);

                  return (
                    <div
                      key={goal._id}
                      className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{goal.title}</span>
                        <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                          {goal.category}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>
                            {completed} of {total} milestones
                          </span>
                          <span className="font-semibold text-indigo-300">{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {nextMilestone && (
                        <div className="text-xs text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/50 flex items-start space-x-2">
                          <span className="text-indigo-400 shrink-0 font-bold">Next:</span>
                          <span className="text-slate-300 line-clamp-1">
                            {nextMilestone.title}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-center">
            <Link
              to="/milestones"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Open Complete Goals & Milestones Roadmap →
            </Link>
          </div>
        </div>
      </div>

      {/* QUICK ADD ASSIGNMENT MODAL */}
      <Modal
        isOpen={quickAssignmentOpen}
        onClose={() => setQuickAssignmentOpen(false)}
        title="Quick Add Assignment"
      >
        <form onSubmit={handleCreateQuickAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              value={assignTitle}
              onChange={(e) => setAssignTitle(e.target.value)}
              placeholder="e.g. Distributed Systems Lab 3"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Course / Subject *
              </label>
              <input
                type="text"
                required
                value={assignCourse}
                onChange={(e) => setAssignCourse(e.target.value)}
                placeholder="e.g. CS401"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={assignPriority}
                onChange={(e) => setAssignPriority(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Deadline Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={assignDeadline}
              onChange={(e) => setAssignDeadline(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setQuickAssignmentOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK ADD GOAL MODAL */}
      <Modal
        isOpen={quickGoalOpen}
        onClose={() => setQuickGoalOpen(false)}
        title="Quick Add Goal"
      >
        <form onSubmit={handleCreateQuickGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              required
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g. Master Machine Learning Fundamentals"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category
            </label>
            <select
              value={goalCategory}
              onChange={(e) => setGoalCategory(e.target.value)}
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
              First Key Milestone (Optional)
            </label>
            <input
              type="text"
              value={goalMilestoneTitle}
              onChange={(e) => setGoalMilestoneTitle(e.target.value)}
              placeholder="e.g. Finish Stanford CS229 lecture notes"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setQuickGoalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
