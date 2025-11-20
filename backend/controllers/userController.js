import User from '../models/User.js';
import Room from '../models/Room.js';

export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    const joinedRoomsCount = user.joinedRooms ? user.joinedRooms.length : 0;
    const createdRoomsCount = await Room.countDocuments({ createdBy: user._id });
    const creatorBadge = createdRoomsCount > 0;

    return res.status(200).json({
      _id: user._id,
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

export const updateActivity = async (req, res) => {
  try {
    const user = req.user;

    // Today as YYYY-MM-DD (UTC-based)
    const today = new Date().toISOString().slice(0, 10);
    const lastActive = user.lastActiveDate;

    let streakChanged = false;
    let streakReset = false;

    if (!lastActive) {
      // First recorded activity: start streak at 1
      user.streak = 1;
      user.lastActiveDate = today;
      streakChanged = true;
    } else if (lastActive === today) {
      // Same day: do nothing
    } else {
      const lastDate = new Date(lastActive + 'T00:00:00.000Z');
      const todayDate = new Date(today + 'T00:00:00.000Z');
      const diffDays = Math.round(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        // Consecutive day: increment streak
        user.streak += 1;
        user.lastActiveDate = today;
        streakChanged = true;
      } else if (diffDays > 1) {
        // Missed one or more days: reset streak to 0
        user.streak = 0;
        user.lastActiveDate = today;
        streakChanged = true;
        streakReset = true;
      }
    }

    if (streakChanged) {
      await user.save();
    }

    return res.status(200).json({
      success: true,
      streak: user.streak,
      lastActiveDate: user.lastActiveDate,
      streakChanged,
      streakReset,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
      // Joining a room gives points but does not affect daily streak.
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

    return res.status(200).json({
      message: 'Streak is managed via the update-activity endpoint.',
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
    // Delete all rooms created by this user
    const createdRooms = await Room.find({ createdBy: userId }).select('_id');
    const createdRoomIds = createdRooms.map((room) => room._id);

    if (createdRoomIds.length > 0) {
      // Remove these rooms from other users' joinedRooms arrays
      await User.updateMany(
        { joinedRooms: { $in: createdRoomIds } },
        { $pull: { joinedRooms: { $in: createdRoomIds } } }
      );

      // Finally delete the rooms themselves
      await Room.deleteMany({ _id: { $in: createdRoomIds } });
    }

    // Remove the user from any rooms they have joined
    await Room.updateMany(
      { joinedUsers: userId },
      { $pull: { joinedUsers: userId } }
    );

    // Delete the user account
    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
