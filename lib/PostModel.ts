
import { Schema, model, models } from "mongoose";

const PostSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      default: "ARHAM GANGWAL",
      trim: true,
    },
    readingTime: {
      type: String,
      required: true,
      default: "3 MIN READ",
    },
    categories: {
      type: [String],
      default: ["IDEAS & NOTES"],
    },
    content: {
      type: [
        new Schema(
          {
            heading: {
              type: String,
              default: "",
            },
            paragraphs: {
              type: [String],
              required: true,
              default: [],
            },
          },
          { _id: false },
        ),
      ],
      required: true,
      default: [],
    },
  },
  { timestamps: true },
);

const Post = models.Post || model("Post", PostSchema);

export default Post;
