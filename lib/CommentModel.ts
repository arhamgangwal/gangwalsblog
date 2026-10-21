
import { Schema, model, models } from "mongoose";

const CommentSchema = new Schema(
  {
    postId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

CommentSchema.index({ postId: 1, createdAt: -1 });

const Comment = models.Comment || model("Comment", CommentSchema);

export default Comment;
