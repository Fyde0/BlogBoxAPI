import { Document } from 'mongoose';

interface IUser extends Document {
    username: string;
    password: string;
    admin: boolean
}

export default IUser