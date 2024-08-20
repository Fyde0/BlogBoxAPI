import mongoose from "mongoose"
import User from "../models/user"
import Post from "../models/post"

export async function connectToTestDB() {
    if (!process.env.MONGODB_URL_TESTING) {
        throw new Error("Environment variable MONGODB_URL_TESTING required.")
    }

    await mongoose.connect(process.env.MONGODB_URL_TESTING)
    console.log("Connected to MongoDB.")
}

export async function emptyDB() {
    // empty database and close
    await User.deleteMany({})
    await Post.deleteMany({})
    await mongoose.connection.close()
}

export const requestHeaders = { "Content-Type": "application/json" }