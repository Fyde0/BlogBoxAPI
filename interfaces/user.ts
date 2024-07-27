import mongoose from "mongoose";

interface IUser {
    _id?: mongoose.Types.ObjectId
    username: string
    password: string
    admin: boolean
}

// User without password for client
export type IUserInfo = Omit<IUser, "password">;

export default IUser