import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    course: {
      type: String,
      required: [true, 'Course or subject name is required'],
      trim: true,
      maxlength: [60, 'Course cannot exceed 60 characters'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Submitted'],
      default: 'Not Started',
      index: true,
    },
    type: {
      type: String,
      enum: ['Individual', 'Group'],
      default: 'Individual',
    },
    estimatedHours: {
      type: Number,
      default: 1,
      min: [0, 'Estimated hours must be non-negative'],
      max: [500, 'Estimated hours cannot exceed 500'],
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      default: null,
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ user: 1, deadline: 1 });
assignmentSchema.index({ user: 1, status: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
