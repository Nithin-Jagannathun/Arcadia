import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Idea title is required'],
      trim: true,
      maxlength: [140, 'Idea title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    planningStatus: {
      type: String,
      enum: ['Brainstorming', 'Exploring', 'Planned', 'Archived'],
      default: 'Brainstorming',
      index: true,
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ideaSchema.index({ user: 1, pinned: -1, updatedAt: -1 });

const Idea = mongoose.model('Idea', ideaSchema);
export default Idea;
