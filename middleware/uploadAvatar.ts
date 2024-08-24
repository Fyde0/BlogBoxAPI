import { Request, Response, NextFunction } from "express"
import multer from "multer";
import { serverError } from "../helpers/serverError";
import sharp from "sharp";

const upload = multer(
    {
        storage: multer.memoryStorage(),
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
    upload(req, res, async (error: any) => {
        if (error) {
            if (error.message) {
                // 422 Unprocessable Content
                console.log(error.message)
                return res.status(422).json({ "error": error.message })
            } else {
                return serverError(res, "File upload error.")
            }
        }

        if (!req.file) { return next() }

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
        const fileName = "avatar-" + uniqueSuffix

        await sharp(req.file.buffer)
            .resize({ width: 128, height: 128, fit: "inside" })
            .jpeg({ quality: 100 })
            .toFile(process.env.AVATARS_DIR + "/" + fileName)
            .catch((error) => {
                console.log(error)
                return serverError(res, "File upload error.")
            })

        req.body.avatar = fileName
        next()
    })
}

export default uploadAvatar