import mongoose from 'mongoose';

const mcqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2,
        message: 'MCQ must have at least two options',
      },
    },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const taskLinkSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    requiredWatchTime: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    mcq: { type: [mcqSchema], default: [] },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    privacy: { type: String, enum: ['public', 'private'], default: 'public' },
    title: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskLinks: { type: [taskLinkSchema], default: [] },
    taskPoints: { type: Number, default: 15 },
    dailyBonusPoints: { type: Number, default: 60 },
    streakMultiplier: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    joinedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

roomSchema.index({ category: 1 });
roomSchema.index({ createdAt: -1 });
roomSchema.index({ privacy: 1 });

export default mongoose.model('Room', roomSchema);
