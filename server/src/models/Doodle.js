import mongoose from 'mongoose';

const doodleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Doodle name is required'],
      trim: true,
      maxlength: [80, 'Doodle name cannot exceed 80 characters'],
      default: 'Untitled Doodle',
    },
    gridSize: {
      type: Number,
      enum: [16, 24, 32],
      default: 16,
    },
    gridData: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

doodleSchema.index({ user: 1, updatedAt: -1 });

const Doodle = mongoose.model('Doodle', doodleSchema);
export default Doodle;
