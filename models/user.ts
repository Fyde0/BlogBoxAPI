import mongoose, { Schema } from "mongoose"
// 
import IUser from "../interfaces/user"
import IUserSettings from "../interfaces/userSettings";

const UserSettingsSchema: Schema = new Schema<IUserSettings>(
    {
        postsPerPage: { type: Number, default: 10 },
        theme: { type: String, default: "dark" }
    }
)

const UserSchema: Schema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        // "select: false" doesn't return field unless specified
        // this is to make the schema IUserInfo by default
        password: { type: String, required: true, select: false },
        settings: { type: UserSettingsSchema, select: false },
        admin: { type: Boolean, default: false },
        avatar: { type: String },
        name: { type: String },
        about: { type: String }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IUser>('User', UserSchema);