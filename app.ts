import dotenv from "dotenv"
import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import session from "express-session"
import MemoryStore from "memorystore"
//
import postRoutes from "./routes/post"
import userRoutes from "./routes/user"
import blogSettingsRoutes from "./routes/blogSettings"
import { serverError } from "./helpers/serverError"

dotenv.config()

// this function is so Jest can test it
export function setupSessionSecret() {
    if (!process.env.SESSION_SECRET) {
        throw new Error("Environment variable SESSION_SECRET required.")
    } else {
        return process.env.SESSION_SECRET
    }
}

const sessionSecret = setupSessionSecret()

// env defaults
process.env.CORS_ORIGIN_CLIENT = process.env.CORS_ORIGIN_CLIENT || "true"
process.env.SECURE_COOKIES = process.env.SECURE_COOKIES || "false"
process.env.PUBLIC_DIR = process.env.PUBLIC_DIR || "public/"
process.env.AVATARS_DIR = process.env.AVATARS_DIR || process.env.PUBLIC_DIR + "avatars"
process.env.THUMBS_DIR = process.env.THUMBS_DIR || process.env.PUBLIC_DIR + "thumbs"

const app = express()

// Fake delay
// app.use((req: Request, res: Response, next: NextFunction) => {
//     setTimeout(next, 1000)
// })

// TODO Better logging?
function now() {
    return new Date().toISOString();
}
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`TIME: [${now()}] - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.ip}]`)
    next()
})

// Cors and options
app.use(cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN_CLIENT === "true" ? true : false
}))
app.use(express.urlencoded({ extended: true, limit: "5mb" }))
app.use(express.json())

// Trust proxy on local network (reverse proxy)
app.set("trust proxy", "loopback")

// Interface for session content
// see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts
declare module "express-session" {
    interface SessionData {
        userId: string | null
    }
}
// Session setup
const MemStore = MemoryStore(session)
app.use(session({
    name: "id",
    store: new MemStore({
        checkPeriod: 24 * 60 * 60 * 1000 // prune expired entries
    }),
    secret: sessionSecret,
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
app.use(express.static(process.env.PUBLIC_DIR))

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
    // Ignoring because I have no idea how to trigger this
    /* istanbul ignore next */
    serverError(res, err.stack)
})

export default app