import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema(
  {
    first_name: {
      type: String,
      trim: true,
      required: [true, 'First name is required'],
      lowercase: true,
    },
    last_name: {
      type: String,
      trim: [true, 'Last name is required'],
      required: true,
      lowercase: true,
    },
    email: {
      type: String,
      unique: [true, 'Email taken already'],
      trim: true,
      lowercase: true,
      required: true,
    },
    password: { type: String, minlength: 6, select: false, required: true },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function(next) {
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

UserSchema.methods.comparePassword = async function(userPassword) {
  try {
    return await bcrypt.compare(userPassword, this.password);
  } catch (error) {
    throw new Error("Password compare failed");
  }
};

export const UserModel = mongoose.model("User", UserSchema);
