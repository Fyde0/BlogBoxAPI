import mongoose from "mongoose";
import IUser, { isIUserInfo, IUserInfo } from './user';

interface IPost {
    _id?: mongoose.Types.ObjectId
    postId?: string
    title: string
    author: IUserInfo
    content: string
    picture?: string
    tags?: string[]
    createdAt?: Date
    updatedAt?: Date
}

export function isIPost(obj: IPost): obj is IPost {
    // we only need the username
    return obj.title && isIUserInfo(obj.author) && obj.content ? true : false
}

export default IPost