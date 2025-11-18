import mongoose from 'mongoose';

// Quiz schema supporting multiple correct answers
const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2,
        message: 'Each question must have at least 2 options',
      },
    },
    correctAnswers: {
      type: [Number],
      default: [],
    },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

// Legacy combined specificTaskData kept for backward compatibility with existing UI
const specificTaskDataSchema = new mongoose.Schema(
  {
    // Link task (legacy)
    url: { type: String, trim: true },
    requiredActiveTime: { type: Number },
    minimumScrollDepth: { type: Boolean },

    // Video task (legacy)
    videoUrl: { type: String, trim: true },
    requiredWatchDuration: { type: Number },
    autoplayEnabled: { type: Boolean },

    // Reading task (legacy)
    contentUrl: { type: String, trim: true },
    articleText: { type: String },
    requiredReadingDuration: { type: Number },

    // Quiz task (legacy)
    numberOfQuestions: { type: Number },
    questions: { type: [quizQuestionSchema], default: [] },
    passingPercentage: { type: Number },
  },
  { _id: false }
);

// New per-type data blocks (more structured)
const videoDataSchema = new mongoose.Schema(
  {
    videoUrl: { type: String, trim: true },
    duration: { type: Number }, // seconds
  },
  { _id: false }
);

const linkDataSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    minSeconds: { type: Number },
  },
  { _id: false }
);

const readingDataSchema = new mongoose.Schema(
  {
    content: { type: String },
    minReadPercent: { type: Number },
  },
  { _id: false }
);

const quizDataSchema = new mongoose.Schema(
  {
    questions: { type: [quizQuestionSchema], default: [] },
    minCorrectAnswers: { type: Number },
  },
  { _id: false }
);

const pomodoroDataSchema = new mongoose.Schema(
  {
    requiredMinutes: { type: Number },
  },
  { _id: false }
);

const mixedSubtaskSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['link', 'video', 'reading', 'quiz', 'pomodoro'],
      required: true,
    },
    // For now store a loose config object; can be refined later per type
    config: { type: Object, default: {} },
  },
  { _id: false }
);

const mixedDataSchema = new mongoose.Schema(
  {
    subtasks: { type: [mixedSubtaskSchema], default: [] },
  },
  { _id: false }
);

const analyticsSchema = new mongoose.Schema(
  {
    // Existing fields
    taskClicks: { type: Number, default: 0 },
    completions: { type: Number, default: 0 },
    totalCompletionTime: { type: Number, default: 0 }, // in seconds
    dropOffs: { type: Number, default: 0 },

    // Extended analytics
    starts: { type: Number, default: 0 },
    avgTimeSpent: { type: Number, default: 0 },
    usersCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    lastOpenedAt: { type: Date },
    lastCompletedAt: { type: Date },
  },
  { _id: false }
);

const requirementsSchema = new mongoose.Schema(
  {
    minWatchPercent: { type: Number },
    minReadPercent: { type: Number },
    minActiveSeconds: { type: Number },
    minCorrectAnswers: { type: Number },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['link', 'video', 'reading', 'quiz', 'pomodoro', 'mixed'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true },
    estimatedTime: { type: Number }, // in minutes

    verificationMethod: {
      type: String,
      enum: ['time', 'quiz', 'both', 'none'],
      default: 'none',
    },

    // Legacy points fields used by existing UI
    rewardPoints: { type: Number, default: 0 },
    bonusPointsForStreak: { type: Number, default: 0 },
    streakEligible: { type: Boolean, default: true },

    // New points field aligned with prompt (optional)
    points: { type: Number },

    status: { type: String, enum: ['active', 'archived'], default: 'active' },

    // Global requirements
    requirements: requirementsSchema,

    // Legacy combined data
    specificTaskData: specificTaskDataSchema,

    // New structured per-type data
    videoData: videoDataSchema,
    linkData: linkDataSchema,
    readingData: readingDataSchema,
    quizData: quizDataSchema,
    pomodoroData: pomodoroDataSchema,
    mixedData: mixedDataSchema,

    analytics: analyticsSchema,
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.model('Task', taskSchema);
