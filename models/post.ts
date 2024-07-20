import mongoose, { Schema } from "mongoose";
import IPost from "../interfaces/post";

const PostSchema: Schema = new Schema<IPost>(
    {
        title: { type: String, required: true },
        author: {
            type: mongoose.Schema.Types.ObjectId, // Population
            ref: 'User',
            required: true
        },
        content: { type: String },
        picture: { type: String }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IPost>('Post', PostSchema)