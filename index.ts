import dotenv from "dotenv"
import app from "./app"
import mongoose from "mongoose"
//
import BlogSettings from "./models/blogSettings"
import { defaultBlogSettings } from "./interfaces/blogSettings"

dotenv.config()

if (!process.env.MONGODB_URL) {
    throw new Error("Environment variable MONGODB_URL required.")
}

// env defaults
process.env.PORT = process.env.PORT || "3000"

const PORT = process.env.PORT

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