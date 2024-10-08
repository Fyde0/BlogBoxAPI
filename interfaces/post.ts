import { isIUserInfo, IUserInfo } from './user';

interface IPost {
    _id?: string
    postId?: string
    title: string
    author: IUserInfo
    content: string
    picture?: string
    pictureInView?: boolean
    tags: string[]
    createdAt?: Date
    updatedAt?: Date
}

export function isIPost(obj: IPost): obj is IPost {
    // we only need the username
    return obj.title && isIUserInfo(obj.author) && obj.content ? true : false
}

export function isIPostArray(obj: IPost[]): obj is IPost[] {
    return obj.every(post => isIPost(post))
}

export default IPost