import mongoose from "mongoose";
import IUserSettings from "./userSettings";

interface IUser {
    _id?: mongoose.Types.ObjectId
    username: string
    password: string
    settings: IUserSettings
    admin: boolean
}

export type IUserInfo = Omit<IUser, "password" | "settings">

export function isIUserInfo(obj: IUserInfo): obj is IUserInfo {
    return obj.username && obj.admin !== undefined ? true : false
}

export default IUser