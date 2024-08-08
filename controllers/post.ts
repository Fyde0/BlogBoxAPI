import { Request, Response, NextFunction } from "express"
import { FilterQuery } from "mongoose"
import { z } from "zod"
// 
import { serverError } from "../helpers/serverError"
import IPost, { isIPost } from "../interfaces/post"
import IPostsCountByMonth from "../interfaces/postsCountByMonth"
import IUser from "../interfaces/user"
import Post from "../models/post"
import User from "../models/user"

// 
// Create
// 
async function create(req: Request, res: Response, next: NextFunction) {
    console.log("Creating post...")

    const post: IPost = req.body
    const userId = req.session.userId

    if (!post.title || !post.content) {
        // 422 Unprocessable Content
        console.log("Missing fields.")
        return res.status(422).json({ "error": "One or more fields are missing." })
    }

    // TODO Validate title and content size

    // Get user, it works even if it's not a full IUser?
    const user = await User.findById<IUser>(userId)
    if (!user) {
        // 401 Unauthorized
        console.log("User doesn't exist, how did that happen?")
        return res.status(401).json({ "error": "???" })
    }

    const newPost = new Post<IPost>({
        ...post,
        // the author is whoever is logged in
        author: user
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
                return res.status(404).json({ "error": "Post not found." })
            }
            // 200 OK
            console.log("Responding with " + post.postId)
            return res.status(200).json(post)
        })
        .catch((error) => { return serverError(res, error) })
}

// 
// Get posts
//
async function getAll(req: Request, res: Response, next: NextFunction) {
    console.log("Getting posts...")

    const { startDate, endDate, tags, sort, count, skip } = req.query

    const tagsArray = typeof tags === "string" && tags.split(',')

    // Validate queries
    const validations = z
        .object({
            startDate: z.coerce.number().optional(),
            endDate: z.coerce.number().optional(),
            tagsArray: z.array(z.string()).optional(),
            sort: z.enum(["asc", "desc"]).default("desc").catch("desc"),
            count: z.coerce.number().max(100).default(10).catch(10),
            skip: z.coerce.number().default(0).catch(0)
        })
        .safeParse({ startDate, endDate, tagsArray, sort, count, skip })

    if (!validations.success) {
        // 422 Unprocessable Content
        console.log(validations.error)
        return res.status(422).json({ "error": "Invalid queries." })
    }

    // Setup filters
    let filters: FilterQuery<IPost> = {}
    // not using validated values because they can't be undefined
    if (startDate || endDate) {
        filters.createdAt = {}
        if (startDate) {
            filters.createdAt.$gte = new Date(Number(validations.data.startDate))
        }
        if (endDate) {
            filters.createdAt.$lte = new Date(Number(validations.data.endDate))
        }
    }
    if (tags) {
        filters.tags = {}
        filters.tags.$all = validations.data.tagsArray
    }

    // Returning total amount for pagination (with filters)
    const totalCount = await Post.countDocuments(filters)

    Post.find<IPost>(filters)
        .sort({ updatedAt: validations.data.sort })
        .skip(validations.data.skip)
        .limit(validations.data.count)
        .populate("author")
        .then(posts => {
            console.log("Returning posts.")
            return res.status(200).json({ "totalCount": totalCount, "posts": posts })
        })
        .catch((error) => { return serverError(res, error) })
}

// 
// Get post count by month
// 
function getCountByMonth(req: Request, res: Response, next: NextFunction) {
    console.log("Getting amount of posts by publish month...")

    Post.aggregate<IPostsCountByMonth>()
        .group(
            {
                _id:
                {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                },
                count: { $sum: 1 }
            }
        )
        .sort({ "_id.year": "desc", "_id.month": "desc" })
        .then(result => {
            console.log("Returning amount of posts by publish month.")
            return res.status(200).json(result)
        })
        .catch((error) => { return serverError(res, error) })
}

// 
// Get tags
// 
function getTags(req: Request, res: Response, next: NextFunction) {
    console.log("Getting tags...")

    Post.aggregate()
        .unwind("$tags")
        .group({ _id: "$tags" })
        .then(result => {
            const tagsArray = result.map(obj => obj._id)
            console.log("Returning tags.")
            return res.status(200).json(tagsArray)
        })
        .catch((error) => { return serverError(res, error) })
}

// 
// Update
// 
async function update(req: Request, res: Response, next: NextFunction) {
    console.log("Updating post...")

    const { _id } = req.params
    const userId = req.session.userId

    if (!isIPost(req.body)) {
        // 422 Unprocessable Content
        console.log("Missing fields.")
        return res.status(422).json({ "error": "One or more fields are missing." })
    }

    const updatedPost = req.body

    const post = await Post.findById({ _id })
        .populate("author")

    if (!post) {
        // 404 Not Found
        console.log("Not found?")
        return res.status(404).json({ "error": "Post not found." })
    }

    if (post.author._id?.toString() !== userId) {
        // 403 Forbidden
        console.log("Not the author.")
        return res.status(403).json({ "error": "You're not the author of this post." })
    }

    // TODO Validate title and content size

    post.set(updatedPost)

    post.save()
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
        return res.status(404).json({ "error": "Post not found." })
    }

    if (post.author._id?.toString() !== userId) {
        // 403 Forbidden
        console.log("Not the author.")
        return res.status(403).json({ "error": "You're not the author of this post." })
    }

    post.deleteOne()
        .then(() => {
            // 200 OK
            console.log("Post deleted.")
            return res.status(200).json({ "message": "Post deleted." })
        })
        .catch((error) => { return serverError(res, error) })

}

export default {
    create,
    getByPostId,
    getAll,
    getCountByMonth,
    getTags,
    update,
    deletePost
}