import { Request, Response, NextFunction } from "express"
import Post from "../models/post"

const create = (req: Request, res: Response, next: NextFunction) => {
    console.log("Creating post...")

    let { title, author, content, picture } = req.body

    // TODO validate user with JWT

    const newPost = new Post({
        title, author, content, picture
    })

    newPost.save()
        .then(post => {
            console.log("Post created.")
            return res.status(201).json(post)
        })
        .catch(error => {
            console.error(error.message)
            return res.status(500).json(error.message)
        })
}

// get /byId/:id
// Post.find({ _id })

// TODO limit and skip instead of all
const getAll = (req: Request, res: Response, next: NextFunction) => {
    console.log('Getting all posts...')

    Post.find()
        .then(posts => {
            return res.status(200).json(posts)
        })
        .catch((error) => {
            console.error(error.message)
            return res.status(500).json(error.message)
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