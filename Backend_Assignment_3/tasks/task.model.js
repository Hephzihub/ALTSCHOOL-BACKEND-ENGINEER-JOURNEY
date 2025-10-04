import mongoose, { Schema } from "mongoose";

const statusOptions = ["pending", "completed", "deleted"];

const taskSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "UserID is required"],
      index: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 100,
      trim: true,
    },
    description: { type: String, required: false, maxlength: 500, default: "" },
    status: {
      type: String,
      enum: { values: statusOptions, message: "{VALUE} is not a valid status" },
      default: "pending",
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

taskSchema.methods.markAsCompleted = function () {
  this.status = "completed";
  this.completedAt = new Date();
  return this.save();
};

taskSchema.methods.markAsDeleted = function () {
  this.status = "deleted";
  this.deletedAt = new Date();
  return this.save();
};

taskSchema.methods.undoCompletion = function () {
  this.status = "pending";
  this.completedAt = null;
  return this.save();
};

taskSchema.statics.getTasksByStatus = async function (userId, status) {
  const query = { userId };

  if (status && status !== "all") {
    query.status = status;
  } else {
    query.status = { $ne: "deleted" };
  }

  return this.find(query).sort({ createdAt: -1 });
};

taskSchema.statics.getTaskStats = async function (userId) {
  const tasks = await this.find({ userId, status: { $ne: "deleted" } });

  return tasks.reduce(
    (stats, task) => {
      stats.total++;
      if (task.status === "pending") stats.pending++;
      if (task.status === "completed") stats.completed++;

      return stats
    },
    {
      total: 0,
      pending: 0,
      completed: 0,
    }
  );
};

export const TaskModel = mongoose.model("task", taskSchema);
