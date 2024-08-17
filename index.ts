import dotenv from "dotenv"
import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import mongoose from "mongoose"
import session from "express-session"
//
import postRoutes from "./routes/post"
import userRoutes from "./routes/user"
import blogSettingsRoutes from "./routes/blogSettings"
import { serverError } from "./helpers/serverError"
import BlogSettings from "./models/blogSettings"
import { defaultBlogSettings } from "./interfaces/blogSettings"

dotenv.config()

if(!process.env.SESSION_SECRET) {
    throw new Error("Environment variable SESSION_SECRET required.")
}

if(!process.env.MONGODB_URL) {
    throw new Error("Environment variable MONGODB_URL required.")
}

// env defaults
process.env.PORT = process.env.PORT || "3000"
process.env.CORS_ORIGIN_CLIENT = process.env.CORS_ORIGIN_CLIENT || "true"
process.env.SECURE_COOKIES = process.env.SECURE_COOKIES || "false"
process.env.PUBLIC_DIR = process.env.PUBLIC_DIR || "public/"
process.env.AVATARS_DIR = process.env.AVATARS_DIR || "public/avatars"
process.env.THUMBS_DIR = process.env.THUMBS_DIR || "public/thumbs"

const app = express()
const PORT = process.env.PORT

// Fake delay
// app.use((req: Request, res: Response, next: NextFunction) => {
//     setTimeout(next, 1000)
// })

// TODO Better logging?
function now() {
    return new Date().toISOString();
}
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`TIME: [${now()}] - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`)
    next()
})

// Cors and options
app.use(cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN_CLIENT === "true" ? true : false
}))
app.use(express.urlencoded({ extended: true, limit: "5mb" }))
app.use(express.json())

// Interface for session content
// see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts
declare module "express-session" {
    interface SessionData {
        userId: string | null
    }
}
// Session setup
// TODO Change store
app.use(session({
    name: "id",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    unset: "destroy",
    cookie: {
        sameSite: 'strict',
        secure: process.env.SECURE_COOKIES === "true" ? true : false,
        maxAge: 24 * 60 * 60 * 1000 // ms
        // maxAge: 1000 * 10
    }
}))

// Public files
app.use(express.static('public'))

// Routes
app.use("/posts", postRoutes)
app.use("/users", userRoutes)
app.use("/blog", blogSettingsRoutes)
// Invalid route / Not found
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log("Invalid route")
    res.status(404).json({ "error": "Route not found." })
})
// If everything else fails
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    serverError(res, err.stack)
})

// Connect to DB and listen for requests
mongoose.connect(process.env.MONGODB_URL)
    .then(async () => {
        console.log("Connected to MongoDB.")

        // Initialize blog settings if they don't exist
        if (! await BlogSettings.exists({})) {
            BlogSettings.create(defaultBlogSettings)
        }

        // Start listening
        app.listen(PORT, () => {
            console.log("Listening on port " + PORT + "...")
        }).on("error", (error) => {
            console.error(error)
            throw new Error(error.message)
        })
    })
    .catch(error => {
        console.error(error)
        console.error("Error connecting to MongoDB.")
    })
