import mongoose, { Schema } from "mongoose";
// 
import IBlogSettings from "../interfaces/blogSettings";
import { postPreviewLgStyles, postPreviewSmStyles } from "../interfaces/postPreviews";

const BlogSettingsSchema: Schema = new Schema<IBlogSettings>(
    {
        title: { type: String },
        theme: { type: String, enum: ["minty", "flatly", "cosmo"], default: "minty" },
        homeLayout: {
            postPreviewStyle: { type: String, enum: postPreviewLgStyles, default: "LgDefault" },
            featuredPosts: { type: Boolean, default: false },
            featuredPostsTags: { type: [String] },
            introCard: { type: Boolean, default: false },
            introCardTitle: { type: String },
            introCardContent: { type: String }
        },
        sidebarLayout: {
            showArchives: { type: Boolean, default: true },
            showTags: { type: Boolean, default: true },
            showLatestPosts: { type: Boolean, default: true },
            postPreviewStyle: { type: String, enum: postPreviewSmStyles, default: "SmDefault" }
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IBlogSettings>('BlogSettings', BlogSettingsSchema)