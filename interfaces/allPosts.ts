import IPost, { isIPostArray } from "./post"

interface IAllPosts {
    totalCount: number
    posts: IPost[]
}

export function isIAllPosts(obj: IAllPosts): obj is IAllPosts {
    return typeof obj.totalCount === "number" && isIPostArray(obj.posts) ? true : false
}

export default IAllPosts