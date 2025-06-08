import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    team: { type: String, required: true },
    role: {
      type: String,
      enum: ['Junior', 'Senior', 'Head'],
      default: 'Junior',
    },
    lastLoggedIn: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
