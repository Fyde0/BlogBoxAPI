import { Request, Response, NextFunction } from "express"
import IPost from "../interfaces/post"
import Post from "../models/post"

function create(req: Request, res: Response, next: NextFunction) {
    console.log("Creating post...")

    let { title, content, picture } = req.body
    let userId = req.session.userId

    // TODO Validate?

    // This should never happen but Typescript complains
    if (typeof userId !== "string") {
        console.error("???")
        return res.status(500).json({ "error": "Server error" })
    }

    const newPost = new Post<IPost>({
        title,
        // the author is whoever is logged in
        author: userId,
        content,
        picture
    })

    newPost.save()
        .then(post => {
            console.log("Post created.")
            return res.status(201).json({ "post": post._id })
        })
        .catch(error => {
            console.error(error.message)
            return res.status(500).json({ "error": "Server error" })
        })
}

// get /byId/:id
// Post.find({ _id })

// TODO limit and skip instead of all
function getAll(req: Request, res: Response, next: NextFunction) {
    console.log('Getting all posts...')

    Post.find()
        .then(posts => {
            console.log("Returning all posts.")
            return res.status(200).json({ "posts": posts })
        })
        .catch((error) => {
            console.error(error)
            return res.status(500).json({ "error": "Server error" })
        })
}

// put /update/:id
// Post.findByIdAndUpdate({ _id: id, content, picture })

// delete /delete/:id
// Post.findByIdAndDelete({ _id: id })

export default {
    create,
    getAll
}