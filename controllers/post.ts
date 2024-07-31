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
        return res.status(422).json({"error": "One or more fields are missing."})
    }

    // TODO Validate title and content size

    // Get user, it works even if it's not a full IUser?
    const user = await User.findById<IUser>(userId)
    if (!user) {
        // 401 Unauthorized
        console.log("User doesn't exist, how did that happen?")
        return res.status(401).json({"error": "???"})
    }

    const newPost = new Post<IPost>({
        title,
        // the author is whoever is logged in
        author: user,
        content,
        picture
    })

    // TODO Check for postId already existing?
    newPost.save()
        .then(post => {
            // 200 OK
            console.log("Post created.")
            return res.status(201).json(post.postId)
        })
        .catch((error) => { return serverError(res, error) })
}

// 
// Get by Post Id
// 
function getByPostId(req: Request, res: Response, next: NextFunction) {
    console.log("Getting post by id...")

    const { year, month, day, titleId } = req.params
    const postId = [year, month, day, titleId].join("/")

    Post.findOne<IPost>({ postId: postId })
        .populate("author")
        .then(post => {
            if (!post) {
                // 404 Not Found
                console.log("Not found: " + postId)
                return res.status(404).json({"error": "Post not found."})
            }
            // 200 OK
            console.log("Sending " + post.postId)
            return res.status(200).json(post)
        })
        .catch((error) => { return serverError(res, error) })
}

// 
// Get posts (with amount and skip)
//
function getPosts(req: Request, res: Response, next: NextFunction) {
    console.log("Getting posts...")

    const { amount, skip } = req.query

    // Validate queries
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
            return res.status(200).json(posts)
        })
        .catch((error) => { return serverError(res, error) })
}

// 
// Update
// 
async function update(req: Request, res: Response, next: NextFunction) {
    console.log("Updating post...")

    const { _id } = req.params
    const { title, content, picture } = req.body
    const userId = req.session.userId

    if (!title || !content) {
        // 422 Unprocessable Content
        console.log("Missing fields.")
        return res.status(422).json({"error": "One or more fields are missing."})
    }

    const post = await Post.findById<IPost>({ _id })
        .populate("author")

    if (!post) {
        // 404 Not Found
        console.log("Not found?")
        return res.status(404).json({"error": "Post not found."})
    }

    if (post.author._id?.toString() !== userId) {
        // 401 Unauthorized
        console.log("Not the author.")
        return res.status(401).json({"error": "You're not the author of this post."})
    }

    // TODO Validate title and content size

    const updatedPost = {
        title,
        content,
        picture
    }

    Post.findByIdAndUpdate(_id, updatedPost)
        .then(post => {
            if (!post) {
                return serverError(res, "Server error")
            }
            // 201 Created
            console.log("Post updated.")
            return res.status(201).json(post.postId)
        })
        .catch((error) => { return serverError(res, error) })
}


// 
// Delete
// 
async function deletePost(req: Request, res: Response, next: NextFunction) {
    console.log("Deleting post...")

    const { _id } = req.params
    const userId = req.session.userId

    const post = await Post.findOne({ _id })
        .populate("author")

    if (!post) {
        // 404 Not Found
        console.log("Not found.")
        return res.status(404).json({"error": "Post not found."})
    }

    if (post.author._id?.toString() !== userId) {
        // 401 Unauthorized
        console.log("Not the author.")
        return res.status(401).json({"error": "You're not the author of this post."})
    }

    post.deleteOne()
        .then(() => {
            // 200 OK
            console.log("Post deleted.")
            return res.status(200).json({"message": "Post deleted."})
        })
        .catch((error) => { return serverError(res, error) })

}

export default {
    create,
    getByPostId,
    getPosts,
    update,
    deletePost
}