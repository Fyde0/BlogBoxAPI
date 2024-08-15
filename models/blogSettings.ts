import mongoose, { Schema } from "mongoose";
// 
import IBlogSettings from "../interfaces/blogSettings";
import { postPreviewLgStyles } from "../interfaces/postPreviews";

const BlogSettingsSchema: Schema = new Schema<IBlogSettings>(
    {
        title: { type: String },
        theme: { type: String, enum: ["minty", "flatly", "cosmo"], default: "minty" },
        homeLayout: {
            postPreviewStyle: {type: String, enum: postPreviewLgStyles, default: "LgDefault"}
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IBlogSettings>('BlogSettings', BlogSettingsSchema)