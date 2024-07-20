import IUser from './user';

interface IPost {
    title: string;
    author: IUser | string; // userId
    content: string;
    picture?: string;
}

export default IPost