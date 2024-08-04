import mongoose from "mongoose";
import IUser from './user';

interface IPost {
    _id?: mongoose.Types.ObjectId
    postId?: string
    title: string
    author: IUser
    content: string
    picture?: string
    tags?: string[]
    createdAt?: Date
    updatedAt?: Date
}

export default IPost