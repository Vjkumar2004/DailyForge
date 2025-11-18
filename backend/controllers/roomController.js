import mongoose from 'mongoose';
import Room from '../models/Room.js';
import User from '../models/User.js';

const generateRoomId = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DF${random}`;
};

const normaliseTaskLinks = (taskLinks) => {
  if (!Array.isArray(taskLinks)) return [];

  return taskLinks.map((task) => {
    const url = typeof task.url === 'string' ? task.url.trim() : '';
    const requiredWatchTime = Number.isFinite(task.requiredWatchTime)
      ? task.requiredWatchTime
      : 0;
    const points = Number.isFinite(task.points) ? task.points : 0;

    let mcq = Array.isArray(task.mcq) ? task.mcq : [];

    // Optional: auto-generate a simple MCQ if missing
    if (!mcq.length) {
      mcq = [
        {
          question: 'Sample question: What did you learn from this task?',
          options: [
            'I reviewed the main concept',
            'I skimmed it',
            'I did not complete it',
            'I want to revisit later',
          ],
          answer: 'I reviewed the main concept',
        },
      ];
    }

    return { url, requiredWatchTime, points, mcq };
  });
};

export const createRoom = async (req, res) => {
  try {
    const {
      name,
      category,
      privacy,
      title,
      createdBy,
      taskLinks,
      taskPoints,
      dailyBonusPoints,
      streakMultiplier,
    } = req.body;

    if (!name || !category || !title) {
      return res.status(400).json({
        success: false,
        message: 'name, category and title are required',
      });
    }

    const userId = req.user?._id || createdBy || null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Enforce maximum of 2 rooms per user
    const existingRoomsCount = await Room.countDocuments({ createdBy: userId });
    if (existingRoomsCount >= 2) {
      return res.status(400).json({
        success: false,
        message: 'You have already created 2 rooms. Each user can create a maximum of 2 rooms.',
      });
    }

    const roomId = generateRoomId();

    const normalisedTaskLinks = normaliseTaskLinks(taskLinks);

    const room = await Room.create({
      roomId,
      name,
      category,
      privacy: privacy === 'private' ? 'private' : 'public',
      title,
      createdBy: userId,
      taskLinks: normalisedTaskLinks,
      taskPoints: Number.isFinite(taskPoints) ? taskPoints : undefined,
      dailyBonusPoints: Number.isFinite(dailyBonusPoints) ? dailyBonusPoints : undefined,
      streakMultiplier: Number.isFinite(streakMultiplier) ? streakMultiplier : undefined,
    });

    return res.status(201).json({
      success: true,
      message: 'Room created successfully',
      roomId: room.roomId,
      data: room,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const browseRooms = async (req, res) => {
  try {
    const { category, privacy } = req.query;

    const query = { isActive: true, privacy: 'public' };

    if (category) {
      query.category = category;
    }

    // Allow explicit filter for public only; private rooms never appear here
    if (privacy === 'public') {
      query.privacy = 'public';
    }

    const rooms = await Room.find(query).sort({ createdAt: -1 }).lean();

    return res.status(200).json({ success: true, rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getRecentRooms = async (req, res) => {
  try {
    const recentRooms = await Room.find({ isActive: true, privacy: 'public' })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('name title category createdAt')
      .lean();

    return res.status(200).json({ success: true, recentRooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const incrementRoomView = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findOneAndUpdate(
      { $or: [{ roomId: id }, { _id: id }] },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    return res.status(200).json({ success: true, views: room.views });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const rooms = await Room.find({ roomId: id }).select('_id');

    if (!rooms.length) {
      // From the dashboard perspective, treat as already deleted
      return res.status(200).json({ success: true, message: 'Room already deleted' });
    }

    const roomIds = rooms.map((r) => r._id);

    await User.updateMany(
      { joinedRooms: { $in: roomIds } },
      { $pull: { joinedRooms: { $in: roomIds } } }
    );

    await Room.deleteMany({ _id: { $in: roomIds } });

    return res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;

    const isObjectId = mongoose.isValidObjectId(roomId);

    const query = isObjectId
      ? { $or: [{ roomId }, { _id: roomId }] }
      : { roomId };

    const room = await Room.findOne(query)
      .select('roomId name category privacy title createdBy joinedUsers isActive createdAt views')
      .populate('createdBy', '_id username email')
      .lean();

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    return res.status(200).json({ success: true, room });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
