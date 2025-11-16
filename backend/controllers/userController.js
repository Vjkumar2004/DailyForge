import User from '../models/User.js';
import Room from '../models/Room.js';

export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    const joinedRoomsCount = user.joinedRooms ? user.joinedRooms.length : 0;
    const createdRoomsCount = await Room.countDocuments({ createdBy: user._id });
    const creatorBadge = createdRoomsCount > 0;

    return res.status(200).json({
      username: user.username,
      email: user.email,
      about: user.about,
      streak: user.streak,
      points: user.points,
      joinedRoomsCount,
      createdRoomsCount,
      creatorBadge,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const user = req.user;
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: 'roomId is required' });
    }

    const alreadyJoined = user.joinedRooms.some((id) => id.toString() === roomId);
    if (!alreadyJoined) {
      user.joinedRooms.push(roomId);
      user.points += 10;
      await user.save();
    }

    return res.status(200).json({
      message: 'Room joined successfully',
      points: user.points,
      joinedRoomsCount: user.joinedRooms.length,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateStreak = async (req, res) => {
  try {
    const user = req.user;

    user.streak += 1;
    user.points += 5;
    await user.save();

    return res.status(200).json({
      message: 'Streak updated',
      streak: user.streak,
      points: user.points,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getCreatedRooms = async (req, res) => {
  try {
    const userId = req.user._id;

    const rooms = await Room.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .select('name title category createdAt roomId')
      .lean();

    return res.status(200).json({ success: true, rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
