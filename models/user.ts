import mongoose, { Schema } from "mongoose";
import IUser from "../interfaces/user";

const UserSchema: Schema = new Schema(
    {
        username: { type: String, unique: true },
        password: { type: String },
        admin: { type: Boolean }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IUser>('User', UserSchema);