import { Request, Response, NextFunction } from "express"
import { z } from "zod"
// 
import { serverError } from "../helpers/serverError"
import IPost from "../interfaces/post"
import IUser from "../interfaces/user"
import Post from "../models/post"
import User from "../models/user"

// 
// Create
// 
async function create(req: Request, res: Response, next: NextFunction) {
    console.log("Creating post...")

    const { title, content, picture } = req.body
    const userId = req.session.userId

    if (!title || !content) {
        // 422 Unprocessable Content
        console.log("Missing fields.")
        return res.status(422).send("One or more fields are missing.")
    }

    // TODO Validate title and content size

    // Get user, it works even if it's not a full IUser? (can't user IUserInfo)
    const user = await User.findById<IUser>(userId)
    if (!user) {
        // 401 Unauthorized
        console.log("User doesn't exist, how did that happen?")
        return res.status(401).send("???")
    }

    const newPost = new Post<IPost>({
        title,
        // the author is whoever is logged in
        author: user,
        content,
        picture
    })

    newPost.save()
        .then(post => {
            // 200 OK
            console.log("Post created.")
            return res.status(201).send(post)
        })
        .catch((error) => { return serverError(res, error) })
}

// 
// Get by Post Id
// 
function getByPostId(req: Request, res: Response, next: NextFunction) {
    console.log("Getting post by id...")

    let { year, month, day, titleId } = req.params
    const postId = [year, month, day, titleId].join("/")

    Post.findOne<IPost>({ postId: postId })
        .populate("author")
        .then(post => {
            if (!post) {
                // 404 Not Found
                console.log("Not found: " + postId)
                return res.status(404).send("Post not found.")
            }
            // 200 OK
            console.log("Sending " + post.postId)
            return res.status(200).send(post)
        })
        .catch((error) => { return serverError(res, error) })
}

// 
// Get posts (with amount and skip)
//
function getPosts(req: Request, res: Response, next: NextFunction) {
    console.log("Getting posts...")

    const { amount, skip } = req.query

    const amountInt = z.coerce.number().default(10).catch(10).parse(amount)
    const skipInt = z.coerce.number().default(0).catch(0).parse(skip)

    // TODO limit max amount?

    Post.find<IPost>()
        .sort({ updatedAt: "descending" })
        .skip(skipInt)
        .limit(amountInt)
        .populate("author")
        .then(posts => {
            console.log("Returning posts.")
            return res.status(200).send(posts)
        })
        .catch((error) => { return serverError(res, error) })
}

// put /update/:id
// Post.findByIdAndUpdate({ _id: id, content, picture })

// delete /delete/:id
// Post.findByIdAndDelete({ _id: id })

export default {
    create,
    getByPostId,
    getPosts
}