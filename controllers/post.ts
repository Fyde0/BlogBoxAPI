import { Request, Response, NextFunction } from "express"
// 
import IPost from "../interfaces/post"
import IUser from "../interfaces/user"
import Post from "../models/post"
import User from "../models/user"

async function create(req: Request, res: Response, next: NextFunction) {
    console.log("Creating post...")

    let { title, content, picture } = req.body
    let userId = req.session.userId

    if (!title || !content) {
        // 422 Unprocessable Content
        console.log("Missing fields.")
        return res.status(422).send("One or more fields are missing.")
    }

    // TODO Validate title and content size

    // Get user
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
            console.log("Post created.")

            return res.status(201).send(post)
        })
        .catch(error => {
            // 500 Internal Server Error
            console.error(error)
            return res.status(500).send("Server error.")
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
            return res.status(200).send(posts)
        })
        .catch((error) => {
            // 500 Internal Server Error
            console.error(error)
            return res.status(500).send("Server error.")
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