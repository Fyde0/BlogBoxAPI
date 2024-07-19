import { Document } from 'mongoose';
import IUser from './user';

export default interface IPost extends Document {
    title: string;
    author: IUser;
    content: string;
    picture?: string;
}