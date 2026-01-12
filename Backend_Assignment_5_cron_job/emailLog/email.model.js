import mongoose, { Schema } from "mongoose";

const emailLogSchema = new Schema(
  {
    birthdayId: {
      type: Schema.Types.ObjectId,
      ref: "Birthday",
      required: true,
    },
    email: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["sent", "failed"], required: true },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

// Index for faster queries on status page
emailLogSchema.index({ sentAt: -1 });
emailLogSchema.index({ status: 1, sentAt: -1 });

emailLogSchema.statics.getTodayCount = async function () {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);

  const count = await this.countDocuments({
    status: "sent",
    sentAt: { $gte: startOfDay, $lte: endOfDay },
  });

  return count;
};

emailLogSchema.statics.getTotalCount = async function () {
  const count = await this.countDocuments({ status: "sent" });
  return count;
};

// Static method to get last run time
emailLogSchema.statics.getLastRunTime = async function () {
  const lastLog = await this.findOne().sort({ sentAt: -1 });
  return lastLog ? lastLog.sentAt : null;
};

// Static method to get last cron job status
emailLogSchema.statics.getLastCronStatus = async function () {
  const lastLog = await this.findOne().sort({ sentAt: -1 });
  return lastLog ? (lastLog.status === "sent" ? true : false) : null;
};

export const EmailLog = mongoose.model("EmailLog", emailLogSchema);
