import { Request, Response, NextFunction } from "express"
// 
import { serverError } from "../helpers/serverError"
import IBlogSettings, { isIBlogSettings } from "../interfaces/blogSettings"
import BlogSettings from "../models/blogSettings"

// 
// Get settings
// 
function getBlogSettings(req: Request, res: Response, next: NextFunction) {
    console.log("Getting blog settings...")

    BlogSettings.findOne<IBlogSettings>()
        .then(blogSettings => {
            if (!blogSettings) {
                return serverError(res, "No blog settings?")
            }
            // 200 OK
            console.log("Responding with blog settings.")
            return res.status(200).json(blogSettings)
        })
        .catch((error) => { return serverError(res, error) })
}

// 
// Change settings
// 
async function changeBlogSettings(req: Request, res: Response, next: NextFunction) {
    console.log("Changing settings...")

    if (!isIBlogSettings(req.body)) {
        // 422 Unprocessable Content
        console.log("Invalid object.")
        return res.status(422).json({ "error": "Invalid settings." })
    }

    const newBlogSettings = req.body

    const blogSettings = await BlogSettings.findOne()
    if (!blogSettings) {
        return serverError(res, "No blog settings?")
    }

    blogSettings.set(newBlogSettings)

    blogSettings.save()
        .then(blogSettings => {
            if (!blogSettings) {
                return serverError(res, "Change blog settings error")
            }
            console.log("Blog settings updated.")
            return res.status(200).json(blogSettings)
        })
        .catch((error) => { return serverError(res, error) })
}

export default {
    getBlogSettings,
    changeBlogSettings
}