import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
      maxlength: [100, 'Milestone title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    targetDate: {
      type: Date,
      default: null,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [120, 'Goal title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['Academics', 'Career', 'Personal', 'Projects', 'Custom'],
      default: 'Academics',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'In Progress',
    },
    milestones: [milestoneSchema],
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ user: 1, status: 1 });

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
