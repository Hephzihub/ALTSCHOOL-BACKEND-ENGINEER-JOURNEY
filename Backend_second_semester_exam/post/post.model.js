import mongoose, { Schema } from "mongoose";

const stateOptions = ["draft", "published"];

const PostSchema = new Schema(
  {
    author_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Title is required"],
      index: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: { type: String, required: false, maxlength: 500, default: "" },
    state: {
      type: String,
      enum: { values: stateOptions, message: "{VALUE} is not a valid state" },
      default: "draft",
      index: true,
    },
    read_count: {type: Number, default: 0},
    reading_time: {type: Number},
    tags: {
      type: [String],
      default: []
    },
    body: {type: String, required: [true, 'Body is required']}
  },
  {
    timestamps: true,
  }
);

PostSchema.pre('save', function(next) {
  if (this.isModified('body')) {
    // Average reading speed is 200 words per minute
    const wordCount = this.body.trim().split(" ").length;
    this.reading_time = Math.ceil(wordCount / 200)
  }

  next()
})

export const PostModel = mongoose.model("Post", PostSchema);
