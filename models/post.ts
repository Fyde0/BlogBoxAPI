import mongoose, { Schema } from "mongoose";
import IPost from "../interfaces/post";

const PostSchema: Schema = new Schema(
    {
        title: String,
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Population
        content: String,
        picture: String
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IPost>('Post', PostSchema);