import mongoose, { Schema } from "mongoose";
// 
import IBlogSettings from "../interfaces/blogSettings";

const BlogSettingsSchema: Schema = new Schema<IBlogSettings>(
    {
        title: { type: String },
        theme: { type: String, enum: ["minty", "flatly", "cosmo"], default: "minty" }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IBlogSettings>('BlogSettings', BlogSettingsSchema)