import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import mongoose from "mongoose"
import session from "express-session"
// Routes and config
import postRoutes from "./routes/post"
import userRoutes from "./routes/user"
import config from "./config"

const app = express()
const PORT = config.port

// Fake delay
// app.use((req: Request, res: Response, next: NextFunction) => {
//     setTimeout(next, 1000)
// })

// TODO Better logging?
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`)
    next()
})

// Cors and options
app.use(cors({
    credentials: true,
    origin: config.client
}))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Interface for session content
declare module "express-session" {
    interface Session {
        userId: string | null
    }
}
// Session setup
// TODO Change store
app.use(session({
    name: "id",
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    unset: "destroy",
    cookie: {
        sameSite: 'strict',
        secure: false, // set to true for https
        maxAge: 24 * 60 * 60 * 1000 // ms
    }
}))

// Routes
app.use("/posts", postRoutes)
app.use("/users", userRoutes)
// Invalid route / Not found
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log("Not found")
    res.status(404).json({ "error": "Not found" })
})
// If everything else fails
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).json({ "error": "Server error!" })
})

// Connect to DB and listen for requests
mongoose.connect(config.mongoose.url, config.mongoose.options)
    .then(res => {
        console.log("Connected to MongoDB.")
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
