import { Request, Response, NextFunction } from "express"
import multer from "multer";
import sharp from "sharp";
// 
import { serverError } from "../helpers/serverError";

const upload = multer(
    {
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 1 * 1024 * 1024 * 2,
            files: 1
        },
        fileFilter: (req, file, cb) => {
            if (["jpg", "jpeg", "png"].some(ext => file.mimetype.includes(ext))) {
                return cb(null, true)
            }
            return cb(new Error("Invalid file format."))
        }
    })
    .single("thumbnail")

// upload image to mamory, resizes it and saves to disk
function uploadThumbnail(req: Request, res: Response, next: NextFunction) {
    upload(req, res, async (error: any) => {
        if (error) {
            if (error && error.message) {
                // 422 Unprocessable Content
                console.log(error.message)
                return res.status(422).json({ "error": error.message })
            } else {
                return serverError(res, "File upload error.")
            }
        }

        if (!req.file) { return next() }

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
        const fileName = "thumbnail-" + uniqueSuffix

        await sharp(req.file.buffer)
            .resize({ width: 512, height: 512, fit: "inside" })
            .jpeg({ quality: 100 })
            .toFile(process.env.THUMBS_DIR + "/" + fileName + "-512")
            .catch((error) => {
                console.log(error)
                return serverError(res, "File upload error.")
            })

        await sharp(req.file.buffer)
            .resize({ width: 200, height: 200 })
            .jpeg({ quality: 90 })
            .toFile(process.env.THUMBS_DIR + "/" + fileName)
            .catch((error) => {
                console.log(error)
                return serverError(res, "File upload error.")
            })

        req.body.thumbnail = fileName
        next()
    })
}

export default uploadThumbnail