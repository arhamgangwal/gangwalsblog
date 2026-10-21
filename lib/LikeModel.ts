
import { Schema, model, models } from "mongoose";

const LikeSchema = new Schema(
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
  },
  { timestamps: true },
);

LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

const Like = models.Like || model("Like", LikeSchema);

export default Like;
