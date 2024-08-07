import mongoose from "mongoose";
import IUserSettings from "./userSettings";

interface IUser {
    _id?: string
    username: string
    password: string
    settings: IUserSettings
    admin: boolean
    avatar?: string | File
    name?: string
    about?: string
}

export type IUserInfo = Omit<IUser, "password" | "settings">

export function isIUserInfo(obj: IUserInfo): obj is IUserInfo {
    return obj.username && obj.admin !== undefined ? true : false
}

export default IUser