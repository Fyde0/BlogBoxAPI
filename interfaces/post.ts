import mongoose from "mongoose";
import IUser from './user';

interface IPost {
    _id?: mongoose.Types.ObjectId
    title: string
    postId?: string
    author: IUser
    content: string
    picture?: string
    createdAt?: Date
    updatedAt?: Date
}

export default IPost