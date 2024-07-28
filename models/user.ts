import mongoose, { Schema } from "mongoose"
// 
import IUser from "../interfaces/user"

const UserSchema: Schema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        // "select: false" doesn't return password unless specified
        password: { type: String, required: true, select: false },
        admin: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IUser>('User', UserSchema);