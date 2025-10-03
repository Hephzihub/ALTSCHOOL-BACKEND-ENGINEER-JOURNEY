import { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      min: 3,
    },
    password: { type: String, min: 6, select: false, },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async (next) => {
  if (!this.isModified('password')) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next()
  } catch (error) {
    next(error)
  }
})

userSchema.methods.comparePassword = async (userPassword) => {
  try {
    return await bcrypt.compare(userPassword, this.password);
  } catch (error) {
    throw new Error('Password compare failed')
  }
}