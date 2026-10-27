import React from 'react';

export const PriorityBadge = ({ priority }) => {
  const styles = {
    High: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  };

  const style = styles[priority] || 'bg-slate-700/30 text-slate-400 border-slate-700';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide border ${style}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          priority === 'High'
            ? 'bg-rose-400 animate-pulse'
            : priority === 'Medium'
            ? 'bg-amber-400'
            : 'bg-emerald-400'
        }`}
      />
      {priority}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    Submitted: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'In Progress': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    'Not Started': 'bg-slate-700/30 text-slate-400 border-slate-700/50',
    Completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Planned: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Exploring: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    Brainstorming: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Archived: 'bg-slate-800 text-slate-500 border-slate-700',
  };

  const style = styles[status] || 'bg-slate-800 text-slate-400 border-slate-700';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      {status}
    </span>
  );
};

export const DeadlineIndicator = ({ deadline, isSubmitted = false, warningDays = 3 }) => {
  if (isSubmitted) {
    return (
      <span className="inline-flex items-center text-xs text-emerald-400 font-medium">
        Submitted
      </span>
    );
  }

  const now = new Date();
  const due = new Date(deadline);
  const diffMs = due - now;
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays);
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
        Overdue by {overdueDays === 0 ? `${Math.abs(diffHours)}h` : `${overdueDays}d`}
      </span>
    );
  }

  if (diffDays <= warningDays) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
        Due in {diffDays === 0 ? `${Math.max(1, diffHours)}h` : `${diffDays}d`}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-slate-400 border border-slate-800 bg-slate-900/50">
      Due in {diffDays}d
    </span>
  );
};
