import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    about: { type: String, default: '' },
    joinedRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: [] }],
    streak: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.model('User', userSchema);
