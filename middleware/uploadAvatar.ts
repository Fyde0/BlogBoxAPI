import { Request, Response, NextFunction } from "express"
import multer from "multer";
import { serverError } from "../helpers/serverError";
import config from "../config";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config.publicDir + "avatars")
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + "-" + uniqueSuffix)
    }
})

const upload = multer(
    {
        storage,
        limits: {
            fieldSize: 1 * 1024 * 1024
        },
        fileFilter: (req, file, cb) => {
            if (["jpg", "jpeg", "png"].some(ext => file.mimetype.includes(ext))) {
                console.log(file)
                cb(null, true)
            } else (
                // has to be in else
                cb(new Error("Invalid file format."))
            )
        }
    })
    .single("avatar")

function uploadAvatar(req: Request, res: Response, next: NextFunction) {
    upload(req, res, (error: any) => {
        if (error) {
            if (error.message === "Invalid file format.") {
                // 422 Unprocessable Content
                console.log(error.message)
                return res.status(422).json({ "error": "File format not valid." })
            } else {
                serverError(res, "File upload error.")
            }
        }
        next()
    })
}

export default uploadAvatar