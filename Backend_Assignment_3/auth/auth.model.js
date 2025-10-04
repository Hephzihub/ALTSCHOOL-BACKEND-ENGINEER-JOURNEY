import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: [true, 'Username taken already'],
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      required: true,
    },
    password: { type: String, minlength: 6, select: false, required: true },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(userPassword) {
  try {
    return await bcrypt.compare(userPassword, this.password);
  } catch (error) {
    throw new Error("Password compare failed");
  }
};

export const UserModel = mongoose.model("user", userSchema);
