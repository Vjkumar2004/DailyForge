import Task from '../models/Task.js';
import Room from '../models/Room.js';

const buildTaskFilter = (query) => {
  const filter = {};

  if (query.roomId) {
    filter.roomId = query.roomId;
  }

  if (query.type) {
    filter.type = query.type;
  }

  if (query.status) {
    filter.status = query.status;
  }

  return filter;
};

export const createTask = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.roomId) {
      return res.status(400).json({ success: false, message: 'roomId is required' });
    }

    // Optional: attempt to validate room, but do not block task creation if not found
    try {
      await Room.findOne({
        $or: [{ roomId: payload.roomId }, { _id: payload.roomId }],
      }).lean();
    } catch (e) {
      // ignore lookup errors for now
    }

    const task = await Task.create({
      roomId: payload.roomId,
      createdBy: req.user?._id,
      type: payload.type,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      estimatedTime: payload.estimatedTime,
      verificationMethod: payload.verificationMethod,
      rewardPoints: payload.rewardPoints,
      bonusPointsForStreak: payload.bonusPointsForStreak,
      streakEligible: payload.streakEligible,
      // New optional fields aligned with extended schema
      points: payload.points,
      requirements: payload.requirements,
      specificTaskData: payload.specificTaskData,
      videoData: payload.videoData,
      linkData: payload.linkData,
      readingData: payload.readingData,
      quizData: payload.quizData,
      pomodoroData: payload.pomodoroData,
      mixedData: payload.mixedData,
    });

    return res.status(201).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const filter = buildTaskFilter(req.query);
    const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id).lean();

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;

    const task = await Task.findByIdAndUpdate(id, update, { new: true });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const trackTaskClick = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndUpdate(
      id,
      { $inc: { 'analytics.taskClicks': 1 } },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({ success: true, data: task.analytics });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Engagement-aware completion endpoint used by the new task system
export const completeTaskWithEngagement = async (req, res) => {
  try {
    const user = req.user;
    const {
      taskId,
      // engagement payload from frontend
      watchPercent,
      readPercent,
      activeSeconds,
      correctAnswersCount,
      timeSpentSeconds,
      cheatingDetected,
    } = req.body || {};

    if (!taskId) {
      return res.status(400).json({ success: false, message: 'taskId is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Basic anti-cheat: if frontend detected cheating, block completion
    if (cheatingDetected) {
      return res.status(400).json({
        success: false,
        message: 'Please fully engage with the task to complete it.',
      });
    }

    const reqs = task.requirements || {};
    let meetsRequirements = true;

    if (typeof reqs.minWatchPercent === 'number' && (watchPercent || 0) < reqs.minWatchPercent) {
      meetsRequirements = false;
    }

    if (typeof reqs.minReadPercent === 'number' && (readPercent || 0) < reqs.minReadPercent) {
      meetsRequirements = false;
    }

    if (typeof reqs.minActiveSeconds === 'number' && (activeSeconds || 0) < reqs.minActiveSeconds) {
      meetsRequirements = false;
    }

    if (
      typeof reqs.minCorrectAnswers === 'number' &&
      (correctAnswersCount || 0) < reqs.minCorrectAnswers
    ) {
      meetsRequirements = false;
    }

    if (!meetsRequirements) {
      return res.status(400).json({
        success: false,
        message: 'Please fully engage with the task to complete it.',
      });
    }

    // Prevent duplicate completion rewards
    const userIdStr = user._id.toString();
    const alreadyCompleted = (task.analytics?.usersCompleted || []).some(
      (id) => id.toString() === userIdStr
    );

    if (!task.analytics) {
      task.analytics = {};
    }

    // Update analytics
    task.analytics.completions = (task.analytics.completions || 0) + (alreadyCompleted ? 0 : 1);
    const addTime = timeSpentSeconds || activeSeconds || 0;
    task.analytics.totalCompletionTime =
      (task.analytics.totalCompletionTime || 0) + (alreadyCompleted ? 0 : addTime);
    task.analytics.lastCompletedAt = new Date();

    if (!alreadyCompleted) {
      const usersCompleted = task.analytics.usersCompleted || [];
      usersCompleted.push(user._id);
      task.analytics.usersCompleted = usersCompleted;
    }

    // Derive average time spent
    if ((task.analytics.completions || 0) > 0) {
      task.analytics.avgTimeSpent =
        (task.analytics.totalCompletionTime || 0) / (task.analytics.completions || 1);
    }

    await task.save();

    // Update user points (streak is managed by daily activity, not tasks)
    let pointsToAdd = 0;
    if (!alreadyCompleted) {
      const basePoints = typeof task.points === 'number' ? task.points : task.rewardPoints || 0;
      pointsToAdd = basePoints;
      user.points += pointsToAdd;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      alreadyCompleted,
      pointsAwarded: pointsToAdd,
      user: {
        points: user.points,
        streak: user.streak,
      },
      analytics: task.analytics,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const trackTaskCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { completionTimeSeconds = 0, dropped = false } = req.body || {};

    const update = {
      $inc: {
        'analytics.completions': dropped ? 0 : 1,
        'analytics.totalCompletionTime': dropped ? 0 : completionTimeSeconds,
        'analytics.dropOffs': dropped ? 1 : 0,
      },
    };

    const task = await Task.findByIdAndUpdate(id, update, { new: true });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({ success: true, data: task.analytics });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
