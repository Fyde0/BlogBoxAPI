import mongoose from "mongoose";
import IUserSettings from "./userSettings";

interface IUser {
    _id?: string
    username: string
    password: string
    settings: IUserSettings
    admin: boolean
    avatar?: string
    name?: string
    about?: string
}

export type IUserInfo = Omit<IUser, "password" | "settings" | "admin">

export function isIUserInfo(obj: IUserInfo): obj is IUserInfo {
    return obj.username ? true : false
}

export default IUser