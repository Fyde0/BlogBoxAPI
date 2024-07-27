import mongoose, { Schema, HydratedDocument } from "mongoose"
// 
import IPost from "../interfaces/post"

const PostSchema: Schema = new Schema<IPost>(
    {
        title: { type: String, required: true },
        postId: { type: String, unique: true },
        author: {
            type: mongoose.Schema.Types.ObjectId,
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

// Generates the postId based on the createdAt time when creating a new post
PostSchema.pre<HydratedDocument<IPost>>('save', function (next) {
    if (this !== undefined && this.isNew && this.createdAt) {
        // YYYY/MM/DD
        const formattedDate = this.createdAt.toISOString().split('T')[0].replace(/-/g, "/")
        // YYYY/MM/DD/word1-word2-word3
        this.postId = formattedDate + "/" + this.title
            .toLowerCase()
            // only keep letters and numbers, replace with -
            .replace(/[^a-zA-Z0-9]+/g, "-")
            // remove - at the end
            .replace(/-$/g, "")
        next()
    } else {
        next(new Error('postId pre hook error.'))
    }
})

export default mongoose.model<IPost>('Post', PostSchema)