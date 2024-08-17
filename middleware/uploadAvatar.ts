import { Request, Response, NextFunction } from "express"
import multer from "multer";
import { serverError } from "../helpers/serverError";

const storage = multer.diskStorage({
    destination: process.env.AVATARS_DIR,
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + "-" + uniqueSuffix)
    }
})

const upload = multer(
    {
        storage,
        limits: {
            fileSize: 1 * 1024 * 512,
            files: 1
        },
        fileFilter: (req, file, cb) => {
            if (["jpg", "jpeg", "png"].some(ext => file.mimetype.includes(ext))) {
                return cb(null, true)
            }
            return cb(new Error("Invalid file format."))
        }
    })
    .single("avatar")

function uploadAvatar(req: Request, res: Response, next: NextFunction) {
    upload(req, res, (error: any) => {
        if (error) {
            if (error.message) {
                // 422 Unprocessable Content
                console.log(error.message)
                return res.status(422).json({ "error": error.message })
            } else {
                return serverError(res, "File upload error.")
            }
        }
        next()
    })
}

export default uploadAvatar