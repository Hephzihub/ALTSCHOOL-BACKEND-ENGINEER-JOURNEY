import mongoose, { Schema } from "mongoose";

const birthdaySchema = new Schema(
  {
    username: { type: String, required: true },
    email: {
      type: String,
      unique: [true, "Email already exists"],
      required: true,
      lowercase: true,
      trim: true,
    },
    dateOfBirth: { type: Date, required: true },
  },
  { timestamps: true }
);

birthdaySchema.index({ dateOfBirth: 1 });

// Virtual to get day and month from dateOfBirth
birthdaySchema.virtual("birthDayMonth").get(function () {
  const dob = this.dateOfBirth;
  return { day: dob.getUTCDate(), month: dob.getUTCMonth() + 1 };
});

// birthdaySchema.virtual('age').get(function() {
//   const today = new Date();
//   let age = today.getFullYear() - this.dateOfBirth.getFullYear();
//   const m = today.getMonth() - this.dateOfBirth.getMonth();
//   if (m < 0 || (m === 0 && today.getDate() < this.dateOfBirth.getDate())) {
//     age--;
//   }
//   return age;
// });

export const BirthdayModel = mongoose.model("Birthday", birthdaySchema);
